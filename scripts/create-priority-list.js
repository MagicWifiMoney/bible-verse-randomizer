/**
 * Create Priority List for 1,000 Verses
 * 
 * Selection criteria:
 * 1. All verses from keyword research (top searched)
 * 2. Complete chapters of popular books (Psalms, Proverbs, etc.)
 * 3. All verses from key books (John, Romans, Ephesians, etc.)
 */

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createPriorityList() {
  console.log('📋 Creating priority list for 1,000 verses...\n');
  
  // Strategy: Get verses from most popular books and chapters
  const priorityBooks = [
    'John',
    'Psalms',
    'Proverbs',
    'Romans',
    'Matthew',
    'Ephesians',
    'Philippians',
    'Colossians',
    'James',
    'Genesis',
    '1 Peter',
    '1 Corinthians',
    'Galatians',
    'Hebrews',
    'Isaiah',
    'Jeremiah',
    'Luke',
    'Acts',
    'Mark',
    'Joshua'
  ];
  
  const verses = [];
  
  for (const book of priorityBooks) {
    // Get verses from this book
    const result = await pool.query(
      'SELECT id, book, chapter, verse, slug, text_niv FROM verses WHERE book = $1 ORDER BY chapter, verse LIMIT 100',
      [book]
    );
    
    console.log(`✅ ${book}: ${result.rows.length} verses`);
    verses.push(...result.rows);
    
    if (verses.length >= 1000) {
      console.log(`\n🎯 Reached 1,000 verses target!`);
      break;
    }
  }
  
  // Trim to exactly 1000
  const priorityList = verses.slice(0, 1000);
  
  console.log(`\n📊 Final priority list: ${priorityList.length} verses`);
  console.log(`   Books covered: ${new Set(priorityList.map(v => v.book)).size}`);
  
  // Save to file
  const fs = require('fs');
  const outputPath = require('path').join(__dirname, '../data/priority-1000.json');
  fs.writeFileSync(outputPath, JSON.stringify(priorityList, null, 2));
  
  console.log(`\n💾 Saved to: ${outputPath}`);
  
  await pool.end();
  
  return priorityList;
}

createPriorityList().catch(console.error);
