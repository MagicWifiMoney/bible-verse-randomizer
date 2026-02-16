/**
 * Test Content Generation with Gemini Pro
 * Generate AI content for 10 high-value Bible verses
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Load Gemini API key from ~/.env
const homeEnv = fs.readFileSync(path.join(process.env.HOME, '.env'), 'utf8');
const geminiKey = homeEnv.match(/GEMINI_API_KEY=(.+)/)?.[1];

if (!geminiKey) {
  console.error('❌ GEMINI_API_KEY not found in ~/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const HIGH_VALUE_VERSES = [
  'john-3-16',
  'jeremiah-29-11',
  'philippians-4-13',
  'psalm-23-1',
  'romans-8-28',
  'proverbs-3-5',
  'isaiah-41-10',
  'matthew-6-33',
  '2-timothy-1-7',
  'joshua-1-9'
];

async function generateContent(verse) {
  const prompt = `You are a Biblical scholar and content writer. Generate comprehensive, engaging content for the Bible verse below.

**Verse:** ${verse.book} ${verse.chapter}:${verse.verse}
**Text (KJV):** "${verse.text_kjv}"

Generate the following sections:

**1. CONTEXT (200 words):**
Write about the historical and literary context of this verse. Who wrote it? What was happening when it was written? What book/chapter is it from?

**2. MEANING (400 words):**
Deep dive into what this verse means. Break down key phrases, explain theological significance, discuss different interpretations.

**3. APPLICATION (400 words):**
How can readers apply this verse to their lives today? Give practical examples, real-world scenarios, and actionable insights.

**4. PRAYER (150 words):**
Write a heartfelt prayer inspired by this verse. Make it personal and relatable.

**5. FAQS (4 questions with detailed answers):**
Answer common questions people have about this verse. Each answer should be 100-150 words.

Format your response as JSON:
\`\`\`json
{
  "context": "...",
  "meaning": "...",
  "application": "...",
  "prayer": "...",
  "faqs": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}
\`\`\`

Make it engaging, thoughtful, and SEO-friendly. Use natural language that speaks to both believers and seekers.`;

  console.log(`\n🤖 Generating content for ${verse.book} ${verse.chapter}:${verse.verse}...`);
  
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      console.error('❌ Could not extract JSON from response');
      console.log('Response preview:', responseText.substring(0, 500));
      return null;
    }
    
    const content = JSON.parse(jsonMatch[1]);
    
    // Calculate word counts
    const totalWords = [
      content.context,
      content.meaning,
      content.application,
      content.prayer
    ].join(' ').split(/\s+/).length;
    
    console.log(`✅ Content generated!`);
    console.log(`   Total words: ${totalWords}`);
    console.log(`   Context: ${content.context.split(/\s+/).length} words`);
    console.log(`   Meaning: ${content.meaning.split(/\s+/).length} words`);
    console.log(`   Application: ${content.application.split(/\s+/).length} words`);
    console.log(`   Prayer: ${content.prayer.split(/\s+/).length} words`);
    console.log(`   FAQs: ${content.faqs.length} questions`);
    
    return content;
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return null;
  }
}

async function saveToDatabase(slug, content) {
  try {
    await pool.query(`
      UPDATE verses
      SET 
        context = $1,
        meaning = $2,
        application = $3,
        prayer = $4,
        updated_at = NOW()
      WHERE slug = $5
    `, [
      content.context,
      content.meaning,
      content.application,
      content.prayer,
      slug
    ]);
    
    // Save FAQs
    for (const faq of content.faqs) {
      await pool.query(`
        INSERT INTO faqs (page_type, page_id, question, answer)
        SELECT 'verse', id, $1, $2
        FROM verses
        WHERE slug = $3
        ON CONFLICT (page_type, page_id, question) DO UPDATE
        SET answer = EXCLUDED.answer
      `, [faq.question, faq.answer, slug]);
    }
    
    console.log(`💾 Saved to database: ${slug}\n`);
    
  } catch (error) {
    console.error(`❌ Error saving to database:`, error.message);
  }
}

async function main() {
  console.log('🚀 Bible Verse Content Generation - Gemini Pro\n');
  console.log('================================================\n');
  console.log(`📝 Generating content for ${HIGH_VALUE_VERSES.length} high-value verses\n`);
  
  let successCount = 0;
  let totalWords = 0;
  
  for (const slug of HIGH_VALUE_VERSES) {
    try {
      // Get verse from database
      const result = await pool.query(
        'SELECT book, chapter, verse, text_kjv FROM verses WHERE slug = $1',
        [slug]
      );
      
      if (result.rows.length === 0) {
        console.error(`⚠️  Verse not found: ${slug}`);
        continue;
      }
      
      const verse = result.rows[0];
      
      // Generate content
      const content = await generateContent(verse);
      
      if (content) {
        // Save to database
        await saveToDatabase(slug, content);
        successCount++;
        
        // Calculate words for this verse
        const verseWords = [
          content.context,
          content.meaning,
          content.application,
          content.prayer
        ].join(' ').split(/\s+/).length;
        totalWords += verseWords;
      }
      
      // Rate limiting: wait 3 seconds between requests
      if (HIGH_VALUE_VERSES.indexOf(slug) < HIGH_VALUE_VERSES.length - 1) {
        console.log('⏳ Waiting 3 seconds before next verse...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error.message);
    }
  }
  
  console.log('\n================================================');
  console.log(`✅ CHECKPOINT 2 COMPLETE!`);
  console.log(`   Verses generated: ${successCount}/10`);
  console.log(`   Total words: ${totalWords.toLocaleString()}`);
  console.log(`   Average words/verse: ${Math.round(totalWords / successCount)}`);
  console.log(`   Content saved to database`);
  console.log(`   API used: Google Gemini Pro 1.5`);
  console.log('================================================\n');
  
  await pool.end();
}

main().catch(console.error);
