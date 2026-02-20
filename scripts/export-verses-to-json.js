#!/usr/bin/env node
/**
 * Export all verse content from DB to JSON files
 * Run this after generation is complete to ensure JSON files
 * have all translation text included.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const VERSES_DIR = path.join(__dirname, '../data/verses');
fs.mkdirSync(VERSES_DIR, { recursive: true });

async function main() {
  const { rows } = await pool.query(`
    SELECT v.id, v.book, v.chapter, v.verse, v.slug,
      v.text_kjv, v.text_niv, v.text_esv, v.text_nlt, v.text_msg, v.text_nasb,
      v.context, v.meaning, v.application, v.prayer, v.testament, v.popularity_score,
      COALESCE(
        json_agg(jsonb_build_object('question', f.question, 'answer', f.answer)
          ORDER BY f.order_index)
        FILTER (WHERE f.id IS NOT NULL), '[]'
      ) as faqs
    FROM verses v
    LEFT JOIN faqs f ON f.entity_type = 'verse' AND f.entity_id = v.id
    WHERE v.context IS NOT NULL AND v.context != ''
    GROUP BY v.id
    ORDER BY v.id
  `);
  
  console.log(`📦 Exporting ${rows.length} verses to JSON files...`);
  let saved = 0;
  
  for (const row of rows) {
    const data = {
      id: row.id,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      slug: row.slug,
      testament: row.testament,
      text: row.text_kjv || '',
      text_kjv: row.text_kjv || '',
      text_niv: row.text_niv || '',
      text_esv: row.text_esv || '',
      text_nlt: row.text_nlt || '',
      text_msg: row.text_msg || '',
      text_nasb: row.text_nasb || '',
      context: row.context,
      meaning: row.meaning,
      application: row.application,
      prayer: row.prayer,
      faqs: row.faqs || [],
      popularity_score: row.popularity_score,
      exportedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(VERSES_DIR, `${row.slug}.json`),
      JSON.stringify(data, null, 2)
    );
    saved++;
    
    if (saved % 1000 === 0) {
      console.log(`  ${saved}/${rows.length} (${((saved/rows.length)*100).toFixed(1)}%)`);
    }
  }
  
  console.log(`\n✅ Exported ${saved} verse JSON files to ${VERSES_DIR}`);
  console.log(`📊 Directory size: $(du -sh ${VERSES_DIR} | cut -f1)`);
  await pool.end();
}

main().catch(err => { console.error(err); pool.end(); process.exit(1); });
