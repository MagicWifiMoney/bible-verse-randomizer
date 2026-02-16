const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
  try {
    // Check verses table columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'verses' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Verses table columns:');
    columnsResult.rows.forEach(c => {
      console.log(`   - ${c.column_name}: ${c.data_type}`);
    });
    
    // Check how many verses already have content
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(context) as has_context,
        COUNT(meaning) as has_meaning,
        COUNT(application) as has_application,
        COUNT(prayer) as has_prayer
      FROM verses
    `);
    
    console.log('\n📊 Content statistics:');
    const stats = statsResult.rows[0];
    console.log(`   Total verses: ${stats.total}`);
    console.log(`   With context: ${stats.has_context}`);
    console.log(`   With meaning: ${stats.has_meaning}`);
    console.log(`   With application: ${stats.has_application}`);
    console.log(`   With prayer: ${stats.has_prayer}`);
    
    // Check FAQs
    const faqsResult = await pool.query('SELECT COUNT(*) FROM faqs');
    console.log(`   Total FAQs: ${faqsResult.rows[0].count}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
