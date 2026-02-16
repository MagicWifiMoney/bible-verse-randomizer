/**
 * Generate sitemap.xml for Sprint 6
 * Includes all verse URLs, topic URLs, and intent URLs
 */

const fs = require('fs');
const { Client } = require('pg');

const BASE_URL = 'https://bibleverserandomizer.com'; // Update when custom domain is configured

async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml for Sprint 6...\n');
  
  const client = new Client({
    connectionString: 'postgresql://postgres:biblepass123@localhost:5433/bible_verses'
  });

  try {
    await client.connect();
    
    // Get all verses
    const versesResult = await client.query(`
      SELECT slug, updated_at 
      FROM verses 
      WHERE slug IS NOT NULL
      ORDER BY popularity_score DESC NULLS LAST
    `);
    
    // Get all topics (from master list)
    const topicsData = JSON.parse(fs.readFileSync('./data/topics-master.json', 'utf8'));
    
    // Get all intents (from master list)
    const intentsData = JSON.parse(fs.readFileSync('./data/intents-master.json', 'utf8'));
    
    console.log(`📊 URL Counts:`);
    console.log(`   Verses: ${versesResult.rows.length}`);
    console.log(`   Topics: ${topicsData.length}`);
    console.log(`   Intents: ${intentsData.length}`);
    
    // Calculate total
    const totalUrls = versesResult.rows.length + topicsData.length + intentsData.length + 10; // +10 for static pages
    console.log(`   Static pages: ~10`);
    console.log(`   TOTAL: ${totalUrls}\n`);
    
    // Start XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

    // Add homepage
    xml += `  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add static pages
    const staticPages = [
      { path: '/daily', priority: 0.9 },
      { path: '/about', priority: 0.5 },
    ];
    
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add verse pages
    console.log('📝 Adding verse URLs...');
    versesResult.rows.forEach((verse, index) => {
      const lastmod = verse.updated_at ? new Date(verse.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/verse/${verse.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      
      if ((index + 1) % 5000 === 0) {
        console.log(`   Added ${index + 1} verses...`);
      }
    });
    console.log(`   ✅ Added all ${versesResult.rows.length} verses\n`);

    // Add topic pages
    console.log('📝 Adding topic URLs...');
    topicsData.forEach(topic => {
      xml += `  <url>
    <loc>${BASE_URL}/topic/${topic.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });
    console.log(`   ✅ Added all ${topicsData.length} topics\n`);

    // Add intent pages
    console.log('📝 Adding intent URLs...');
    intentsData.forEach(intent => {
      xml += `  <url>
    <loc>${BASE_URL}/for/${intent.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });
    console.log(`   ✅ Added all ${intentsData.length} intents\n`);

    // Close XML
    xml += `</urlset>`;

    // Write to file
    const outputPath = './public/sitemap.xml';
    fs.writeFileSync(outputPath, xml);
    
    const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${fileSizeKB} KB`);
    console.log(`   Total URLs: ${totalUrls}`);
    console.log(`   URL: ${BASE_URL}/sitemap.xml\n`);
    
    console.log('🎉 Ready to submit to Google Search Console!');
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

generateSitemap();
