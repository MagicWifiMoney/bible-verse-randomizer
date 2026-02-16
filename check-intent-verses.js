const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    console.log('=== Intent Verses Table Structure ===');
    const structure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'intent_verses'
      ORDER BY ordinal_position
    `);
    structure.rows.forEach(row => console.log(` - ${row.column_name}: ${row.data_type}`));
    
    console.log('\n=== Intent Verses Count ===');
    const count = await pool.query('SELECT COUNT(*) FROM intent_verses');
    console.log(`Total intent-verse associations: ${count.rows[0].count}`);
    
    console.log('\n=== Sample Intent-Verse Associations ===');
    const sample = await pool.query('SELECT * FROM intent_verses LIMIT 10');
    console.log(JSON.stringify(sample.rows, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
