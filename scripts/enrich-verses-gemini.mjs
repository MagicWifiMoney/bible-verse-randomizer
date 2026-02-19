#!/usr/bin/env node
/**
 * Gemini AI Content Enrichment Script
 * 
 * Generates rich content (context, meaning, application, prayer, cross-refs, FAQs)
 * for all 1,000 priority Bible verses using Gemini 2.0 Flash.
 * 
 * Features:
 * - Resume support: skips already-generated verses
 * - Batch processing: saves every 10 verses
 * - Rate limiting: configurable delay between requests
 * - Cost: ~$0.01 per 1,000 verses with Flash
 * 
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/enrich-verses-gemini.mjs
 *   GEMINI_API_KEY=your_key node scripts/enrich-verses-gemini.mjs --batch-size=50
 *   GEMINI_API_KEY=your_key node scripts/enrich-verses-gemini.mjs --start=100 --end=200
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'enriched-verses.json');
const PRIORITY_FILE = path.join(DATA_DIR, 'priority-1000.json');

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, val] = arg.replace('--', '').split('=');
    acc[key] = val ? parseInt(val) : true;
    return acc;
}, {});

const BATCH_SIZE = args['batch-size'] || 10;
const START_IDX = args.start || 0;
const END_IDX = args.end || Infinity;
const DELAY_MS = args.delay || 200; // ms between requests

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY environment variable');
    console.error('Usage: GEMINI_API_KEY=your_key node scripts/enrich-verses-gemini.mjs');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Load priority verses
const priorityVerses = JSON.parse(fs.readFileSync(PRIORITY_FILE, 'utf-8'));

// Load existing enriched data (for resume support)
let enrichedData = {};
if (fs.existsSync(OUTPUT_FILE)) {
    enrichedData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`📂 Loaded ${Object.keys(enrichedData).length} existing enriched verses`);
}

// Also load the 10-verse pilot data
const PILOT_FILE = path.join(DATA_DIR, 'generated-content-10-verses.json');
if (fs.existsSync(PILOT_FILE)) {
    const pilotData = JSON.parse(fs.readFileSync(PILOT_FILE, 'utf-8'));
    for (const verse of pilotData) {
        if (verse.slug && !enrichedData[verse.slug]) {
            enrichedData[verse.slug] = verse;
        }
    }
    console.log(`📂 Merged pilot data. Total: ${Object.keys(enrichedData).length}`);
}

function buildPrompt(verse) {
    return `You are a Bible scholar and pastor. Generate rich, helpful content for the Bible verse below. 
Write in a warm, accessible tone that helps both new and experienced readers understand and apply this verse.

VERSE: ${verse.book} ${verse.chapter}:${verse.verse}
TEXT (NIV): ${verse.text_niv}

Generate the following in JSON format (no markdown, just valid JSON):

{
  "context": "2-3 paragraphs (200-250 words) about the historical and literary context of this verse. Who wrote it, to whom, when, why, and what was happening. Include the immediate surrounding passage context.",
  "meaning": "2-3 paragraphs (200-250 words) explaining what this verse means. Break down key words/phrases, explain the original language insights where relevant, and connect to the broader biblical narrative.",
  "application": "2-3 paragraphs (150-200 words) with practical, specific ways to apply this verse in daily life. Include concrete examples and action steps.",
  "prayer": "A heartfelt prayer (80-100 words) based on this verse that readers can pray.",
  "cross_references": [
    {"reference": "Book Chapter:Verse", "reason": "Brief reason this connects"},
    {"reference": "Book Chapter:Verse", "reason": "Brief reason this connects"},
    {"reference": "Book Chapter:Verse", "reason": "Brief reason this connects"}
  ],
  "faqs": [
    {"question": "What does ${verse.book} ${verse.chapter}:${verse.verse} mean?", "answer": "Direct, comprehensive answer (80-100 words)"},
    {"question": "What is the context of ${verse.book} ${verse.chapter}:${verse.verse}?", "answer": "Direct answer about context (80-100 words)"},
    {"question": "How can I apply ${verse.book} ${verse.chapter}:${verse.verse} to my life?", "answer": "Practical application answer (80-100 words)"},
    {"question": "What are related verses to ${verse.book} ${verse.chapter}:${verse.verse}?", "answer": "List 3-4 related verses with brief reasons (80-100 words)"}
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown code blocks. No extra text.`;
}

function parseJsonResponse(text) {
    // Strip markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
}

function save() {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedData, null, 2));
}

async function enrichVerse(verse) {
    const prompt = buildPrompt(verse);

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = parseJsonResponse(text);

        return {
            slug: verse.slug,
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            ...parsed,
        };
    } catch (err) {
        console.error(`  ❌ Error for ${verse.book} ${verse.chapter}:${verse.verse}: ${err.message}`);
        return null;
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
    const total = Math.min(priorityVerses.length, END_IDX) - START_IDX;
    const versesToProcess = priorityVerses.slice(START_IDX, END_IDX);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`\n🚀 Starting Gemini AI Content Enrichment`);
    console.log(`   Model: gemini-2.0-flash`);
    console.log(`   Verses: ${START_IDX}–${Math.min(priorityVerses.length, END_IDX)} (${total} total)`);
    console.log(`   Batch size: ${BATCH_SIZE}`);
    console.log(`   Delay: ${DELAY_MS}ms\n`);

    for (let i = 0; i < versesToProcess.length; i++) {
        const verse = versesToProcess[i];

        // Skip if already enriched
        if (enrichedData[verse.slug]) {
            skipped++;
            continue;
        }

        const ref = `${verse.book} ${verse.chapter}:${verse.verse}`;
        process.stdout.write(`  [${i + 1}/${total}] ${ref}...`);

        const result = await enrichVerse(verse);

        if (result) {
            enrichedData[verse.slug] = result;
            processed++;
            console.log(` ✅ (${result.context?.length || 0} chars context)`);
        } else {
            errors++;
            console.log(` ❌`);
        }

        // Save checkpoint every BATCH_SIZE
        if ((processed + errors) % BATCH_SIZE === 0 && (processed + errors) > 0) {
            save();
            console.log(`  💾 Checkpoint saved (${Object.keys(enrichedData).length} total enriched)`);
        }

        // Rate limiting
        await sleep(DELAY_MS);
    }

    // Final save
    save();

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Enriched: ${processed}`);
    console.log(`   ⏭️  Skipped (already done): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📂 Total in file: ${Object.keys(enrichedData).length}`);
    console.log(`   💾 Saved to: ${OUTPUT_FILE}\n`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    save(); // Save progress even on crash
    process.exit(1);
});
