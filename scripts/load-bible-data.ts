/**
 * Load Bible Data Script
 * Loads all 31,102 verses with multiple translations into database
 */

import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import {
  loadTranslationFromFile,
  groupVersesByReference,
  getUniqueReferences,
  cleanVerseText,
  BOOK_NAMES,
  TESTAMENT,
  BibleVerse
} from '../lib/bible-api.js';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.error('Please add your database connection string to .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : false
});

interface VerseInsertData {
  book: string;
  chapter: number;
  verse: number;
  text_kjv: string | null;
  text_niv: string | null;
  text_esv: string | null;
  text_nlt: string | null;
  text_msg: string | null;
  text_nasb: string | null;
  slug: string;
  testament: string;
  word_count: number;
  character_count: number;
}

/**
 * Load all translations from local JSON files
 */
async function loadAllTranslations(): Promise<Map<string, Map<string, string>>> {
  console.log('📖 Loading Bible translations from local files...');
  
  const translations = ['KJV', 'NIV', 'ESV', 'NLT', 'MSG', 'NASB'] as const;
  const allVerses: BibleVerse[] = [];
  
  for (const trans of translations) {
    try {
      console.log(`   Loading ${trans}...`);
      const verses = await loadTranslationFromFile(trans);
      allVerses.push(...verses);
      console.log(`   ✅ ${trans}: ${verses.length} verses loaded`);
    } catch (error) {
      console.error(`   ⚠️  Failed to load ${trans}: ${error}`);
    }
  }
  
  console.log(`\n📊 Total verses loaded: ${allVerses.length}`);
  console.log('🔄 Grouping verses by reference...\n');
  
  return groupVersesByReference(allVerses);
}

/**
 * Insert verses into database in batches
 */
async function insertVerses(versesData: VerseInsertData[]): Promise<number> {
  if (versesData.length === 0) return 0;
  
  const placeholders = versesData.map((_, i) => {
    const base = i * 12;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12})`;
  }).join(', ');
  
  const values = versesData.flatMap(v => [
    v.book,
    v.chapter,
    v.verse,
    v.text_kjv,
    v.text_niv,
    v.text_esv,
    v.text_nlt,
    v.text_msg,
    v.text_nasb,
    v.slug,
    v.testament,
    v.word_count
  ]);
  
  const query = `
    INSERT INTO verses (
      book, chapter, verse,
      text_kjv, text_niv, text_esv, text_nlt, text_msg, text_nasb,
      slug, testament, word_count
    )
    VALUES ${placeholders}
    ON CONFLICT (slug) DO UPDATE SET
      text_kjv = EXCLUDED.text_kjv,
      text_niv = EXCLUDED.text_niv,
      text_esv = EXCLUDED.text_esv,
      text_nlt = EXCLUDED.text_nlt,
      text_msg = EXCLUDED.text_msg,
      text_nasb = EXCLUDED.text_nasb,
      word_count = EXCLUDED.word_count,
      updated_at = NOW()
  `;
  
  try {
    const result = await pool.query(query, values);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error inserting batch:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Bible Data Loader - Starting...\n');
  console.log('================================================\n');
  
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected!\n');
    
    // Load all translations
    const groupedVerses = await loadAllTranslations();
    
    // Prepare verse data for insertion
    console.log('📝 Preparing verse data for database insertion...');
    const versesToInsert: VerseInsertData[] = [];
    
    for (const [ref, translations] of groupedVerses.entries()) {
      const [bookNum, chapter, verse] = ref.split('-').map(Number);
      const bookName = BOOK_NAMES[bookNum];
      const testament = TESTAMENT[bookNum];
      const slug = `${bookName.toLowerCase().replace(/\s+/g, '-')}-${chapter}-${verse}`;
      
      // Get text from each translation (or null if not available)
      const kjv = translations.get('KJV') || null;
      const wordCount = kjv ? kjv.split(/\s+/).length : 0;
      
      versesToInsert.push({
        book: bookName,
        chapter,
        verse,
        text_kjv: kjv,
        text_niv: translations.get('NIV') || null,
        text_esv: translations.get('ESV') || null,
        text_nlt: translations.get('NLT') || null,
        text_msg: translations.get('MSG') || null,
        text_nasb: translations.get('NASB') || null,
        slug,
        testament,
        word_count: wordCount,
        character_count: kjv ? kjv.length : 0
      });
    }
    
    console.log(`✅ Prepared ${versesToInsert.length} unique verses\n`);
    
    // Insert in batches
    console.log('💾 Inserting verses into database...');
    const BATCH_SIZE = 100;
    let inserted = 0;
    
    for (let i = 0; i < versesToInsert.length; i += BATCH_SIZE) {
      const batch = versesToInsert.slice(i, i + BATCH_SIZE);
      const count = await insertVerses(batch);
      inserted += count;
      
      const progress = Math.round((i + batch.length) / versesToInsert.length * 100);
      process.stdout.write(`   Progress: ${progress}% (${i + batch.length}/${versesToInsert.length})\r`);
    }
    
    console.log(`\n✅ Successfully inserted/updated ${inserted} verses!\n`);
    
    // Verify data
    console.log('🔍 Verifying data in database...');
    const verifyResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(text_kjv) as kjv_count,
        COUNT(text_niv) as niv_count,
        COUNT(text_esv) as esv_count,
        COUNT(text_nlt) as nlt_count,
        COUNT(text_msg) as msg_count,
        COUNT(text_nasb) as nasb_count
      FROM verses
    `);
    
    const stats = verifyResult.rows[0];
    console.log('📊 Database Statistics:');
    console.log(`   Total verses: ${stats.total}`);
    console.log(`   KJV: ${stats.kjv_count}`);
    console.log(`   NIV: ${stats.niv_count}`);
    console.log(`   ESV: ${stats.esv_count}`);
    console.log(`   NLT: ${stats.nlt_count}`);
    console.log(`   MSG: ${stats.msg_count}`);
    console.log(`   NASB: ${stats.nasb_count}\n`);
    
    console.log('================================================');
    console.log('✅ CHECKPOINT 1 COMPLETE!');
    console.log('   Bible API integrated: bolls.life');
    console.log(`   Verses loaded: ${stats.total}`);
    console.log('   Translations: KJV, NIV, ESV, NLT, MSG, NASB');
    console.log('================================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
