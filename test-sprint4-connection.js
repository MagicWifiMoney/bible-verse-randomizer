// Quick test to verify database connection and structure
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    // Test 1: Database connection
    console.log('✓ Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('  Connected successfully\n');
    
    // Test 2: Check verse count
    console.log('✓ Checking verse count...');
    const verseCount = await pool.query('SELECT COUNT(*) FROM verses');
    console.log(`  Total verses: ${verseCount.rows[0].count}\n`);
    
    // Test 3: Check intent_verses table
    console.log('✓ Checking intent_verses table...');
    const intentVerseCount = await pool.query('SELECT COUNT(*) FROM intent_verses');
    console.log(`  Current associations: ${intentVerseCount.rows[0].count}\n`);
    
    // Test 4: Load intents master file
    console.log('✓ Loading intents master file...');
    const intents = require('./data/intents-master.json');
    console.log(`  Total intents: ${intents.length}`);
    console.log(`  Batch 3 range: 835-1250 (${1250-835+1} intents)`);
    console.log(`  First in batch: "${intents[834].title}"`);
    console.log(`  Last in batch: "${intents[1249].title}"\n`);
    
    // Test 5: Test full-text search
    console.log('✓ Testing verse search...');
    const searchTest = await pool.query(
      `SELECT id, book, chapter, verse, text_niv
       FROM verses 
       WHERE text_niv IS NOT NULL
         AND to_tsvector('english', text_niv) @@ to_tsquery('english', 'love')
       LIMIT 3`
    );
    console.log(`  Found ${searchTest.rows.length} verses matching 'love'`);
    if (searchTest.rows.length > 0) {
      console.log(`  Example: ${searchTest.rows[0].book} ${searchTest.rows[0].chapter}:${searchTest.rows[0].verse}\n`);
    }
    
    console.log('✅ All tests passed! Ready to run Sprint 4 Batch 3.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

test();
