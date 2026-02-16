/**
 * Batch Generate 1,000 Verses with Anthropic Claude
 * 
 * Features:
 * - Uses priority list from create-priority-list.js
 * - Rate limiting: ~10 requests/min
 * - Progress tracking and checkpoints
 * - Resume capability
 * - Saves to database + JSON backup
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

const RATE_LIMIT_MS = 6000; // 10 per minute = 6 seconds per request
const BATCH_SIZE = 50;
const CHECKPOINT_FILE = path.join(__dirname, '../data/batch-checkpoint.json');
const PROGRESS_FILE = path.join(__dirname, '../data/batch-progress.json');

let stats = {
  total: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  startTime: Date.now(),
  errors: []
};

async function generateVerseContent(verse) {
  const prompt = `Generate comprehensive content for this Bible verse:

**Verse:** ${verse.book} ${verse.chapter}:${verse.verse}
**Text (NIV):** ${verse.text_niv}

Please provide:

1. **Context** (200 words): Historical and literary background. When was this written? Who was the audience? What was happening?

2. **Meaning** (400 words): Deep theological explanation. What does this verse mean? What truth is it revealing?

3. **Application** (400 words): Practical application for modern life. How can someone apply this today? What difference should it make?

4. **Prayer** (200 words): A heartfelt prayer based on this verse that someone could pray.

5. **FAQs** (4 questions with 100-word answers each):
   - Common questions people ask about this verse
   - Provide clear, helpful answers

Format as JSON:
{
  "context": "...",
  "meaning": "...",
  "application": "...",
  "prayer": "...",
  "faqs": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse JSON response
    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const generated = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!generated.context || !generated.meaning || !generated.application || !generated.prayer || !generated.faqs) {
      throw new Error('Missing required fields in generated content');
    }
    
    if (!Array.isArray(generated.faqs) || generated.faqs.length < 4) {
      throw new Error('Need at least 4 FAQs');
    }
    
    return generated;
    
  } catch (error) {
    console.error(`   ❌ API error for ${verse.slug}:`, error.message);
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

function saveCheckpoint(index) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastIndex: index, timestamp: new Date().toISOString() }, null, 2));
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
}

async function processBatch() {
  console.log('🚀 Starting batch generation for 1,000 verses\n');
  console.log(`📋 Configuration:`);
  console.log(`   Rate limit: ${60000 / RATE_LIMIT_MS} requests/minute`);
  console.log(`   Batch size: ${BATCH_SIZE} verses`);
  console.log(`   Model: claude-sonnet-4-20250514\n`);
  
  // Load priority list
  const priorityList = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/priority-1000.json'), 'utf-8'));
  stats.total = priorityList.length;
  
  // Check for checkpoint
  const startIndex = loadCheckpoint();
  if (startIndex > 0) {
    console.log(`📍 Resuming from verse ${startIndex + 1}/${stats.total}\n`);
  }
  
  // Process verses
  for (let i = startIndex; i < priorityList.length; i++) {
    const verse = priorityList[i];
    stats.processed = i + 1;
    
    const progress = ((stats.processed / stats.total) * 100).toFixed(1);
    console.log(`\n[${stats.processed}/${stats.total}] (${progress}%) ${verse.book} ${verse.chapter}:${verse.verse}`);
    
    try {
      // Generate content
      console.log(`   🤖 Generating...`);
      const content = await generateVerseContent(verse);
      
      // Save to database
      console.log(`   💾 Saving to database...`);
      await saveToDatabase(verse, content);
      
      stats.successful++;
      console.log(`   ✅ Success!`);
      
    } catch (error) {
      stats.failed++;
      stats.errors.push({
        verse: `${verse.book} ${verse.chapter}:${verse.verse}`,
        error: error.message
      });
      console.log(`   ❌ Failed: ${error.message}`);
    }
    
    // Save checkpoint every 10 verses
    if (stats.processed % 10 === 0) {
      saveCheckpoint(i);
      saveProgress();
      
      const elapsed = (Date.now() - stats.startTime) / 1000 / 60;
      const rate = stats.processed / elapsed;
      const remaining = stats.total - stats.processed;
      const eta = remaining / rate;
      
      console.log(`\n📊 Progress Report:`);
      console.log(`   Successful: ${stats.successful}/${stats.processed} (${(stats.successful / stats.processed * 100).toFixed(1)}%)`);
      console.log(`   Rate: ${rate.toFixed(1)} verses/minute`);
      console.log(`   ETA: ${Math.round(eta)} minutes\n`);
    }
    
    // Rate limiting (except for last verse)
    if (i < priorityList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
    }
  }
  
  // Final report
  const elapsed = (Date.now() - stats.startTime) / 1000;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ BATCH GENERATION COMPLETE`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`📊 Results:`);
  console.log(`   Total verses: ${stats.total}`);
  console.log(`   Successful: ${stats.successful} (${(stats.successful / stats.total * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${stats.failed}`);
  console.log(`\n⏱️  Duration: ${Math.round(elapsed / 60)} minutes`);
  console.log(`   Average: ${(elapsed / stats.successful).toFixed(1)}s per verse`);
  console.log(`\n💰 Estimated cost: ~$${(stats.successful * 0.04).toFixed(2)}\n`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`   ${err.verse}: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`);
    }
  }
  
  await pool.end();
}

processBatch().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
