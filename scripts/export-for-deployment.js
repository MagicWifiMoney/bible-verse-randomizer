/**
 * Export 10 generated verses as static JSON for deployment
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const VERSE_SLUGS = [
  'john-3-16',
  'jeremiah-29-11',
  'philippians-4-13',
  'psalms-23-1',
  'romans-8-28',
  'proverbs-3-5',
  'isaiah-41-10',
  'matthew-6-33',
  '2-timothy-1-7',
  'joshua-1-9'
];

async function exportVerses() {
  console.log('📦 Exporting 10 verses for static deployment\n');
  
  const verses = {};
  
  for (const slug of VERSE_SLUGS) {
    // Get verse data
    const verseResult = await pool.query(
      'SELECT * FROM verses WHERE slug = $1',
      [slug]
    );
    
    if (verseResult.rows.length === 0) {
      console.error(`❌ Verse not found: ${slug}`);
      continue;
    }
    
    const verse = verseResult.rows[0];
    
    // Get FAQs
    const faqResult = await pool.query(
      'SELECT question, answer FROM faqs WHERE entity_type = $1 AND entity_id = $2 ORDER BY order_index',
      ['verse', verse.id]
    );
    
    verses[slug] = {
      slug: verse.slug,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text_kjv: verse.text_kjv,
      text_niv: verse.text_niv,
      text_esv: verse.text_esv,
      text_nlt: verse.text_nlt,
      text_msg: verse.text_msg,
      text_nasb: verse.text_nasb,
      context: verse.context,
      meaning: verse.meaning,
      application: verse.application,
      prayer: verse.prayer,
      faqs: faqResult.rows
    };
    
    console.log(`✅ Exported: ${slug}`);
  }
  
  // Write to public directory for static access
  const outputPath = path.join(__dirname, '../public/api/verses.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(verses, null, 2));
  
  console.log(`\n✅ Exported ${Object.keys(verses).length} verses to /public/api/verses.json`);
  console.log('📊 File size:', (fs.statSync(outputPath).size / 1024).toFixed(2), 'KB\n');
  
  await pool.end();
}

exportVerses().catch(console.error);
