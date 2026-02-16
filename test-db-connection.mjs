/**
 * Test database connection for Next.js app
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:biblepass123@localhost:5433/bible_verses',
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Basic connection
    const result = await pool.query('SELECT COUNT(*) as total FROM verses');
    console.log('✅ Database connected!');
    console.log(`   Total verses: ${result.rows[0].total}\n`);
    
    // Test 2: Fetch a specific verse (John 3:16)
    const verse = await pool.query(
      `SELECT id, book, chapter, verse, slug, text_niv, context, meaning 
       FROM verses 
       WHERE slug = $1`,
      ['john-3-16']
    );
    
    if (verse.rows.length > 0) {
      const v = verse.rows[0];
      console.log('✅ Sample verse fetched (john-3-16):');
      console.log(`   ${v.book} ${v.chapter}:${v.verse}`);
      console.log(`   Text: ${v.text_niv?.substring(0, 80)}...`);
      console.log(`   Has Context: ${!!v.context}`);
      console.log(`   Has Meaning: ${!!v.meaning}\n`);
    }
    
    // Test 3: Count verses with AI content
    const aiContent = await pool.query(
      'SELECT COUNT(*) as count FROM verses WHERE context IS NOT NULL'
    );
    console.log('✅ Verses with AI-generated content:');
    console.log(`   ${aiContent.rows[0].count} verses\n`);
    
    // Test 4: Fetch topics
    const topics = await pool.query('SELECT COUNT(*) as count FROM topics');
    console.log('✅ Topics in database:');
    console.log(`   ${topics.rows[0].count} topics\n`);
    
    console.log('🎉 All tests passed! Database is ready for deployment.');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
