/**
 * Sprint 2 Batch 3: Generate 970 Verse Pages (IDs 1941-2910)
 * 
 * Selection criteria:
 * - Verses with IDs 1941-2910 (970 total)
 * - Sequential selection by verse ID
 * 
 * Generated content:
 * - Context (300 words)
 * - Meaning (400 words)
 * - Application (500 words)
 * - Prayer (200 words)
 * - FAQs (5 Q&As)
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

const START_ID = 1941;
const END_ID = 2910;
const TARGET_VERSES = END_ID - START_ID + 1; // 970 verses
const RATE_LIMIT_MS = 6000; // 10 requests/min
const PROGRESS_INTERVAL = 100;
const CHECKPOINT_FILE = path.join(__dirname, '../data/sprint2-batch3-checkpoint.json');
const PROGRESS_FILE = path.join(__dirname, '../data/sprint2-batch3-progress.json');

let stats = {
  total: TARGET_VERSES,
  processed: 0,
  successful: 0,
  failed: 0,
  retries: 0,
  startTime: Date.now(),
  errors: []
};

async function selectVersesByIdRange() {
  console.log(`📋 Selecting verses ${START_ID} to ${END_ID}...\n`);
  
  const result = await pool.query(
    `SELECT id, book, chapter, verse, slug, text_niv, 
            text_kjv, text_esv, text_nasb, text_nlt, text_msg
     FROM verses 
     WHERE id >= $1 AND id <= $2
     AND text_niv IS NOT NULL 
     AND text_kjv IS NOT NULL
     ORDER BY id`,
    [START_ID, END_ID]
  );
  
  const verses = result.rows;
  
  // Count books
  const bookCounts = {};
  verses.forEach(v => {
    bookCounts[v.book] = (bookCounts[v.book] || 0) + 1;
  });
  
  console.log(`✅ Selected ${verses.length} verses\n`);
  console.log(`📚 Books covered:`);
  Object.entries(bookCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([book, count]) => {
      console.log(`   ${book}: ${count} verses`);
    });
  console.log();
  
  return verses;
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
    
    return generated;
    
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
    lastVerseId: verses[index] ? verses[index].id : null,
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
  console.log(`   ⏱️  ETA: ${progress.eta_minutes} minutes`);
  console.log(`   💰 Est. cost so far: $${(stats.successful * 0.06).toFixed(2)}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Report to Mission Control every 100 verses
  if (stats.processed % 100 === 0) {
    console.log(`📡 Reporting to Mission Control...`);
    console.log(`   Batch 3 Progress: ${stats.processed}/${stats.total} verses (${successRate}% success)\n`);
  }
}

async function generateBatch() {
  console.log('🚀 Sprint 2 Batch 3: Generating 970 verse pages\n');
  console.log(`📋 Configuration:`);
  console.log(`   Verse ID range: ${START_ID} - ${END_ID}`);
  console.log(`   Target: ${TARGET_VERSES} verses`);
  console.log(`   Rate limit: ${60000 / RATE_LIMIT_MS} requests/minute`);
  console.log(`   Model: claude-sonnet-4-20250514`);
  console.log(`   Progress interval: every ${PROGRESS_INTERVAL} verses\n`);
  
  // Select verses
  const verses = await selectVersesByIdRange();
  
  if (verses.length !== TARGET_VERSES) {
    console.log(`⚠️  Warning: Expected ${TARGET_VERSES} verses, got ${verses.length}`);
  }
  
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
    console.log(`[${stats.processed}/${stats.total}] (${progress}%) ${verse.book} ${verse.chapter}:${verse.verse} (ID: ${verse.id})`);
    
    try {
      // Generate content
      console.log(`   🤖 Generating AI content...`);
      const content = await generateVerseContent(verse);
      
      // Save to database
      console.log(`   💾 Saving to database...`);
      await saveToDatabase(verse, content);
      
      stats.successful++;
      console.log(`   ✅ Complete!`);
      
    } catch (error) {
      stats.failed++;
      stats.errors.push({
        verse: `${verse.book} ${verse.chapter}:${verse.verse}`,
        id: verse.id,
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
  console.log(`✅ SPRINT 2 BATCH 3 COMPLETE`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`📊 Final Results:`);
  console.log(`   Total verses: ${stats.total}`);
  console.log(`   ✅ Successful: ${stats.successful} (${successRate}%)`);
  console.log(`   ❌ Failed: ${stats.failed}`);
  console.log(`   🔄 Total retries: ${stats.retries}`);
  console.log(`\n⏱️  Duration: ${Math.round(elapsed / 60)} minutes (${(elapsed / 60 / 60).toFixed(1)} hours)`);
  console.log(`   Average: ${(elapsed / stats.successful).toFixed(1)}s per verse`);
  console.log(`\n💰 Estimated cost: $${(stats.successful * 0.06).toFixed(2)}\n`);
  
  if (stats.errors.length > 0) {
    console.log(`❌ Failed Verses (${stats.errors.length}):`);
    stats.errors.slice(0, 20).forEach(err => {
      console.log(`   ${err.verse} (ID: ${err.id}): ${err.error}`);
    });
    if (stats.errors.length > 20) {
      console.log(`   ... and ${stats.errors.length - 20} more`);
    }
    console.log();
  }
  
  // Save final stats
  fs.writeFileSync(
    path.join(__dirname, '../data/sprint2-batch3-final.json'),
    JSON.stringify({ 
      stats, 
      config: { START_ID, END_ID, TARGET_VERSES },
      timestamp: new Date().toISOString() 
    }, null, 2)
  );
  
  await pool.end();
  
  return stats;
}

// Run if called directly
if (require.main === module) {
  generateBatch()
    .then(stats => {
      console.log('🎉 Batch 3 generation completed successfully!');
      console.log(`📡 Final report to Mission Control: ${stats.successful}/${stats.total} verses completed.`);
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateBatch };
