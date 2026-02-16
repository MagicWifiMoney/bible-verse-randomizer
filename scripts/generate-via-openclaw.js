/**
 * Generate Content via OpenClaw Agent (Direct)
 * Since we're running AS Claude, we can generate content directly
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

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
    
    console.log(`✅ Saved to database: ${slug}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error saving to database:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Content Generation via OpenClaw Agent\n');
  console.log('Will fetch verses and output prompts for agent to generate content\n');
  
  const outputDir = path.join(__dirname, '../data/generation-prompts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const slug of HIGH_VALUE_VERSES) {
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
      
      console.log(`\n📖 ${verse.book} ${verse.chapter}:${verse.verse}`);
      console.log(`   "${verse.text_kjv.substring(0, 80)}..."`);
      
      // Create prompt file for agent
      const prompt = {
        slug,
        verse,
        status: 'pending'
      };
      
      fs.writeFileSync(
        path.join(outputDir, `${slug}.json`),
        JSON.stringify(prompt, null, 2)
      );
      
    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error.message);
    }
  }
  
  console.log('\n✅ All verse prompts prepared');
  console.log(`   Output directory: ${outputDir}`);
  console.log('\nNext: Agent will generate content for each verse\n');
  
  await pool.end();
}

main();
