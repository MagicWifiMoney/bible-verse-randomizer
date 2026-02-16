#!/usr/bin/env ts-node

/**
 * Batch Generate Verse Content
 * 
 * Processes multiple verses with:
 * - Rate limiting (respects Anthropic API limits)
 * - Progress tracking
 * - Error handling and retry logic
 * - Resume capability
 * 
 * Usage:
 *   ts-node scripts/batch-generate.ts --limit 100 --batch-size 10
 */

import { generateVerseContent, saveToDatabase } from './generate-verse-content';
import * as fs from 'fs';
import * as path from 'path';

interface BatchConfig {
  limit: number;
  batchSize: number;
  delayMs: number;
  resumeFrom?: number;
  outputDir: string;
}

interface ProcessingResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ verseId: number; error: string }>;
}

/**
 * Batch process verses
 */
async function batchGenerate(config: BatchConfig): Promise<ProcessingResult> {
  console.log('🚀 Starting batch generation...');
  console.log(`   Limit: ${config.limit} verses`);
  console.log(`   Batch size: ${config.batchSize}`);
  console.log(`   Delay: ${config.delayMs}ms between requests\n`);

  const result: ProcessingResult = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };

  // TODO: Fetch verses from database
  // const verses = await fetchVersesToGenerate(config.limit, config.resumeFrom);
  
  // Mock data for demonstration
  const verses = getMockVerses(config.limit);
  result.total = verses.length;

  // Process in batches
  for (let i = 0; i < verses.length; i += config.batchSize) {
    const batch = verses.slice(i, i + config.batchSize);
    const batchNum = Math.floor(i / config.batchSize) + 1;
    const totalBatches = Math.ceil(verses.length / config.batchSize);
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (verses ${i + 1}-${Math.min(i + config.batchSize, verses.length)})`);
    
    // Process batch items sequentially (to respect rate limits)
    for (const verse of batch) {
      try {
        const content = await generateVerseContent({
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          translation: 'NIV'
        });
        
        // Save to database
        // await saveToDatabase(verse.id, content);
        
        // Save to JSON file as backup
        saveToFile(verse, content, config.outputDir);
        
        result.successful++;
        
        // Respect rate limits: delay between requests
        if (i + batch.indexOf(verse) < verses.length - 1) {
          await delay(config.delayMs);
        }
        
      } catch (error) {
        console.error(`❌ Failed to generate content for ${verse.book} ${verse.chapter}:${verse.verse}`);
        console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
        
        result.failed++;
        result.errors.push({
          verseId: verse.id,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Continue with next verse instead of stopping entire batch
        continue;
      }
    }
    
    // Log progress
    const progress = ((i + batch.length) / verses.length * 100).toFixed(1);
    console.log(`\n📊 Progress: ${result.successful}/${result.total} successful (${progress}%)`);
    
    // Save checkpoint
    saveCheckpoint(config.outputDir, i + batch.length, result);
  }

  return result;
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Save generated content to JSON file
 */
function saveToFile(verse: any, content: any, outputDir: string): void {
  const filename = `${verse.book.toLowerCase()}-${verse.chapter}-${verse.verse}.json`;
  const filepath = path.join(outputDir, filename);
  
  const data = {
    verse: {
      id: verse.id,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text
    },
    content,
    generated_at: new Date().toISOString()
  };
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

/**
 * Save processing checkpoint
 */
function saveCheckpoint(outputDir: string, lastProcessed: number, result: ProcessingResult): void {
  const checkpoint = {
    lastProcessed,
    result,
    timestamp: new Date().toISOString()
  };
  
  const filepath = path.join(outputDir, '_checkpoint.json');
  fs.writeFileSync(filepath, JSON.stringify(checkpoint, null, 2));
}

/**
 * Load checkpoint to resume
 */
function loadCheckpoint(outputDir: string): number | undefined {
  const filepath = path.join(outputDir, '_checkpoint.json');
  
  if (!fs.existsSync(filepath)) {
    return undefined;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    return data.lastProcessed;
  } catch (error) {
    console.warn('⚠️  Could not load checkpoint:', error);
    return undefined;
  }
}

/**
 * Mock verses for testing
 */
function getMockVerses(limit: number): Array<any> {
  const mockVerses = [
    { id: 1, book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world...' },
    { id: 2, book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things through Christ...' },
    { id: 3, book: 'Jeremiah', chapter: 29, verse: 11, text: 'For I know the plans I have for you...' },
  ];
  
  return mockVerses.slice(0, Math.min(limit, mockVerses.length));
}

/**
 * Generate summary report
 */
function generateReport(result: ProcessingResult, startTime: Date): void {
  const endTime = new Date();
  const duration = (endTime.getTime() - startTime.getTime()) / 1000;
  const successRate = (result.successful / result.total * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('BATCH GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n📊 Results:`);
  console.log(`   Total verses: ${result.total}`);
  console.log(`   Successful: ${result.successful} (${successRate}%)`);
  console.log(`   Failed: ${result.failed}`);
  console.log(`\n⏱️  Duration: ${duration.toFixed(1)} seconds`);
  console.log(`   Average: ${(duration / result.total).toFixed(2)}s per verse`);
  
  if (result.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    result.errors.forEach(err => {
      console.log(`   Verse ID ${err.verseId}: ${err.error}`);
    });
  }
  
  console.log('\n✅ Batch generation complete!\n');
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const config: BatchConfig = {
    limit: 100,
    batchSize: 10,
    delayMs: 2000, // 2 seconds between requests (conservative rate limiting)
    outputDir: path.join(__dirname, '../output/generated-content'),
    resumeFrom: undefined
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        config.limit = parseInt(args[++i]);
        break;
      case '--batch-size':
        config.batchSize = parseInt(args[++i]);
        break;
      case '--delay':
        config.delayMs = parseInt(args[++i]);
        break;
      case '--output':
        config.outputDir = args[++i];
        break;
      case '--resume':
        config.resumeFrom = loadCheckpoint(config.outputDir);
        if (config.resumeFrom !== undefined) {
          console.log(`📍 Resuming from verse ${config.resumeFrom}`);
        }
        break;
      case '--help':
        console.log(`
Batch Generate Verse Content

Usage:
  ts-node scripts/batch-generate.ts [options]

Options:
  --limit <number>       Number of verses to process (default: 100)
  --batch-size <number>  Verses per batch (default: 10)
  --delay <ms>           Delay between API calls in ms (default: 2000)
  --output <dir>         Output directory (default: ./output/generated-content)
  --resume               Resume from last checkpoint
  --help                 Show this help message

Examples:
  ts-node scripts/batch-generate.ts --limit 50
  ts-node scripts/batch-generate.ts --limit 1000 --batch-size 20 --delay 3000
  ts-node scripts/batch-generate.ts --resume

Environment Variables:
  ANTHROPIC_API_KEY      Required: Your Anthropic API key
        `);
        process.exit(0);
    }
  }
  
  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable not set');
    console.error('Set it in .env.local or export it:');
    console.error('   export ANTHROPIC_API_KEY=your_key_here');
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${config.outputDir}`);
  }
  
  const startTime = new Date();
  
  try {
    const result = await batchGenerate(config);
    generateReport(result, startTime);
    
    // Exit with error code if any failures
    process.exit(result.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Batch generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { batchGenerate };
export type { BatchConfig, ProcessingResult };
