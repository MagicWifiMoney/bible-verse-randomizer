/**
 * Verify 20 random sample URLs return 200 OK
 * Sprint 6 requirement
 */

const https = require('https');
const { Client } = require('pg');

const BASE_URL = 'https://bibleverserandomizer.com'; // Update if using different URL

async function fetchUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        status: res.statusCode,
        duration,
        ok: res.statusCode === 200
      });
    }).on('error', (err) => {
      resolve({
        url,
        status: 0,
        duration: 0,
        ok: false,
        error: err.message
      });
    });
  });
}

async function verifyUrls() {
  console.log('🔍 Sprint 6: Verifying 20 random sample URLs\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const client = new Client({
    connectionString: 'postgresql://postgres:biblepass123@localhost:5433/bible_verses'
  });

  try {
    await client.connect();
    
    // Get 10 random verses
    const versesResult = await client.query(`
      SELECT slug FROM verses 
      WHERE slug IS NOT NULL 
      ORDER BY RANDOM() 
      LIMIT 10
    `);
    
    // Get 5 random topics
    const topicsResult = await client.query(`
      SELECT slug FROM topics 
      ORDER BY RANDOM() 
      LIMIT 5
    `);
    
    // Build URL list
    const urls = [
      `${BASE_URL}/`,
      `${BASE_URL}/daily`,
      `${BASE_URL}/about`,
    ];
    
    // Add 10 random verse URLs
    versesResult.rows.forEach(row => {
      urls.push(`${BASE_URL}/verse/${row.slug}`);
    });
    
    // Add 5 random topic URLs
    topicsResult.rows.forEach(row => {
      urls.push(`${BASE_URL}/topic/${row.slug}`);
    });
    
    // Add 2 random intent URLs
    urls.push(`${BASE_URL}/for/tattoos`);
    urls.push(`${BASE_URL}/for/funerals`);
    
    console.log(`📋 Testing ${urls.length} URLs:\n`);
    
    // Fetch all URLs
    const results = await Promise.all(urls.map(url => fetchUrl(url)));
    
    // Display results
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
      const icon = result.ok ? '✅' : '❌';
      const status = result.status || 'ERROR';
      const duration = result.duration ? `${result.duration}ms` : 'N/A';
      
      console.log(`${icon} [${status}] ${result.url} (${duration})`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.ok) successCount++;
      else failCount++;
    });
    
    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Total URLs tested: ${urls.length}`);
    console.log(`   ✅ Successful (200 OK): ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   Success rate: ${((successCount / urls.length) * 100).toFixed(1)}%\n`);
    
    if (successCount === urls.length) {
      console.log('🎉 All URLs verified successfully! Sprint 6 verification complete.');
      process.exit(0);
    } else {
      console.log('⚠️  Some URLs failed. Review errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyUrls();
