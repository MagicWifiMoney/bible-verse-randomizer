const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('=== Database Tables ===');
    tables.rows.forEach(row => console.log(' -', row.table_name));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
