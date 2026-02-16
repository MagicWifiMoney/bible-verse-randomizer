/**
 * Quick test with 2 verses
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

async function quickTest() {
  console.log('🧪 Quick test with 2 verses\n');
  
  const priorityList = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/priority-1000.json'), 'utf-8'));
  const testVerses = priorityList.slice(10, 12); // 2 verses
  
  for (const verse of testVerses) {
    console.log(`\n📖 ${verse.book} ${verse.chapter}:${verse.verse}`);
    console.log(`   Text: ${verse.text_niv.substring(0, 60)}...`);
    
    const prompt = `Generate comprehensive content for this Bible verse:

**Verse:** ${verse.book} ${verse.chapter}:${verse.verse}
**Text (NIV):** ${verse.text_niv}

Please provide (keep it concise but meaningful):

1. **Context** (150 words): Historical background
2. **Meaning** (300 words): Theological explanation  
3. **Application** (300 words): Practical application
4. **Prayer** (150 words): Prayer based on this verse
5. **FAQs** (4 questions with 80-word answers)

Format as JSON with keys: context, meaning, application, prayer, faqs (array of {question, answer})`;

    console.log(`   🤖 Generating (this takes ~10s)...`);
    
    const startTime = Date.now();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3500,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ Generated in ${elapsed}s`);
    
    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const generated = JSON.parse(jsonMatch[0]);
    
    console.log(`      Context: ${generated.context.length} chars`);
    console.log(`      Meaning: ${generated.meaning.length} chars`);
    console.log(`      Application: ${generated.application.length} chars`);
    console.log(`      Prayer: ${generated.prayer.length} chars`);
    console.log(`      FAQs: ${generated.faqs.length}`);
    
    // Save to database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        `UPDATE verses 
         SET context = $1, meaning = $2, application = $3, prayer = $4
         WHERE id = $5`,
        [generated.context, generated.meaning, generated.application, generated.prayer, verse.id]
      );
      
      // Delete existing FAQs for this verse first
      await client.query(
        `DELETE FROM faqs WHERE entity_type = $1 AND entity_id = $2`,
        ['verse', verse.id]
      );
      
      // Insert new FAQs
      for (let i = 0; i < generated.faqs.length; i++) {
        await client.query(
          `INSERT INTO faqs (entity_type, entity_id, question, answer, order_index, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          ['verse', verse.id, generated.faqs[i].question, generated.faqs[i].answer, i]
        );
      }
      
      await client.query('COMMIT');
      console.log(`   💾 Saved to database`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  console.log(`\n✅ Test complete!`);
  await pool.end();
}

quickTest().catch(e => { console.error('❌', e.message); process.exit(1); });
