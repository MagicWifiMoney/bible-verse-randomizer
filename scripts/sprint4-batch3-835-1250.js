#!/usr/bin/env node

/**
 * Sprint 4 Batch 3/3: Generate Intent-Verse Associations for Intents 835-1250
 * 
 * Task: For each of 416 intents (835-1250), find and associate 15-25 relevant verses
 * 
 * Generated content per intent:
 * - Verse selection based on intent keywords and semantic matching
 * - Relevance scores (1-100)
 * - Usage notes explaining why each verse fits the intent
 */

const Anthropic = require('@anthropic-ai/sdk');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Batch configuration
const BATCH_START = 835;  // 1-indexed
const BATCH_END = 1250;   // inclusive
const BATCH_SIZE = BATCH_END - BATCH_START + 1; // 416 intents

const VERSES_PER_INTENT_MIN = 15;
const VERSES_PER_INTENT_MAX = 25;
const RATE_LIMIT_MS = 6000; // 10 requests/min for Anthropic
const PROGRESS_INTERVAL = 25;
const CHECKPOINT_FILE = path.join(__dirname, '../data/sprint4-batch3-checkpoint.json');
const PROGRESS_FILE = path.join(__dirname, '../data/sprint4-batch3-progress.json');

let stats = {
  total: BATCH_SIZE,
  processed: 0,
  successful: 0,
  failed: 0,
  totalVerseAssociations: 0,
  retries: 0,
  startTime: Date.now(),
  errors: []
};

// Load intents from master file
function loadIntents() {
  const intentsPath = path.join(__dirname, '../data/intents-master.json');
  const allIntents = JSON.parse(fs.readFileSync(intentsPath, 'utf8'));
  
  // Get our batch (835-1250, so indices 834-1249)
  const batchIntents = allIntents.slice(BATCH_START - 1, BATCH_END);
  
  console.log(`📋 Loaded batch: intents ${BATCH_START}-${BATCH_END}`);
  console.log(`   Total in batch: ${batchIntents.length}`);
  console.log(`   First: "${batchIntents[0].title}" (${batchIntents[0].slug})`);
  console.log(`   Last: "${batchIntents[batchIntents.length-1].title}" (${batchIntents[batchIntents.length-1].slug})\n`);
  
  return batchIntents;
}

// Get or create intent_page ID for a given slug
async function getOrCreateIntentPage(intent) {
  // First check if intent_pages record exists
  const existing = await pool.query(
    'SELECT id FROM intent_pages WHERE slug = $1',
    [`bible-verses-${intent.slug}`]
  );
  
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }
  
  // Create new intent_page
  const result = await pool.query(
    `INSERT INTO intent_pages (category, name, slug, search_volume, competition_score, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id`,
    [
      'generated',
      intent.title,
      `bible-verses-${intent.slug}`,
      intent.searchVolume || 0,
      intent.competition || 0
    ]
  );
  
  return result.rows[0].id;
}

// Extract keywords from intent slug for verse matching
function extractKeywords(intentSlug) {
  const slug = intentSlug.replace(/^for-/, '').replace(/-/g, ' ');
  const keywords = slug.split(' ').filter(w => w.length > 2);
  return keywords;
}

// Pre-filter verses using keyword/text search
async function findCandidateVerses(intent) {
  const keywords = extractKeywords(intent.slug);
  const searchTerms = keywords.join(' | '); // PostgreSQL full-text search format
  
  // Try to find verses matching keywords
  const result = await pool.query(
    `SELECT id, book, chapter, verse, text_niv, text_kjv, slug,
            ts_rank(to_tsvector('english', text_niv), to_tsquery('english', $1)) as rank
     FROM verses 
     WHERE text_niv IS NOT NULL
       AND to_tsvector('english', text_niv) @@ to_tsquery('english', $1)
     ORDER BY rank DESC
     LIMIT 100`,
    [searchTerms]
  );
  
  // If we found candidates, return them
  if (result.rows.length >= 30) {
    return result.rows;
  }
  
  // Fallback: get popular verses
  const fallback = await pool.query(
    `SELECT id, book, chapter, verse, text_niv, text_kjv, slug
     FROM verses 
     WHERE text_niv IS NOT NULL
     ORDER BY RANDOM()
     LIMIT 100`
  );
  
  return fallback.rows;
}

// Use AI to select and rank relevant verses from candidates
async function selectVersesForIntent(intent, retryCount = 0) {
  try {
    // Get candidate verses
    const candidates = await findCandidateVerses(intent);
    console.log(`   Found ${candidates.length} candidate verses`);
    
    // Prepare verse list for AI
    const verseList = candidates.slice(0, 80).map((v, i) => 
      `${i+1}. [ID:${v.id}] ${v.book} ${v.chapter}:${v.verse} - "${v.text_niv.substring(0, 120)}..."`
    ).join('\n');
    
    // Use AI to select the most relevant verses
    const prompt = `You are a biblical scholar curating Bible verses for a specific intent.

**Intent:** "${intent.title}"
**Slug:** ${intent.slug}
**Description:** ${generateIntentDescription(intent.slug)}

**Task:** From the candidate verses below, select 15-25 that are MOST relevant. Consider:
1. Thematic alignment with the intent
2. Practical applicability for the use case
3. Memorability and impact
4. Diversity (mix of OT/NT, different themes)

**Candidate Verses:**
${verseList}

**Output:** Return ONLY a JSON array with this exact format:
[
  {"id": <verseId>, "score": <1-100>, "note": "<why it fits, max 80 chars>"},
  ...
]

Select 15-25 verses. Put the ID numbers exactly as shown in [ID:XXX].`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const selections = JSON.parse(jsonMatch[0]);
    
    // Validate and transform to our format
    const verses = selections.map(s => ({
      verseId: s.id,
      relevanceScore: s.score,
      usageNote: s.note
    }));
    
    if (verses.length < VERSES_PER_INTENT_MIN) {
      throw new Error(`Too few verses selected: ${verses.length}`);
    }
    
    return verses.slice(0, VERSES_PER_INTENT_MAX);
    
  } catch (error) {
    if (retryCount < 2) {
      console.log(`   ⚠️  Retry ${retryCount + 1}/2 for "${intent.title}": ${error.message}`);
      stats.retries++;
      await sleep(RATE_LIMIT_MS * 2);
      return selectVersesForIntent(intent, retryCount + 1);
    }
    throw error;
  }
}

// Generate description for intent based on slug
function generateIntentDescription(slug) {
  const parts = slug.split('-');
  const descriptions = {
    'for-tattoos': 'Bible verses suitable for tattoos - meaningful, concise, memorable',
    'for-weddings': 'Bible verses for wedding ceremonies, vows, and celebrations of marriage',
    'for-funerals': 'Bible verses providing comfort and hope during times of loss',
    'for-comfort': 'Bible verses offering consolation, peace, and reassurance',
    'short': 'Short, concise Bible verses that are easy to remember and share',
    'for-strength': 'Bible verses providing strength, courage, and perseverance',
    'for-healing': 'Bible verses about physical and spiritual healing',
    'for-kids': 'Bible verses appropriate for children - simple, encouraging, foundational',
    'for-teens': 'Bible verses relevant to teenagers - identity, purpose, challenges',
    'for-social-media': 'Bible verses perfect for sharing on social media platforms',
  };
  
  // Check for exact match
  if (descriptions[slug]) {
    return descriptions[slug];
  }
  
  // Generate from parts
  if (slug.includes('for-')) {
    return `Bible verses ${slug.replace(/-/g, ' ')}`;
  }
  
  return `Bible verses related to ${slug.replace(/-/g, ' ')}`;
}

// Save intent-verse associations to database
async function saveIntentVerseAssociations(intentPageId, verseSelections) {
  let saved = 0;
  
  for (const selection of verseSelections) {
    try {
      // Check if association already exists
      const existing = await pool.query(
        'SELECT * FROM intent_verses WHERE intent_id = $1 AND verse_id = $2',
        [intentPageId, selection.verseId]
      );
      
      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(
          `UPDATE intent_verses 
           SET relevance_score = $1, usage_note = $2
           WHERE intent_id = $3 AND verse_id = $4`,
          [
            selection.relevanceScore,
            selection.usageNote,
            intentPageId,
            selection.verseId
          ]
        );
      } else {
        // Insert new
        await pool.query(
          `INSERT INTO intent_verses (intent_id, verse_id, relevance_score, usage_note)
           VALUES ($1, $2, $3, $4)`,
          [
            intentPageId,
            selection.verseId,
            selection.relevanceScore,
            selection.usageNote
          ]
        );
      }
      saved++;
    } catch (error) {
      console.error(`   ❌ Failed to save verse ${selection.verseId}:`, error.message);
    }
  }
  
  return saved;
}

// Process a single intent
async function processIntent(intent, index) {
  try {
    console.log(`\n[${index + 1}/${BATCH_SIZE}] Processing: "${intent.title}"`);
    
    // Get or create intent_page
    const intentPageId = await getOrCreateIntentPage(intent);
    console.log(`   Intent page ID: ${intentPageId}`);
    
    // Select verses using AI
    console.log(`   🤖 Selecting verses with AI...`);
    const verseSelections = await selectVersesForIntent(intent);
    console.log(`   ✅ Selected ${verseSelections.length} verses`);
    
    // Save associations
    console.log(`   💾 Saving to database...`);
    const saved = await saveIntentVerseAssociations(intentPageId, verseSelections);
    console.log(`   ✅ Saved ${saved} verse associations`);
    
    stats.successful++;
    stats.totalVerseAssociations += saved;
    
    return true;
    
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    stats.failed++;
    stats.errors.push({
      intent: intent.slug,
      error: error.message
    });
    return false;
  }
}

// Main processing loop
async function processAll() {
  console.log('🚀 Starting Sprint 4 Batch 3: Intent-Verse Associations\n');
  console.log(`📊 Batch: ${BATCH_START}-${BATCH_END} (${BATCH_SIZE} intents)`);
  console.log(`📈 Target: ${VERSES_PER_INTENT_MIN}-${VERSES_PER_INTENT_MAX} verses per intent`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_MS}ms between AI requests\n`);
  
  const intents = loadIntents();
  
  // Load checkpoint if exists
  let startIndex = 0;
  if (fs.existsSync(CHECKPOINT_FILE)) {
    const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
    startIndex = checkpoint.lastIndex + 1;
    stats = { ...stats, ...checkpoint.stats };
    console.log(`📍 Resuming from checkpoint: index ${startIndex}\n`);
  }
  
  for (let i = startIndex; i < intents.length; i++) {
    await processIntent(intents[i], i);
    stats.processed++;
    
    // Progress report
    if ((i + 1) % PROGRESS_INTERVAL === 0) {
      saveProgress(i);
      printProgress();
    }
    
    // Rate limiting
    if (i < intents.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }
  
  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('✅ BATCH 3 COMPLETE!');
  console.log('='.repeat(60));
  printProgress();
  
  // Cleanup checkpoint
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }
}

function saveProgress(lastIndex) {
  const checkpoint = {
    lastIndex,
    stats,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(stats, null, 2));
}

function printProgress() {
  const elapsed = Date.now() - stats.startTime;
  const avgTime = elapsed / stats.processed;
  const remaining = (BATCH_SIZE - stats.processed) * avgTime;
  
  console.log(`\n📊 Progress Report:`);
  console.log(`   Processed: ${stats.processed}/${BATCH_SIZE} (${Math.round(stats.processed/BATCH_SIZE*100)}%)`);
  console.log(`   Successful: ${stats.successful}`);
  console.log(`   Failed: ${stats.failed}`);
  console.log(`   Total verse associations: ${stats.totalVerseAssociations}`);
  console.log(`   Avg verses/intent: ${Math.round(stats.totalVerseAssociations/stats.successful)}`);
  console.log(`   Retries: ${stats.retries}`);
  console.log(`   Elapsed: ${formatTime(elapsed)}`);
  console.log(`   ETA: ${formatTime(remaining)}`);
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the batch
processAll().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
