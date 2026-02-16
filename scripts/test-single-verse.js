/**
 * Test single verse generation to debug API issues
 */

const Anthropic = require('@anthropic-ai/sdk');
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testSingleVerse() {
  console.log('🧪 Testing single verse generation...\n');
  
  // Get John 1:1
  const result = await pool.query(
    'SELECT id, book, chapter, verse, slug, text_niv, text_kjv FROM verses WHERE book = $1 AND chapter = $2 AND verse = $3',
    ['John', 1, 1]
  );
  
  const verse = result.rows[0];
  console.log(`📖 Verse: ${verse.book} ${verse.chapter}:${verse.verse}`);
  console.log(`   Text: ${verse.text_niv.substring(0, 100)}...`);
  console.log();
  
  const prompt = `Generate content for this Bible verse:

**Verse:** ${verse.book} ${verse.chapter}:${verse.verse}
**NIV:** ${verse.text_niv}

Provide:

1. **Context** (~200 words): Historical background
2. **Meaning** (~300 words): Theological explanation  
3. **Application** (~400 words): Practical application
4. **Prayer** (~150 words): Prayer based on this verse
5. **FAQs** (3 Q&As with ~100 word answers each)

Format as JSON:
{
  "context": "...",
  "meaning": "...",
  "application": "...",
  "prayer": "...",
  "faqs": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}`;

  console.log('🤖 Calling Anthropic API...');
  const startTime = Date.now();
  
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
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ API call completed in ${elapsed}s\n`);
    
    const content = message.content[0].text;
    console.log('📝 Response preview:');
    console.log(content.substring(0, 500) + '...\n');
    
    // Try to parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const generated = JSON.parse(jsonMatch[0]);
      
      const contextWords = generated.context.split(/\s+/).length;
      const meaningWords = generated.meaning.split(/\s+/).length;
      const applicationWords = generated.application.split(/\s+/).length;
      const prayerWords = generated.prayer.split(/\s+/).length;
      
      console.log('📊 Word counts:');
      console.log(`   Context: ${contextWords} words`);
      console.log(`   Meaning: ${meaningWords} words`);
      console.log(`   Application: ${applicationWords} words`);
      console.log(`   Prayer: ${prayerWords} words`);
      console.log(`   FAQs: ${generated.faqs.length} questions`);
      console.log();
      
      console.log('✅ JSON parsing successful!');
      console.log('✅ All required fields present!');
      
    } else {
      console.log('❌ No JSON found in response');
    }
    
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`❌ API call failed after ${elapsed}s`);
    console.log(`   Error: ${error.message}`);
  }
  
  await pool.end();
}

testSingleVerse().catch(console.error);
