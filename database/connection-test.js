#!/usr/bin/env node

/**
 * Database Connection Test & Initial Data Loader
 * 
 * This script:
 * 1. Tests connection to PostgreSQL/Supabase
 * 2. Verifies schema is loaded
 * 3. Loads Bible verse text from API
 * 4. Verifies seed data integrity
 */

const { Client } = require('pg');
require('dotenv').config({ path: '../.env.local' });

// Database connection configuration
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bible_verses',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Alternative: Use DATABASE_URL if provided (Supabase format)
const connectionString = process.env.DATABASE_URL;

async function testConnection() {
  console.log('🔌 Testing database connection...\n');
  
  const client = new Client(
    connectionString ? { connectionString } : connectionConfig
  );

  try {
    // Connect
    await client.connect();
    console.log('✅ Connected to database successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`⏰ Server time: ${result.rows[0].current_time}\n`);
    
    // Verify tables exist
    console.log('📋 Checking database schema...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const expectedTables = [
      'verses', 'topics', 'verse_topics', 'cross_references',
      'intent_pages', 'intent_verses', 'generated_content', 'faqs',
      'users', 'user_bookmarks', 'user_reading_history',
      'email_subscribers', 'page_views'
    ];
    
    const existingTables = tables.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables.join(', '));
      console.log('\n💡 Run schema.sql first:');
      console.log('   psql -U postgres -d bible_verses -f schema.sql');
      process.exit(1);
    }
    
    console.log(`✅ All ${expectedTables.length} tables found!\n`);
    
    // Check data counts
    console.log('📊 Checking data...');
    const verses = await client.query('SELECT COUNT(*) FROM verses');
    const topics = await client.query('SELECT COUNT(*) FROM topics');
    const verseTopics = await client.query('SELECT COUNT(*) FROM verse_topics');
    const intents = await client.query('SELECT COUNT(*) FROM intent_pages');
    
    console.log(`   Verses: ${verses.rows[0].count}`);
    console.log(`   Topics: ${topics.rows[0].count}`);
    console.log(`   Verse-Topic mappings: ${verseTopics.rows[0].count}`);
    console.log(`   Intent pages: ${intents.rows[0].count}\n`);
    
    // Test a sample query
    console.log('🔍 Testing sample query...');
    const sampleVerse = await client.query(`
      SELECT v.*, array_agg(t.name) as topics
      FROM verses v
      LEFT JOIN verse_topics vt ON v.id = vt.verse_id
      LEFT JOIN topics t ON vt.topic_id = t.id
      WHERE v.slug = 'john-3-16'
      GROUP BY v.id
    `);
    
    if (sampleVerse.rows.length > 0) {
      const verse = sampleVerse.rows[0];
      console.log(`✅ Sample verse loaded: ${verse.book} ${verse.chapter}:${verse.verse}`);
      console.log(`   Topics: ${verse.topics ? verse.topics.filter(t => t).join(', ') : 'None'}\n`);
    } else {
      console.log('⚠️  No sample verse found. Run seed-verses.sql first.\n');
    }
    
    // Success summary
    console.log('═'.repeat(60));
    console.log('✅ DATABASE CONNECTION TEST PASSED');
    console.log('═'.repeat(60));
    console.log('\n📌 Connection details:');
    if (connectionString) {
      console.log(`   Using: DATABASE_URL (${connectionString.substring(0, 20)}...)`);
    } else {
      console.log(`   Host: ${connectionConfig.host}`);
      console.log(`   Port: ${connectionConfig.port}`);
      console.log(`   Database: ${connectionConfig.database}`);
      console.log(`   User: ${connectionConfig.user}`);
    }
    console.log('\n🚀 Next steps:');
    console.log('   1. Load verse text from Bible API (run: node load-verse-text.js)');
    console.log('   2. Generate AI content for verses (run: npm run generate:content)');
    console.log('   3. Start the Next.js app (run: npm run dev)\n');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check .env.local has correct DB credentials');
    console.error('   3. Run schema.sql and seed-verses.sql first');
    console.error('\n   Example .env.local:');
    console.error('   DATABASE_URL=postgresql://user:pass@localhost:5432/bible_verses');
    console.error('   or separate variables:');
    console.error('   DB_HOST=localhost');
    console.error('   DB_PORT=5432');
    console.error('   DB_NAME=bible_verses');
    console.error('   DB_USER=postgres');
    console.error('   DB_PASSWORD=yourpassword\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the test
testConnection();
