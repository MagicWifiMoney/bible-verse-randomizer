#!/usr/bin/env node

/**
 * Production script: Generate all 7,775 verse pages
 * 
 * Strategy:
 * - Batch processing (100 verses at a time)
 * - BibleGateway scraping + Gemini 2.5 Flash enhancement
 * - Auto-retry on failure (max 3 attempts)
 * - Progress tracking & resume capability
 * 
 * Cost: ~$77 for all verses
 * Time: ~3-4 hours
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in environment');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Book ID to name mapping (1-66)
const BOOK_NAMES = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
  6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
  16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
  21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
  26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
  31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
  36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi', 40: 'Matthew',
  41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts', 45: 'Romans',
  46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians', 50: 'Philippians',
  51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
  56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter',
  61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude',
  66: 'Revelation'
};

const BATCH_SIZE = 100;
const CONCURRENT_LIMIT = 5; // Process 5 verses in parallel
const OUTPUT_DIR = '/home/ec2-user/clawd/projects/bible-verse-randomizer/data/verses';
const PROGRESS_FILE = '/home/ec2-user/clawd/projects/bible-verse-randomizer/data/verse-generation-progress.json';

/**
 * Load all verses from database files (canonical books only)
 */
async function loadAllVerses() {
  const translationFiles = [
    '/home/ec2-user/clawd/projects/bible-verse-randomizer/data/KJV.json',
  ];
  
  const kjv = JSON.parse(await fs.readFile(translationFiles[0], 'utf-8'));
  
  // Filter to only canonical books (1-66, excluding Apocrypha)
  const canonicalVerses = kjv.filter(v => v.book >= 1 && v.book <= 66);
  
  return canonicalVerses.map((verse, index) => ({
    id: index + 1,
    bookId: verse.book,
    bookName: BOOK_NAMES[verse.book],
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text
  }));
}

/**
 * Load progress
 */
async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      completed: [],
      failed: [],
      lastBatch: 0,
      totalProcessed: 0,
      startTime: new Date().toISOString()
    };
  }
}

/**
 * Save progress
 */
async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Scrape BibleGateway for verse commentary
 */
async function scrapeVerse(bookName, chapter, verse) {
  const reference = `${bookName.replace(/\s+/g, '+')}+${chapter}:${verse}`;
  const url = `https://www.biblegateway.com/passage/?search=${reference}&version=NIV`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    const verseText = $('.passage-text').first().text().trim();
    const commentary = $('.study-notes').text().trim() || '';
    
    return {
      verseText: verseText.substring(0, 500),
      commentary: commentary.substring(0, 1000)
    };
  } catch (error) {
    return { verseText: '', commentary: '' };
  }
}

/**
 * Enhance scraped content with Gemini Flash
 */
async function enhanceVerse(verse, scrapedData) {
  const prompt = `You are a Bible study expert creating devotional content.

**Verse:** ${verse.bookName} ${verse.chapter}:${verse.verse}
**Text:** ${verse.text}

**Scraped Commentary:**
${scrapedData.commentary || 'No commentary available'}

**Scraped Verse Text:**
${scrapedData.verseText || verse.text}

Create engaging, meaningful content with these exact sections:

## Context (300 words minimum)
Explain the historical and cultural background of this verse. Who wrote it? Who was the original audience? What circumstances led to this being written?

## Meaning (400 words minimum)
Break down the verse phrase by phrase. What does it mean in the original language? What theological truths does it contain? How does it fit into the broader biblical narrative?

## Application (500 words minimum)
How does this verse apply to modern life? Give 3-4 specific, practical ways someone could apply this truth today. Include real-life scenarios and examples.

## Prayer (200 words minimum)
Write a personal, heartfelt prayer based on this verse. Make it conversational and authentic.

## FAQs
Create 5 frequently asked questions and answers about this verse:

1. [Question about common misunderstanding]
   [Answer - 100 words]

2. [Question about practical application]
   [Answer - 100 words]

3. [Question about original context]
   [Answer - 100 words]

4. [Question about related verses]
   [Answer - 100 words]

5. [Question about modern relevance]
   [Answer - 100 words]

Return as valid JSON:
{
  "context": "...",
  "meaning": "...",
  "application": "...",
  "prayer": "...",
  "faqs": [
    { "question": "...", "answer": "..." },
    ...
  ]
}`;

  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const content = JSON.parse(text);
      
      // Validate content
      if (!content.context || content.context.split(' ').length < 250) {
        throw new Error('Context too short');
      }
      if (!content.meaning || content.meaning.split(' ').length < 350) {
        throw new Error('Meaning too short');
      }
      if (!content.application || content.application.split(' ').length < 450) {
        throw new Error('Application too short');
      }
      if (!content.prayer || content.prayer.split(' ').length < 180) {
        throw new Error('Prayer too short');
      }
      if (!content.faqs || content.faqs.length < 5) {
        throw new Error('Not enough FAQs');
      }
      
      return content;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Generate verse page
 */
async function generateVersePage(verse, scrapedData, enhancedContent) {
  const verseSlug = `${verse.bookName.toLowerCase().replace(/\s+/g, '-')}-${verse.chapter}-${verse.verse}`;
  
  return {
    id: verse.id,
    book: verse.bookName,
    chapter: verse.chapter,
    verse: verse.verse,
    slug: verseSlug,
    text: verse.text,
    scrapedText: scrapedData.verseText,
    scrapedCommentary: scrapedData.commentary,
    ...enhancedContent,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Process a single verse
 */
async function processVerse(verse, progress) {
  const verseKey = `${verse.bookName}-${verse.chapter}-${verse.verse}`;
  
  // Skip if already completed
  if (progress.completed.includes(verseKey)) {
    return { status: 'skipped', verseKey };
  }
  
  try {
    // Step 1: Scrape
    const scrapedData = await scrapeVerse(verse.bookName, verse.chapter, verse.verse);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
    
    // Step 2: Enhance
    const enhancedContent = await enhanceVerse(verse, scrapedData);
    
    // Step 3: Generate page
    const versePage = await generateVersePage(verse, scrapedData, enhancedContent);
    
    // Step 4: Save
    const filename = `${versePage.slug}.json`;
    await fs.writeFile(
      path.join(OUTPUT_DIR, filename),
      JSON.stringify(versePage, null, 2)
    );
    
    progress.completed.push(verseKey);
    progress.totalProcessed++;
    
    return { 
      status: 'success', 
      verseKey,
      wordCounts: {
        context: enhancedContent.context.split(' ').length,
        meaning: enhancedContent.meaning.split(' ').length,
        application: enhancedContent.application.split(' ').length
      }
    };
  } catch (error) {
    progress.failed.push({ verseKey, error: error.message });
    return { status: 'failed', verseKey, error: error.message };
  }
}

/**
 * Process batch with concurrency control
 */
async function processBatch(verses, batchNum, progress) {
  console.log(`\n📦 Batch ${batchNum}: Processing ${verses.length} verses...\n`);
  
  const results = [];
  
  // Process in chunks of CONCURRENT_LIMIT
  for (let i = 0; i < verses.length; i += CONCURRENT_LIMIT) {
    const chunk = verses.slice(i, i + CONCURRENT_LIMIT);
    const chunkResults = await Promise.all(
      chunk.map(verse => processVerse(verse, progress))
    );
    
    results.push(...chunkResults);
    
    // Log progress
    const successful = chunkResults.filter(r => r.status === 'success').length;
    const failed = chunkResults.filter(r => r.status === 'failed').length;
    
    console.log(`  ✅ ${successful} | ❌ ${failed} | Total: ${progress.totalProcessed}/${verses.length * (batchNum)}`);
    
    // Save progress after each chunk
    await saveProgress(progress);
  }
  
  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Bible Verse Mass Generation - Scraping + Enhancement\n');
  console.log('📊 Target: 7,775 verses');
  console.log('💰 Estimated cost: ~$77');
  console.log('⏱️  Estimated time: 3-4 hours\n');
  
  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Load verses and progress
  console.log('📖 Loading verses from database...');
  const allVerses = await loadAllVerses();
  console.log(`✅ Loaded ${allVerses.length} verses\n`);
  
  const progress = await loadProgress();
  console.log(`📊 Progress: ${progress.completed.length} completed, ${progress.failed.length} failed\n`);
  
  // Filter to only unprocessed verses
  const completedSet = new Set(progress.completed);
  const versesToProcess = allVerses.filter(v => {
    const key = `${v.book}-${v.chapter}-${v.verse}`;
    return !completedSet.has(key);
  });
  
  console.log(`🎯 ${versesToProcess.length} verses remaining to process\n`);
  
  if (versesToProcess.length === 0) {
    console.log('✅ All verses already processed!');
    return;
  }
  
  // Process in batches
  const totalBatches = Math.ceil(versesToProcess.length / BATCH_SIZE);
  
  for (let i = 0; i < versesToProcess.length; i += BATCH_SIZE) {
    const batch = versesToProcess.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    await processBatch(batch, batchNum, progress);
    
    progress.lastBatch = batchNum;
    await saveProgress(progress);
    
    console.log(`\n✅ Batch ${batchNum}/${totalBatches} complete\n`);
  }
  
  console.log('\n\n🎉 GENERATION COMPLETE!');
  console.log('─'.repeat(50));
  console.log(`✅ Successful: ${progress.completed.length}`);
  console.log(`❌ Failed: ${progress.failed.length}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📊 Total time: ${((Date.now() - new Date(progress.startTime).getTime()) / 1000 / 60).toFixed(1)} minutes`);
}

main().catch(console.error);
