/**
 * Load Bible Data Script (JavaScript version)
 * Loads all 31,102 verses with multiple translations into database
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

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

// Book number to name mapping
const BOOK_NAMES = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
  6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
  16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
  21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
  26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
  31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
  36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi',
  40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
  45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
  50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy',
  55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James',
  60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John',
  65: 'Jude', 66: 'Revelation'
};

function cleanVerseText(text) {
  return text
    .replace(/<S>\d+<\/S>/g, '')
    .replace(/<sup>.*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function getTestament(bookNum) {
  return bookNum <= 39 ? 'Old Testament' : 'New Testament';
}

async function loadTranslation(name) {
  const filePath = path.join(__dirname, '../data', `${name}.json`);
  console.log(`   Loading ${name}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`   ⚠️  File not found: ${filePath}`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const verses = JSON.parse(content);
  console.log(`   ✅ ${name}: ${verses.length} verses loaded`);
  return verses;
}

async function main() {
  console.log('🚀 Bible Data Loader - Starting...\n');
  console.log('================================================\n');
  
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected!\n');
    
    // Load all translations
    console.log('📖 Loading Bible translations from local files...');
    const translations = ['KJV', 'NIV', 'ESV', 'NLT', 'MSG', 'NASB'];
    const allVerses = {};
    
    for (const trans of translations) {
      const verses = await loadTranslation(trans);
      
      for (const verse of verses) {
        const key = `${verse.book}-${verse.chapter}-${verse.verse}`;
        
        if (!allVerses[key]) {
          allVerses[key] = {
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            translations: {}
          };
        }
        
        allVerses[key].translations[trans] = cleanVerseText(verse.text);
      }
    }
    
    console.log(`\n📊 Total unique verses: ${Object.keys(allVerses).length}`);
    console.log('📝 Preparing data for database...\n');
    
    // Prepare batch insert
    const versesToInsert = [];
    
    for (const [key, verseData] of Object.entries(allVerses)) {
      const bookName = BOOK_NAMES[verseData.book];
      
      // Skip verses from books outside the 66 canonical books (Apocrypha)
      if (!bookName) {
        continue;
      }
      
      const testament = getTestament(verseData.book);
      const slug = `${bookName.toLowerCase().replace(/\s+/g, '-')}-${verseData.chapter}-${verseData.verse}`;
      const kjvText = verseData.translations.KJV || null;
      const wordCount = kjvText ? kjvText.split(/\s+/).length : 0;
      
      versesToInsert.push({
        book: bookName,
        chapter: verseData.chapter,
        verse: verseData.verse,
        text_kjv: kjvText,
        text_niv: verseData.translations.NIV || null,
        text_esv: verseData.translations.ESV || null,
        text_nlt: verseData.translations.NLT || null,
        text_msg: verseData.translations.MSG || null,
        text_nasb: verseData.translations.NASB || null,
        slug,
        testament,
        word_count: wordCount
      });
    }
    
    console.log(`✅ Prepared ${versesToInsert.length} verses for insertion\n`);
    
    // Insert in batches
    console.log('💾 Inserting verses into database...');
    const BATCH_SIZE = 100;
    let inserted = 0;
    
    for (let i = 0; i < versesToInsert.length; i += BATCH_SIZE) {
      const batch = versesToInsert.slice(i, i + BATCH_SIZE);
      
      for (const verse of batch) {
        await pool.query(`
          INSERT INTO verses (
            book, chapter, verse,
            text_kjv, text_niv, text_esv, text_nlt, text_msg, text_nasb,
            slug, testament, word_count
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (slug) DO UPDATE SET
            text_kjv = EXCLUDED.text_kjv,
            text_niv = EXCLUDED.text_niv,
            text_esv = EXCLUDED.text_esv,
            text_nlt = EXCLUDED.text_nlt,
            text_msg = EXCLUDED.text_msg,
            text_nasb = EXCLUDED.text_nasb,
            word_count = EXCLUDED.word_count,
            updated_at = NOW()
        `, [
          verse.book,
          verse.chapter,
          verse.verse,
          verse.text_kjv,
          verse.text_niv,
          verse.text_esv,
          verse.text_nlt,
          verse.text_msg,
          verse.text_nasb,
          verse.slug,
          verse.testament,
          verse.word_count
        ]);
        inserted++;
      }
      
      const progress = Math.round((i + batch.length) / versesToInsert.length * 100);
      process.stdout.write(`   Progress: ${progress}% (${i + batch.length}/${versesToInsert.length})\r`);
    }
    
    console.log(`\n✅ Successfully inserted/updated ${inserted} verses!\n`);
    
    // Verify data
    console.log('🔍 Verifying data in database...');
    const result = await pool.query(`
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
    
    const stats = result.rows[0];
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
