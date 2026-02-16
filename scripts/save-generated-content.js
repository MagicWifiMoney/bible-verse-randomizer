/**
 * Save Pre-generated Content to Database
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function saveContent(slug, content) {
  try {
    // Update main content
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
    
    console.log(`✅ Saved: ${slug}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error saving ${slug}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Saving Generated Content to Database\n');
  
  const contentPath = path.join(__dirname, '../data/generated-content-10-verses.json');
  const verseContent = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  
  let successCount = 0;
  const total = Object.keys(verseContent).length;
  
  for (const [slug, content] of Object.entries(verseContent)) {
    const success = await saveContent(slug, content);
    if (success) successCount++;
  }
  
  console.log(`\n================================================`);
  console.log(`✅ STEP 1 COMPLETE!`);
  console.log(`   Verses saved: ${successCount}/${total}`);
  console.log(`================================================\n`);
  
  await pool.end();
}

main().catch(console.error);
