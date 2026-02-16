#!/usr/bin/env node

/**
 * Generate sitemap.xml for Bible Verse Randomizer
 * Based on the current database content + planned pages
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const DOMAIN = 'https://bibleverserandomizer.com';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...\n');

  const urls = [];
  
  // Static pages
  console.log('📄 Adding static pages...');
  urls.push({
    loc: `${DOMAIN}/`,
    changefreq: 'daily',
    priority: '1.0',
  });
  urls.push({
    loc: `${DOMAIN}/daily`,
    changefreq: 'daily',
    priority: '0.9',
  });
  urls.push({
    loc: `${DOMAIN}/about`,
    changefreq: 'monthly',
    priority: '0.5',
  });
  console.log(`  ✅ Added 3 static pages`);

  // Verse pages - get all verses with slugs
  console.log('\n📖 Fetching verse pages from database...');
  try {
    const verseResult = await pool.query(
      `SELECT slug, updated_at 
       FROM verses 
       ORDER BY id`
    );
    
    verseResult.rows.forEach(verse => {
      urls.push({
        loc: `${DOMAIN}/verse/${verse.slug}`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: verse.updated_at ? new Date(verse.updated_at).toISOString().split('T')[0] : null,
      });
    });
    
    console.log(`  ✅ Added ${verseResult.rows.length} verse pages`);
  } catch (error) {
    console.error('  ❌ Error fetching verses:', error.message);
  }

  // Topic pages
  console.log('\n📝 Fetching topic pages from database...');
  try {
    const topicResult = await pool.query(
      `SELECT slug 
       FROM topics 
       ORDER BY search_volume DESC NULLS LAST`
    );
    
    topicResult.rows.forEach(topic => {
      urls.push({
        loc: `${DOMAIN}/bible-verses-about-${topic.slug}`,
        changefreq: 'weekly',
        priority: '0.9',
      });
    });
    
    console.log(`  ✅ Added ${topicResult.rows.length} topic pages`);
  } catch (error) {
    console.error('  ❌ Error fetching topics:', error.message);
  }

  // Intent pages
  console.log('\n🎯 Fetching intent pages from database...');
  try {
    const intentResult = await pool.query(
      `SELECT slug 
       FROM intent_pages 
       ORDER BY search_volume DESC NULLS LAST`
    );
    
    intentResult.rows.forEach(intent => {
      urls.push({
        loc: `${DOMAIN}/bible-verses-${intent.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
      });
    });
    
    console.log(`  ✅ Added ${intentResult.rows.length} intent pages`);
  } catch (error) {
    console.error('  ❌ Error fetching intent pages:', error.message);
  }

  // Book overview pages (66 books)
  console.log('\n📚 Adding book overview pages...');
  const books = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1-samuel', '2-samuel',
    '1-kings', '2-kings', '1-chronicles', '2-chronicles',
    'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
    'ecclesiastes', 'song-of-solomon', 'isaiah', 'jeremiah',
    'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel',
    'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk',
    'zephaniah', 'haggai', 'zechariah', 'malachi',
    'matthew', 'mark', 'luke', 'john', 'acts',
    'romans', '1-corinthians', '2-corinthians', 'galatians',
    'ephesians', 'philippians', 'colossians',
    '1-thessalonians', '2-thessalonians', '1-timothy',
    '2-timothy', 'titus', 'philemon', 'hebrews', 'james',
    '1-peter', '2-peter', '1-john', '2-john', '3-john',
    'jude', 'revelation'
  ];
  
  books.forEach(book => {
    urls.push({
      loc: `${DOMAIN}/books/${book}`,
      changefreq: 'monthly',
      priority: '0.6',
    });
  });
  
  console.log(`  ✅ Added ${books.length} book overview pages`);

  // Generate XML
  console.log('\n📝 Generating XML...');
  const xml = generateSitemapXML(urls);

  // Write to file
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, xml);
  
  console.log(`\n✅ Sitemap generated successfully!`);
  console.log(`   📍 Location: ${OUTPUT_FILE}`);
  console.log(`   📊 Total URLs: ${urls.length.toLocaleString()}`);
  console.log(`   🌐 Domain: ${DOMAIN}`);
  
  // Close database connection
  await pool.end();
  
  return {
    file: OUTPUT_FILE,
    totalUrls: urls.length,
    domain: DOMAIN,
  };
}

function generateSitemapXML(urls) {
  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${url.loc}</loc>\n`;
    
    if (url.lastmod) {
      entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
    entry += `    <priority>${url.priority}</priority>\n`;
    entry += `  </url>`;
    
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Run if executed directly
if (require.main === module) {
  generateSitemap()
    .then((result) => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error generating sitemap:', error);
      process.exit(1);
    });
}

module.exports = { generateSitemap };
