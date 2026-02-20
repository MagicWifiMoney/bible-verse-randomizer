#!/usr/bin/env node
/**
 * Load existing verse JSON files into the database
 * Reads data/verses/*.json and updates the verses table
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const VERSES_DIR = path.join(__dirname, '../data/verses');

async function loadVerseToDb(filePath) {
  const slug = path.basename(filePath, '.json');
  
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    
    // Update verses table
    const result = await pool.query(`
      UPDATE verses
      SET context = $1, meaning = $2, application = $3, prayer = $4, updated_at = NOW()
      WHERE slug = $5
      RETURNING id
    `, [data.context, data.meaning, data.application, data.prayer, slug]);
    
    if (result.rows.length === 0) {
      console.log(`⚠️  Verse not found in DB: ${slug}`);
      return false;
    }
    
    const verseId = result.rows[0].id;
    
    // Delete old FAQs and insert new ones
    await pool.query(`DELETE FROM faqs WHERE entity_type = 'verse' AND entity_id = $1`, [verseId]);
    
    if (data.faqs && Array.isArray(data.faqs)) {
      for (let i = 0; i < data.faqs.length; i++) {
        const faq = data.faqs[i];
        await pool.query(`
          INSERT INTO faqs (entity_type, entity_id, question, answer, order_index)
          VALUES ('verse', $1, $2, $3, $4)
        `, [verseId, faq.question, faq.answer, i + 1]);
      }
    }
    
    console.log(`✅ ${slug}`);
    return true;
  } catch (err) {
    console.error(`❌ ${slug}: ${err.message}`);
    return false;
  }
}

async function main() {
  const files = fs.readdirSync(VERSES_DIR).filter(f => f.endsWith('.json'));
  console.log(`📦 Found ${files.length} JSON files to load into DB\n`);
  
  let success = 0, failed = 0;
  
  for (const file of files) {
    const ok = await loadVerseToDb(path.join(VERSES_DIR, file));
    if (ok) success++; else failed++;
  }
  
  console.log(`\n✅ Loaded ${success}/${files.length} verse JSON files into DB`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  
  await pool.end();
}

main().catch(console.error);
