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
    
    // Delete existing FAQs first
    await pool.query(`
      DELETE FROM faqs
      WHERE entity_type = 'verse' AND entity_id IN (SELECT id FROM verses WHERE slug = $1)
    `, [slug]);
    
    // Save FAQs
    for (let i = 0; i < content.faqs.length; i++) {
      const faq = content.faqs[i];
      await pool.query(`
        INSERT INTO faqs (entity_type, entity_id, question, answer, order_index)
        SELECT 'verse', id, $1, $2, $3
        FROM verses
        WHERE slug = $4
      `, [faq.question, faq.answer, i + 1, slug]);
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
