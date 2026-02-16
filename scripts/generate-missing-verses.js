/**
 * Generate Missing Verses
 */

const OpenAI = require('openai');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const MISSING_VERSES = [
  'psalms-23-1',
  'proverbs-3-5',
  'proverbs-3-6'
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a Biblical scholar and content writer who creates engaging, thoughtful content about Bible verses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const responseText = completion.choices[0].message.content;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      console.error('❌ Could not extract JSON from response');
      return null;
    }
    
    const content = JSON.parse(jsonMatch[1]);
    const totalWords = [content.context, content.meaning, content.application, content.prayer].join(' ').split(/\s+/).length;
    
    console.log(`✅ Content generated! (${totalWords} words)`);
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
    `, [content.context, content.meaning, content.application, content.prayer, slug]);
    
    const verseIdResult = await pool.query('SELECT id FROM verses WHERE slug = $1', [slug]);
    const verseId = verseIdResult.rows[0].id;
    await pool.query('DELETE FROM faqs WHERE entity_type = $1 AND entity_id = $2', ['verse', verseId]);
    
    for (let i = 0; i < content.faqs.length; i++) {
      const faq = content.faqs[i];
      await pool.query(`
        INSERT INTO faqs (entity_type, entity_id, question, answer, order_index)
        VALUES ($1, $2, $3, $4, $5)
      `, ['verse', verseId, faq.question, faq.answer, i]);
    }
    
    console.log(`💾 Saved to database: ${slug}\n`);
  } catch (error) {
    console.error(`❌ Error saving to database:`, error.message);
  }
}

async function main() {
  console.log('🚀 Generating Missing Verses\n');
  
  let successCount = 0;
  
  for (const slug of MISSING_VERSES) {
    try {
      const result = await pool.query(
        'SELECT book, chapter, verse, text_kjv FROM verses WHERE slug = $1',
        [slug]
      );
      
      if (result.rows.length === 0) {
        console.error(`⚠️  Verse not found: ${slug}`);
        continue;
      }
      
      const verse = result.rows[0];
      const content = await generateContent(verse);
      
      if (content) {
        await saveToDatabase(slug, content);
        successCount++;
      }
      
      if (MISSING_VERSES.indexOf(slug) < MISSING_VERSES.length - 1) {
        console.log('⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error.message);
    }
  }
  
  console.log(`\n✅ Complete! Generated ${successCount}/${MISSING_VERSES.length} verses\n`);
  await pool.end();
}

main().catch(console.error);
