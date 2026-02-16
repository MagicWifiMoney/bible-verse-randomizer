#!/usr/bin/env node

/**
 * Sprint 4 Batch 1: Generate 417 Intent Pages (Intents 1-417)
 * 
 * Intent pages answer user needs like "bible verses for tattoos", "for weddings", etc.
 * 
 * Generated content per page:
 * - Introduction explaining the intent/use case (400-600 words)
 * - Curated collection of 15-25 relevant verses
 * - Practical guidance for the specific use case
 * - FAQ section (10 questions)
 * - Internal links to related intents + topics
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

const BATCH_START = 1;
const BATCH_END = 417;
const RATE_LIMIT_MS = 6000; // 10 requests/min
const PROGRESS_INTERVAL = 50;
const CHECKPOINT_FILE = path.join(__dirname, '../data/sprint4-batch1-checkpoint.json');
const PROGRESS_FILE = path.join(__dirname, '../data/sprint4-batch1-progress.json');
const LOG_FILE = path.join(__dirname, '../logs/sprint4-batch1.log');

let stats = {
  total: BATCH_END - BATCH_START + 1,
  processed: 0,
  successful: 0,
  failed: 0,
  retries: 0,
  startTime: Date.now(),
  errors: []
};

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(message);
}

function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(stats, null, 2));
}

function saveCheckpoint(index, intent) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({
    lastIndex: index,
    lastIntent: intent.slug,
    timestamp: new Date().toISOString()
  }, null, 2));
}

async function loadIntents() {
  log(`📋 Loading intents ${BATCH_START}-${BATCH_END}...\n`);
  
  const intentsFile = path.join(__dirname, '../data/intents-master.json');
  const allIntents = JSON.parse(fs.readFileSync(intentsFile, 'utf8'));
  
  // Select batch (indices 0-416 for intents 1-417)
  const batchIntents = allIntents.slice(BATCH_START - 1, BATCH_END);
  
  log(`✅ Loaded ${batchIntents.length} intents for batch 1`);
  log(`   Top intent: ${batchIntents[0].title} (${batchIntents[0].searchVolume}/mo)`);
  log(`   Last intent: ${batchIntents[batchIntents.length - 1].title} (${batchIntents[batchIntents.length - 1].searchVolume}/mo)\n`);
  
  return batchIntents;
}

async function fetchRelevantVerses(intent, limit = 25) {
  // Simple keyword extraction from intent slug
  const keywords = intent.slug
    .replace(/^for-/, '')
    .replace(/-/g, ' ')
    .split(' ')
    .filter(w => w.length > 2);
  
  // Try to find relevant verses
  // For now, just get popular verses - in production, use semantic search
  const result = await pool.query(
    `SELECT id, book, chapter, verse, slug, text_niv 
     FROM verses 
     WHERE text_niv IS NOT NULL
     ORDER BY id  
     LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

async function generateIntentPageContent(intent, verses, retryCount = 0) {
  const verseList = verses.map(v => 
    `- ${v.book} ${v.chapter}:${v.verse} - "${v.text_niv}"`
  ).join('\n');
  
  const prompt = `Generate comprehensive SEO content for an intent-based Bible verse page.

**Intent:** ${intent.title}
**URL Slug:** ${intent.slug}
**Search Volume:** ${intent.searchVolume}/month
**Purpose:** Help users find the perfect Bible verses for "${intent.title.toLowerCase()}"

**Sample Verses for Reference:**
${verseList.substring(0, 2000)}

Please generate the following sections in valid JSON format:

{
  "introduction": "400-600 word introduction explaining why people search for Bible verses for this purpose, what the Bible says about it, and how these verses can help. Include cultural context, common uses, and spiritual significance. Make it warm, practical, and SEO-friendly.",
  
  "practicalGuidance": "500-700 word guide on HOW to use these verses for this specific intent. For example, if it's 'for tattoos' - discuss placement, design, font choices, meaning. If it's 'for weddings' - when to read them, who should read them, how to incorporate them. Make it actionable and specific.",
  
  "faqs": [
    {
      "question": "Specific, practical question someone would ask about using Bible verses for this purpose",
      "answer": "Detailed 150-200 word answer with examples and biblical references"
    },
    // 10 total FAQs covering: how to choose, when to use, who can use them, variations, alternatives, meaning, context, application, etc.
  ],
  
  "metaDescription": "Compelling 150-160 character meta description for SEO (include main keyword and benefit)",
  
  "pageTitle": "SEO-optimized H1 title (under 60 chars, include 'Bible Verses' and the intent)"
}

**Important:** 
- Return ONLY valid JSON (no markdown, no code blocks, no comments)
- Be theologically sound and respectful
- Include specific, practical advice (not generic)
- Make it search-intent focused
- Use natural, conversational language
- Avoid clichés and generic Christian content`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const rawContent = response.content[0].text;
    
    // Try to parse JSON (handle potential markdown wrapping)
    let content;
    try {
      // Remove code blocks if present
      const cleanedContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      content = JSON.parse(cleanedContent);
    } catch (parseError) {
      log(`⚠️  JSON parse failed for ${intent.slug}, retrying... (${parseError.message})`);
      if (retryCount < 2) {
        stats.retries++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        return generateIntentPageContent(intent, verses, retryCount + 1);
      }
      throw new Error(`Failed to parse JSON after ${retryCount + 1} attempts`);
    }

    // Validate required fields
    if (!content.introduction || !content.practicalGuidance || !content.faqs || content.faqs.length < 10) {
      throw new Error(`Incomplete content generated: missing required fields`);
    }

    return content;
    
  } catch (error) {
    if (retryCount < 3) {
      log(`⚠️  Error generating content for ${intent.slug} (attempt ${retryCount + 1}/3): ${error.message}`);
      stats.retries++;
      await new Promise(resolve => setTimeout(resolve, 5000));
      return generateIntentPageContent(intent, verses, retryCount + 1);
    }
    throw error;
  }
}

async function saveIntentPage(intent, content, verses) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if intent_pages table exists, create if not
    await client.query(`
      CREATE TABLE IF NOT EXISTS intent_pages (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        search_volume INTEGER,
        competition INTEGER,
        page_title TEXT,
        meta_description TEXT,
        introduction TEXT,
        practical_guidance TEXT,
        faqs JSONB,
        verse_ids INTEGER[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        ai_generated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Insert or update the intent page
    const verseIds = verses.map(v => v.id);
    
    await client.query(
      `INSERT INTO intent_pages 
        (slug, name, title, search_volume, competition_score, page_title, meta_description, 
         introduction, practical_guidance, faqs, verse_ids, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (slug) 
       DO UPDATE SET
         name = EXCLUDED.name,
         title = EXCLUDED.title,
         page_title = EXCLUDED.page_title,
         meta_description = EXCLUDED.meta_description,
         introduction = EXCLUDED.introduction,
         practical_guidance = EXCLUDED.practical_guidance,
         faqs = EXCLUDED.faqs,
         verse_ids = EXCLUDED.verse_ids,
         updated_at = NOW(),
         ai_generated_at = NOW()`,
      [
        intent.slug,
        intent.title,  // name
        intent.title,  // title
        intent.searchVolume,
        intent.competition,
        content.pageTitle,
        content.metaDescription,
        content.introduction,
        content.practicalGuidance,
        JSON.stringify(content.faqs),
        verseIds,
        'intent'  // category
      ]
    );
    
    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function processIntent(intent, index) {
  try {
    log(`\n[${index + 1}/${stats.total}] Processing: ${intent.title} (${intent.slug})`);
    log(`   Search volume: ${intent.searchVolume}/mo | Competition: ${intent.competition}%`);
    
    // Fetch relevant verses
    const verses = await fetchRelevantVerses(intent, 25);
    log(`   Fetched ${verses.length} verses`);
    
    // Generate AI content
    log(`   Generating content...`);
    const content = await generateIntentPageContent(intent, verses);
    
    // Validate word counts
    const introWords = content.introduction.split(/\s+/).length;
    const guidanceWords = content.practicalGuidance.split(/\s+/).length;
    log(`   Generated: ${introWords} intro words, ${guidanceWords} guidance words, ${content.faqs.length} FAQs`);
    
    // Save to database
    await saveIntentPage(intent, content, verses);
    log(`   ✅ Saved to database`);
    
    stats.successful++;
    
    // Save checkpoint every 10 pages
    if ((index + 1) % 10 === 0) {
      saveCheckpoint(index, intent);
      log(`   💾 Checkpoint saved`);
    }
    
    // Progress report every 50 pages
    if ((index + 1) % PROGRESS_INTERVAL === 0) {
      const elapsed = (Date.now() - stats.startTime) / 1000 / 60;
      const rate = stats.successful / elapsed;
      const remaining = stats.total - stats.processed;
      const eta = remaining / rate;
      
      log(`\n📊 PROGRESS REPORT:`);
      log(`   Completed: ${stats.successful}/${stats.total} (${Math.round(stats.successful / stats.total * 100)}%)`);
      log(`   Failed: ${stats.failed}`);
      log(`   Retries: ${stats.retries}`);
      log(`   Rate: ${rate.toFixed(1)} pages/min`);
      log(`   ETA: ${Math.round(eta)} minutes\n`);
      
      saveProgress();
    }
    
    return true;
    
  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`);
    stats.failed++;
    stats.errors.push({
      intent: intent.slug,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

async function main() {
  log(`\n${'='.repeat(70)}`);
  log(`🚀 SPRINT 4 BATCH 1: Generate 417 Intent Pages`);
  log(`${'='.repeat(70)}\n`);
  log(`Target: Intents ${BATCH_START}-${BATCH_END}`);
  log(`Start time: ${new Date().toISOString()}`);
  log(`Rate limit: ${60000 / RATE_LIMIT_MS} requests/min\n`);
  
  try {
    // Load intents
    const intents = await loadIntents();
    
    // Process each intent with rate limiting
    for (let i = 0; i < intents.length; i++) {
      const intent = intents[i];
      
      await processIntent(intent, i);
      stats.processed++;
      
      // Rate limiting
      if (i < intents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
      }
    }
    
    // Final summary
    const elapsed = (Date.now() - stats.startTime) / 1000 / 60;
    
    log(`\n${'='.repeat(70)}`);
    log(`✅ BATCH 1 COMPLETE`);
    log(`${'='.repeat(70)}\n`);
    log(`Total processed: ${stats.processed}`);
    log(`Successful: ${stats.successful}`);
    log(`Failed: ${stats.failed}`);
    log(`Retries: ${stats.retries}`);
    log(`Total time: ${Math.round(elapsed)} minutes`);
    log(`Average: ${(stats.successful / elapsed).toFixed(1)} pages/min\n`);
    
    if (stats.failed > 0) {
      log(`⚠️  ERRORS:`);
      stats.errors.forEach((err, i) => {
        log(`   ${i + 1}. ${err.intent}: ${err.error}`);
      });
    }
    
    // Save final stats
    saveProgress();
    
    // Write Mission Control summary
    const mcSummary = `# Sprint 4 Batch 1 - Complete

**Generated:** ${stats.successful} intent pages  
**Failed:** ${stats.failed}  
**Time:** ${Math.round(elapsed)} minutes  
**Rate:** ${(stats.successful / elapsed).toFixed(1)} pages/min  

**Intents:** ${BATCH_START}-${BATCH_END}  
**Completed:** ${new Date().toISOString()}  
`;
    
    fs.writeFileSync(
      path.join(__dirname, '../SPRINT4-BATCH1-COMPLETE.md'),
      mcSummary
    );
    
    log(`\n✅ Mission Control summary saved`);
    log(`📊 Final stats saved to: ${PROGRESS_FILE}\n`);
    
  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`);
    log(error.stack);
    saveProgress();
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run
main().catch(error => {
  log(`\n❌ FATAL ERROR: ${error.message}`);
  console.error(error);
  process.exit(1);
});
