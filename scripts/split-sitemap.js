#!/usr/bin/env node

/**
 * Split large sitemap.xml into chunks of 50,000 URLs each
 * Google recommends max 50,000 URLs per sitemap file
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SITEMAP_PATH = join(process.cwd(), 'public', 'sitemap.xml');
const OUTPUT_DIR = join(process.cwd(), 'public');
const MAX_URLS_PER_FILE = 45000; // Leave some buffer

async function splitSitemap() {
  console.log('📄 Reading sitemap...');
  const sitemapContent = readFileSync(SITEMAP_PATH, 'utf-8');
  
  // Extract all URL blocks
  const urlBlocks = sitemapContent.match(/<url>[\s\S]*?<\/url>/g) || [];
  console.log(`Found ${urlBlocks.length} URLs`);
  
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;
  
  const footer = '</urlset>';
  
  // Split into chunks
  const chunks = [];
  for (let i = 0; i < urlBlocks.length; i += MAX_URLS_PER_FILE) {
    chunks.push(urlBlocks.slice(i, i + MAX_URLS_PER_FILE));
  }
  
  console.log(`Splitting into ${chunks.length} sitemap files...`);
  
  // Write individual sitemaps
  const sitemapFiles = [];
  chunks.forEach((chunk, index) => {
    const filename = `sitemap-${index}.xml`;
    const content = header + '\n' + chunk.join('\n') + '\n' + footer;
    const filepath = join(OUTPUT_DIR, filename);
    writeFileSync(filepath, content);
    sitemapFiles.push(filename);
    console.log(`✓ Created ${filename} (${chunk.length} URLs)`);
  });
  
  // Create sitemap index
  const indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map(file => `  <sitemap>
    <loc>https://bibleverserandomizer.com/${file}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  writeFileSync(join(OUTPUT_DIR, 'sitemap.xml'), indexContent);
  console.log(`\n✓ Created sitemap.xml index pointing to ${sitemapFiles.length} sitemaps`);
  console.log(`\n📊 Total URLs: ${urlBlocks.length}`);
  console.log(`📊 Files created: ${sitemapFiles.length + 1}`);
}

splitSitemap().catch(console.error);
