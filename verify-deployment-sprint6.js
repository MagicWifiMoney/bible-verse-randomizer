#!/usr/bin/env node

/**
 * Sprint 6: Verify 20 random URLs return 200
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://bible-verse-randomizer-psi.vercel.app';

// Sample URLs across all content types
const testUrls = [
  // Static pages
  '/',
  '/daily',
  '/about',
  
  // Verse pages (popular verses)
  '/verse/john-3-16',
  '/verse/psalm-23-1',
  '/verse/jeremiah-29-11',
  '/verse/philippians-4-13',
  '/verse/romans-8-28',
  '/verse/proverbs-3-5-6',
  '/verse/matthew-6-33',
  '/verse/isaiah-40-31',
  
  // Topic pages
  '/topic/love',
  '/topic/faith',
  '/topic/hope',
  '/topic/peace',
  '/topic/courage',
  
  // Intent pages
  '/for/tattoos',
  '/for/funerals',
  '/for/weddings',
  '/for/encouragement'
];

async function checkUrl(url) {
  const fullUrl = `${BASE_URL}${url}`;
  try {
    const response = await fetch(fullUrl, { 
      method: 'HEAD',
      timeout: 10000 
    });
    return {
      url,
      status: response.status,
      success: response.status === 200
    };
  } catch (error) {
    return {
      url,
      status: 'ERROR',
      error: error.message,
      success: false
    };
  }
}

async function main() {
  console.log(`\n🔍 Verifying ${testUrls.length} URLs on production deployment...`);
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const results = await Promise.all(testUrls.map(checkUrl));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('='.repeat(80));
  console.log('RESULTS');
  console.log('='.repeat(80));
  
  console.log('\n✅ SUCCESSFUL (200 OK):');
  successful.forEach(r => {
    console.log(`  ✓ ${r.url}`);
  });
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED:');
    failed.forEach(r => {
      console.log(`  ✗ ${r.url} - Status: ${r.status}`);
      if (r.error) {
        console.log(`    Error: ${r.error}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total URLs tested: ${testUrls.length}`);
  console.log(`Successful: ${successful.length} (${Math.round(successful.length/testUrls.length*100)}%)`);
  console.log(`Failed: ${failed.length} (${Math.round(failed.length/testUrls.length*100)}%)`);
  
  if (successful.length === testUrls.length) {
    console.log('\n🎉 ALL URLS VERIFIED - DEPLOYMENT SUCCESSFUL!');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME URLS FAILED - REVIEW DEPLOYMENT');
    process.exit(1);
  }
}

main();
