#!/usr/bin/env node

/**
 * Verify 20 random URLs from the sitemap return 200 OK
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');
const NUM_SAMPLES = 20;

async function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        success: res.statusCode === 200,
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        success: false,
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
      });
    });
  });
}

async function verifyRandomUrls() {
  console.log('🔍 Verifying random URLs from sitemap...\n');
  
  // Read sitemap
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ Sitemap not found:', SITEMAP_PATH);
    console.log('   Run: node scripts/generate-sitemap.js first');
    process.exit(1);
  }
  
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  
  // Extract all URLs
  const urlMatches = sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g);
  const allUrls = Array.from(urlMatches).map(match => match[1]);
  
  console.log(`📊 Total URLs in sitemap: ${allUrls.length.toLocaleString()}`);
  
  // Select random URLs
  const randomUrls = [];
  const usedIndices = new Set();
  
  while (randomUrls.length < Math.min(NUM_SAMPLES, allUrls.length)) {
    const randomIndex = Math.floor(Math.random() * allUrls.length);
    if (!usedIndices.has(randomIndex)) {
      randomUrls.push(allUrls[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }
  
  console.log(`🎲 Testing ${randomUrls.length} random URLs...\n`);
  
  // Test each URL
  const results = [];
  for (let i = 0; i < randomUrls.length; i++) {
    const url = randomUrls[i];
    process.stdout.write(`[${i + 1}/${randomUrls.length}] Testing ${url.replace('https://bibleverserandomizer.com', '')}... `);
    
    const result = await testUrl(url);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status}`);
    } else {
      console.log(`❌ ${result.status}${result.error ? ` (${result.error})` : ''}`);
    }
  }
  
  // Summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}/${randomUrls.length} (${Math.round(successCount / randomUrls.length * 100)}%)`);
  console.log(`❌ Failed: ${failCount}/${randomUrls.length}`);
  
  if (failCount > 0) {
    console.log('\n❌ Failed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.url} - ${r.status}${r.error ? ` (${r.error})` : ''}`);
    });
  }
  
  console.log('\n');
  
  return {
    total: randomUrls.length,
    success: successCount,
    fail: failCount,
    results,
  };
}

// Run if executed directly
if (require.main === module) {
  verifyRandomUrls()
    .then((summary) => {
      if (summary.fail === 0) {
        console.log('✅ All URLs verified successfully!');
        process.exit(0);
      } else {
        console.log('⚠️  Some URLs failed verification.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { verifyRandomUrls };
