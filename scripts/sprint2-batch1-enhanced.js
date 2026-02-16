/**
 * Sprint 2 Batch 1 - ENHANCED: Generate 970 High-Value Verse Pages
 * 
 * Enhancements:
 * - Internal linking to topics and intents
 * - Meta descriptions for SEO
 * - Schema markup ready
 * - Breadcrumb data
 * - Cost tracking
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

const TARGET_VERSES = 970;
const RATE_LIMIT_MS = 6000; // 10 requests/min
const PROGRESS_INTERVAL = 100;
const CHECKPOINT_FILE = path.join(__dirname, '../data/sprint2-batch1-checkpoint.json');
const PROGRESS_FILE = path.join(__dirname, '../data/sprint2-batch1-progress.json');

// Load topics and intents for internal linking
let TOPICS = [];
let INTENTS = [];

try {
  TOPICS = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/topics-master.json'), 'utf-8'));
  INTENTS = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/intents-master.json'), 'utf-8'));
  console.log(`📚 Loaded ${TOPICS.length} topics and ${INTENTS.length} intents for internal linking\n`);
} catch (error) {
  console.warn('⚠️  Could not load topics/intents:', error.message);
}

let stats = {
  total: TARGET_VERSES,
  processed: 0,
  successful: 0,
  failed: 0,
  retries: 0,
  totalCost: 0,
  startTime: Date.now(),
  errors: []
};

// High-priority books (commonly searched and referenced)
const HIGH_PRIORITY_BOOKS = [
  'John', 'Psalms', 'Proverbs', 'Matthew', 'Romans',
  'Genesis', 'Isaiah', 'Philippians', 'Ephesians', 'James',
  '1 Corinthians', 'Galatians', 'Hebrews', 'Luke', 'Acts',
  'Colossians', '1 Peter', '2 Timothy', 'Mark', 'Revelation'
];

async function selectTopVerses() {
  console.log('📋 Selecting top 970 verses based on popularity...\n');
  
  const verses = [];
  
  // Get verses from high-priority books first
  for (const book of HIGH_PRIORITY_BOOKS) {
    if (verses.length >= TARGET_VERSES) break;
    
    const result = await pool.query(
      `SELECT id, book, chapter, verse, slug, text_niv, 
              text_kjv, text_esv, text_nasb, text_nlt, text_msg,
              popularity_score
       FROM verses 
       WHERE book = $1 
       AND text_niv IS NOT NULL 
       AND text_kjv IS NOT NULL
       AND (context IS NULL OR context = '')
       ORDER BY popularity_score DESC NULLS LAST, chapter, verse
       LIMIT 100`,
      [book]
    );
    
    console.log(`   ${book}: ${result.rows.length} verses`);
    verses.push(...result.rows);
  }
  
  // Trim to exactly 970
  const selected = verses.slice(0, TARGET_VERSES);
  
  console.log(`\n✅ Selected ${selected.length} verses`);
  console.log(`   Books covered: ${new Set(selected.map(v => v.book)).size}\n`);
  
  return selected;
}

function findRelatedTopics(verseText, context, meaning, application) {
  // Combine all text for analysis
  const combinedText = `${verseText} ${context} ${meaning} ${application}`.toLowerCase();
  
  // Find matching topics (top 5 by relevance)
  const matches = TOPICS
    .map(topic => {
      const topicWords = topic.title.toLowerCase().split(/\s+/);
      let score = 0;
      
      topicWords.forEach(word => {
        if (word.length > 3) { // Skip short words
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matchCount = (combinedText.match(regex) || []).length;
          score += matchCount * topic.searchVolume || 0;
        }
      });
      
      return { ...topic, relevanceScore: score };
    })
    .filter(t => t.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
  
  return matches;
}

function findRelatedIntents(verseText, context, meaning, application) {
  // Combine all text for analysis
  const combinedText = `${verseText} ${context} ${meaning} ${application}`.toLowerCase();
  
  // Find matching intents (top 3 by relevance)
  const matches = INTENTS
    .map(intent => {
      const intentWords = intent.title.toLowerCase().split(/\s+/);
      let score = 0;
      
      intentWords.forEach(word => {
        if (word.length > 3) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matchCount = (combinedText.match(regex) || []).length;
          score += matchCount * (intent.searchVolume || 0);
        }
      });
      
      return { ...intent, relevanceScore: score };
    })
    .filter(i => i.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);
  
  return matches;
}

function generateMetaDescription(verse, meaning) {
  // Extract first 150 chars of meaning for meta description
  const clean = meaning.replace(/\n/g, ' ').trim();
  const desc = clean.length > 150 
    ? clean.substring(0, 147) + '...' 
    : clean;
  
  return `${verse.book} ${verse.chapter}:${verse.verse} meaning and application. ${desc}`;
}

async function generateVerseContent(verse, retryCount = 0) {
  const prompt = `Generate comprehensive content for this Bible verse:

**Verse Reference:** ${verse.book} ${verse.chapter}:${verse.verse}
**NIV:** ${verse.text_niv}
**KJV:** ${verse.text_kjv || '(not available)'}

Please provide high-quality, theologically accurate content:

1. **Context** (~300 words): 
   - Historical and literary background
   - Who wrote it and when?
   - What was happening at the time?
   - How does it fit in the broader narrative?

2. **Meaning** (~400 words):
   - Deep theological explanation
   - What is God revealing here?
   - Key words and their significance
   - How does this relate to the gospel?

3. **Application** (~500 words):
   - Practical application for modern believers
   - How can someone live this out today?
   - Specific examples and scenarios
   - Action steps and reflection questions

4. **Prayer** (~200 words):
   - A heartfelt, biblically-grounded prayer based on this verse
   - Personal and applicable
   - Includes adoration, confession, thanksgiving, and supplication

5. **FAQs** (5 questions with detailed answers):
   - Common questions people ask about this verse
   - Clear, helpful, biblically-sound answers (100-150 words each)
   - Address both theological and practical concerns

Format your response as JSON:
{
  "context": "...",
  "meaning": "...",
  "application": "...",
  "prayer": "...",
  "faqs": [
    {
      "question": "...",
      "answer": "..."
    },
    {
      "question": "...",
      "answer": "..."
    },
    {
      "question": "...",
      "answer": "..."
    },
    {
      "question": "...",
      "answer": "..."
    },
    {
      "question": "...",
      "answer": "..."
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Calculate cost (approximate)
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015); // Claude Sonnet 4 pricing
    stats.totalCost += cost;

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const generated = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!generated.context || !generated.meaning || !generated.application || 
        !generated.prayer || !generated.faqs) {
      throw new Error('Missing required fields in generated content');
    }
    
    if (!Array.isArray(generated.faqs) || generated.faqs.length < 5) {
      throw new Error('Need at least 5 FAQs');
    }
    
    // Validate word counts (roughly)
    const contextWords = generated.context.split(/\s+/).length;
    const meaningWords = generated.meaning.split(/\s+/).length;
    const applicationWords = generated.application.split(/\s+/).length;
    const prayerWords = generated.prayer.split(/\s+/).length;
    
    if (contextWords < 200 || meaningWords < 300 || applicationWords < 400 || prayerWords < 150) {
      console.log(`   ⚠️  Content too short (C:${contextWords} M:${meaningWords} A:${applicationWords} P:${prayerWords})`);
      if (retryCount < 2) {
        console.log(`   🔄 Retrying (attempt ${retryCount + 2}/3)...`);
        stats.retries++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateVerseContent(verse, retryCount + 1);
      }
    }
    
    // Add internal linking and SEO metadata
    const relatedTopics = findRelatedTopics(verse.text_niv, generated.context, generated.meaning, generated.application);
    const relatedIntents = findRelatedIntents(verse.text_niv, generated.context, generated.meaning, generated.application);
    const metaDescription = generateMetaDescription(verse, generated.meaning);
    
    return {
      ...generated,
      seo: {
        metaDescription,
        relatedTopics: relatedTopics.map(t => ({ slug: t.slug, title: t.title })),
        relatedIntents: relatedIntents.map(i => ({ slug: i.slug, title: i.title }))
      },
      tokens: { input: inputTokens, output: outputTokens, cost }
    };
    
  } catch (error) {
    if (retryCount < 2) {
      console.log(`   ⚠️  Error: ${error.message}`);
      console.log(`   🔄 Retrying (attempt ${retryCount + 2}/3)...`);
      stats.retries++;
      await new Promise(resolve => setTimeout(resolve, 3000));
      return generateVerseContent(verse, retryCount + 1);
    }
    throw error;
  }
}

async function saveToDatabase(verse, content) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update verse with generated content
    await client.query(
      `UPDATE verses 
       SET context = $1, 
           meaning = $2, 
           application = $3, 
           prayer = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [content.context, content.meaning, content.application, content.prayer, verse.id]
    );
    
    // Delete existing FAQs first
    await client.query(
      'DELETE FROM faqs WHERE entity_type = $1 AND entity_id = $2',
      ['verse', verse.id]
    );
    
    // Insert FAQs
    for (let i = 0; i < content.faqs.length; i++) {
      const faq = content.faqs[i];
      await client.query(
        `INSERT INTO faqs (entity_type, entity_id, question, answer, order_index, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        ['verse', verse.id, faq.question, faq.answer, i]
      );
    }
    
    // Store SEO metadata in generated_content table
    await client.query(
      `INSERT INTO generated_content (
        page_type, entity_id, slug, title, meta_description, 
        content_json, published, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
      ON CONFLICT (slug) DO UPDATE SET
        meta_description = EXCLUDED.meta_description,
        content_json = EXCLUDED.content_json,
        last_updated = NOW()`,
      [
        'verse',
        verse.id,
        verse.slug,
        `${verse.book} ${verse.chapter}:${verse.verse}`,
        content.seo.metaDescription,
        JSON.stringify({
          relatedTopics: content.seo.relatedTopics,
          relatedIntents: content.seo.relatedIntents,
          tokens: content.tokens
        })
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

function saveCheckpoint(index, verses) {
  const checkpoint = {
    lastIndex: index,
    timestamp: new Date().toISOString(),
    lastVerse: verses[index] ? `${verses[index].book} ${verses[index].chapter}:${verses[index].verse}` : null
  };
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    return data.lastIndex || 0;
  }
  return 0;
}

function saveProgress() {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const rate = stats.processed > 0 ? stats.processed / (elapsed / 60) : 0;
  const remaining = stats.total - stats.processed;
  const eta = rate > 0 ? (remaining / rate) : 0;
  
  const progress = {
    ...stats,
    elapsed_seconds: Math.round(elapsed),
    rate_per_minute: rate.toFixed(2),
    eta_minutes: Math.round(eta),
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  
  return progress;
}

function logProgress() {
  const progress = saveProgress();
  const successRate = stats.processed > 0 ? (stats.successful / stats.processed * 100).toFixed(1) : 0;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 PROGRESS CHECKPOINT - ${stats.processed}/${stats.total} verses`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   ✅ Successful: ${stats.successful} (${successRate}%)`);
  console.log(`   ❌ Failed: ${stats.failed}`);
  console.log(`   🔄 Retries: ${stats.retries}`);
  console.log(`   ⚡ Rate: ${progress.rate_per_minute} verses/min`);
  console.log(`   ⏱️  ETA: ${progress.eta_minutes} minutes (${(progress.eta_minutes / 60).toFixed(1)} hours)`);
  console.log(`   💰 Cost so far: $${stats.totalCost.toFixed(2)}`);
  console.log(`${'='.repeat(60)}\n`);
}

async function generateBatch() {
  console.log('🚀 Sprint 2 Batch 1: Generating 970 verse pages (ENHANCED)\n');
  console.log(`📋 Configuration:`);
  console.log(`   Target: ${TARGET_VERSES} verses`);
  console.log(`   Rate limit: ${60000 / RATE_LIMIT_MS} requests/minute`);
  console.log(`   Model: claude-sonnet-4-20250514`);
  console.log(`   Progress interval: every ${PROGRESS_INTERVAL} verses`);
  console.log(`   Internal linking: ${TOPICS.length} topics, ${INTENTS.length} intents\n`);
  
  // Select verses
  const verses = await selectTopVerses();
  
  // Check for checkpoint
  const startIndex = loadCheckpoint();
  if (startIndex > 0) {
    console.log(`📍 Resuming from verse ${startIndex + 1}/${verses.length}\n`);
    stats.processed = startIndex;
  }
  
  // Process each verse
  for (let i = startIndex; i < verses.length; i++) {
    const verse = verses[i];
    stats.processed = i + 1;
    
    const progress = ((stats.processed / stats.total) * 100).toFixed(1);
    console.log(`[${stats.processed}/${stats.total}] (${progress}%) ${verse.book} ${verse.chapter}:${verse.verse}`);
    
    try {
      // Generate content
      console.log(`   🤖 Generating AI content...`);
      const content = await generateVerseContent(verse);
      
      // Save to database
      console.log(`   💾 Saving to database...`);
      await saveToDatabase(verse, content);
      
      stats.successful++;
      console.log(`   ✅ Complete! (${content.seo.relatedTopics.length} topics, ${content.seo.relatedIntents.length} intents, $${content.tokens.cost.toFixed(4)})`);
      
    } catch (error) {
      stats.failed++;
      stats.errors.push({
        verse: `${verse.book} ${verse.chapter}:${verse.verse}`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`   ❌ Failed after retries: ${error.message}`);
    }
    
    // Save checkpoint every 10 verses
    if (stats.processed % 10 === 0) {
      saveCheckpoint(i, verses);
    }
    
    // Progress report every 100 verses
    if (stats.processed % PROGRESS_INTERVAL === 0) {
      logProgress();
    }
    
    // Rate limiting
    if (i < verses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
    }
  }
  
  // Final report
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const successRate = (stats.successful / stats.total * 100).toFixed(1);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ SPRINT 2 BATCH 1 COMPLETE`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`📊 Final Results:`);
  console.log(`   Total verses: ${stats.total}`);
  console.log(`   ✅ Successful: ${stats.successful} (${successRate}%)`);
  console.log(`   ❌ Failed: ${stats.failed}`);
  console.log(`   🔄 Total retries: ${stats.retries}`);
  console.log(`\n⏱️  Duration: ${Math.round(elapsed / 60)} minutes (${(elapsed / 60 / 60).toFixed(1)} hours)`);
  console.log(`   Average: ${(elapsed / stats.successful).toFixed(1)}s per verse`);
  console.log(`\n💰 Total cost: $${stats.totalCost.toFixed(2)}\n`);
  
  if (stats.errors.length > 0) {
    console.log(`❌ Failed Verses (${stats.errors.length}):`);
    stats.errors.slice(0, 20).forEach(err => {
      console.log(`   ${err.verse}: ${err.error}`);
    });
    if (stats.errors.length > 20) {
      console.log(`   ... and ${stats.errors.length - 20} more`);
    }
    console.log();
  }
  
  // Save final stats
  fs.writeFileSync(
    path.join(__dirname, '../data/sprint2-batch1-final.json'),
    JSON.stringify({ stats, timestamp: new Date().toISOString() }, null, 2)
  );
  
  await pool.end();
  
  return stats;
}

// Run if called directly
if (require.main === module) {
  generateBatch()
    .then(stats => {
      console.log('🎉 Batch generation completed successfully!');
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateBatch };
