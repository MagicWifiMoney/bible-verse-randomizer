/**
 * Test batch generation with 5 verses
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

async function testGeneration() {
  console.log('🧪 Testing batch generation with 5 verses\n');
  
  // Load priority list and take first 5
  const priorityList = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/priority-1000.json'), 'utf-8'));
  const testVerses = priorityList.slice(10, 15); // Skip first 10 (already done in Step 1)
  
  let successful = 0;
  let failed = 0;
  
  for (const verse of testVerses) {
    console.log(`\n📖 ${verse.book} ${verse.chapter}:${verse.verse}`);
    
    try {
      // Generate content
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

      console.log(`   🤖 Calling API...`);
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
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
      
      console.log(`   ✅ Content generated (${content.length} chars)`);
      console.log(`      Context: ${generated.context.length} chars`);
      console.log(`      Meaning: ${generated.meaning.length} chars`);
      console.log(`      Application: ${generated.application.length} chars`);
      console.log(`      Prayer: ${generated.prayer.length} chars`);
      console.log(`      FAQs: ${generated.faqs.length} questions`);
      
      // Save to database
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        await client.query(
          `UPDATE verses 
           SET context = $1, 
               meaning = $2, 
               application = $3, 
               prayer = $4,
               updated_at = NOW()
           WHERE id = $5`,
          [generated.context, generated.meaning, generated.application, generated.prayer, verse.id]
        );
        
        for (let i = 0; i < generated.faqs.length; i++) {
          const faq = generated.faqs[i];
          await client.query(
            `INSERT INTO faqs (entity_type, entity_id, question, answer, order_index, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (entity_type, entity_id, question) DO UPDATE
             SET answer = $3, order_index = $5, updated_at = NOW()`,
            ['verse', verse.id, faq.question, faq.answer, i]
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
      
      successful++;
      
      // Rate limit: wait 6 seconds between requests
      if (testVerses.indexOf(verse) < testVerses.length - 1) {
        console.log(`   ⏳ Waiting 6s...`);
        await new Promise(resolve => setTimeout(resolve, 6000));
      }
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Test Complete`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`   Successful: ${successful}/${testVerses.length}`);
  console.log(`   Failed: ${failed}/${testVerses.length}\n`);
  
  await pool.end();
}

testGeneration().catch(console.error);
