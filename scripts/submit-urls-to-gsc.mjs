#!/usr/bin/env node
/**
 * Google Search Console URL Submission Script
 * 
 * Batch-submits URLs to Google for indexing using the URL Inspection API.
 * Reads URLs from sitemap XML or a plain text file.
 * 
 * Prerequisites:
 *   1. Create a Google Cloud project and enable the Search Console API
 *   2. Create a service account and download the JSON key file
 *   3. Add the service account email as a user in Google Search Console
 * 
 * Usage:
 *   node scripts/submit-urls-to-gsc.mjs --key=path/to/service-account.json --site=https://bibleverserandomizer.com
 *   node scripts/submit-urls-to-gsc.mjs --key=path/to/key.json --site=https://bibleverserandomizer.com --urls=urls.txt
 *   node scripts/submit-urls-to-gsc.mjs --key=path/to/key.json --site=https://bibleverserandomizer.com --sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, val] = arg.replace('--', '').split('=');
    acc[key] = val || true;
    return acc;
}, {});

const KEY_FILE = args.key;
const SITE_URL = args.site || 'https://bibleverserandomizer.com';
const URLS_FILE = args.urls;
const USE_SITEMAP = args.sitemap;
const BATCH_SIZE = parseInt(args['batch-size']) || 100;
const DELAY_MS = parseInt(args.delay) || 500;

if (!KEY_FILE) {
    console.error('❌ Missing --key=path/to/service-account.json');
    console.error('\nSetup:');
    console.error('  1. Go to https://console.cloud.google.com');
    console.error('  2. Enable "Google Search Console API"');
    console.error('  3. Create a Service Account → download JSON key');
    console.error('  4. Add the service account email to GSC as a verified owner');
    console.error('\nUsage:');
    console.error('  node scripts/submit-urls-to-gsc.mjs --key=key.json --site=https://bibleverserandomizer.com --sitemap');
    process.exit(1);
}

async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/webmasters'],
    });
    return auth.getClient();
}

async function getUrlsFromSitemap() {
    // Read the generated sitemap from public/ or .next/
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
        // Try to read from app-generated sitemap
        console.log('  ℹ️  No static sitemap.xml found. Generating URL list from data...');
        return generateUrlsFromData();
    }

    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    return urls;
}

function generateUrlsFromData() {
    const urls = [];
    const baseUrl = 'https://bibleverserandomizer.com';

    // Static pages
    urls.push(baseUrl);
    urls.push(`${baseUrl}/popular-verses`);
    urls.push(`${baseUrl}/reading-plan`);
    urls.push(`${baseUrl}/topics`);
    urls.push(`${baseUrl}/translations`);

    // Priority verse pages
    const priorityFile = path.join(__dirname, '..', 'data', 'priority-1000.json');
    if (fs.existsSync(priorityFile)) {
        const verses = JSON.parse(fs.readFileSync(priorityFile, 'utf-8'));
        for (const v of verses) {
            urls.push(`${baseUrl}/verse/${v.slug}`);
            urls.push(`${baseUrl}/verse/${v.slug}/compare`);
        }
    }

    // Intent pages
    const intentsFile = path.join(__dirname, '..', 'data', 'intents-master.json');
    if (fs.existsSync(intentsFile)) {
        const intents = JSON.parse(fs.readFileSync(intentsFile, 'utf-8'));
        for (const intent of intents) {
            if (intent.slug) urls.push(`${baseUrl}/for/${intent.slug}`);
        }
    }

    // Topic pages
    const topicsFile = path.join(__dirname, '..', 'data', 'topics-master.json');
    if (fs.existsSync(topicsFile)) {
        const topics = JSON.parse(fs.readFileSync(topicsFile, 'utf-8'));
        for (const topic of topics) {
            if (topic.slug) urls.push(`${baseUrl}/topic/${topic.slug}`);
        }
    }

    return urls;
}

async function getUrlsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').map(l => l.trim()).filter(Boolean);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('\n🔍 Google Search Console URL Submission');
    console.log(`   Site: ${SITE_URL}`);

    // Get URLs
    let urls;
    if (URLS_FILE) {
        urls = await getUrlsFromFile(URLS_FILE);
        console.log(`   Source: ${URLS_FILE}`);
    } else if (USE_SITEMAP) {
        urls = await getUrlsFromSitemap();
        console.log(`   Source: sitemap / data files`);
    } else {
        urls = generateUrlsFromData();
        console.log(`   Source: data files (auto-generated)`);
    }

    console.log(`   URLs found: ${urls.length}`);
    console.log(`   Batch size: ${BATCH_SIZE}\n`);

    // Authenticate
    const authClient = await getAuthClient();
    const searchConsole = google.searchconsole({ version: 'v1', auth: authClient });

    let submitted = 0;
    let errors = 0;

    for (let i = 0; i < Math.min(urls.length, BATCH_SIZE); i++) {
        const url = urls[i];

        try {
            process.stdout.write(`  [${i + 1}/${Math.min(urls.length, BATCH_SIZE)}] ${url.slice(0, 80)}...`);

            // Use URL Inspection API to request indexing
            const result = await searchConsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: url,
                    siteUrl: SITE_URL,
                },
            });

            const verdict = result.data?.inspectionResult?.indexStatusResult?.verdict || 'UNKNOWN';
            console.log(` ${verdict === 'PASS' ? '✅' : '🔄'} ${verdict}`);
            submitted++;
        } catch (err) {
            console.log(` ❌ ${err.message?.slice(0, 60)}`);
            errors++;
        }

        await sleep(DELAY_MS);
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Inspected: ${submitted}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📄 Total URLs available: ${urls.length}`);

    if (urls.length > BATCH_SIZE) {
        console.log(`\n   ⚠️  Only processed first ${BATCH_SIZE} URLs. Run with --batch-size=${urls.length} to process all.`);
    }

    // Save URL list for reference
    const outputPath = path.join(__dirname, '..', 'data', 'gsc-urls-submitted.txt');
    fs.writeFileSync(outputPath, urls.slice(0, BATCH_SIZE).join('\n'));
    console.log(`   💾 URL list saved to: ${outputPath}\n`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
