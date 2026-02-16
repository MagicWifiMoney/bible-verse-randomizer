#!/usr/bin/env ts-node

/**
 * Batch Generate 1,000 Verse Content
 * 
 * Generates AI content for top 1,000 priority verses
 * - Uses priority-1000.json as source
 * - Generates in batches of 50
 * - Saves to lib/verses-data.json after each batch
 * - Deploys to Vercel after each 100 verses
 * - Tracks progress and handles errors
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRIORITY_FILE = path.join(__dirname, '../data/priority-1000.json');
const VERSES_DATA_FILE = path.join(__dirname, '../lib/verses-data.json');
const CHECKPOINT_FILE = path.join(__dirname, '../output/batch-checkpoint.json');

interface PriorityVerse {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  slug: string;
  text_niv: string;
}

interface VerseContent {
  slug: string;
  book: string;
  chapter: number;
  verse: number;
  text_kjv: string;
  text_niv: string;
  text_esv: string;
  text_nlt: string;
  text_msg: string;
  text_nasb: string;
  context: string;
  meaning: string;
  application: string;
  prayer: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface Checkpoint {
  lastProcessed: number;
  totalGenerated: number;
  totalFailed: number;
  lastDeployedAt: number;
  timestamp: string;
}

/**
 * Load checkpoint or create new one
 */
function loadCheckpoint(): Checkpoint {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
  }
  
  return {
    lastProcessed: 0,
    totalGenerated: 0,
    totalFailed: 0,
    lastDeployedAt: 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * Save checkpoint
 */
function saveCheckpoint(checkpoint: Checkpoint): void {
  const dir = path.dirname(CHECKPOINT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  checkpoint.timestamp = new Date().toISOString();
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

/**
 * Load existing verses data
 */
function loadVersesData(): Record<string, any> {
  if (fs.existsSync(VERSES_DATA_FILE)) {
    return JSON.parse(fs.readFileSync(VERSES_DATA_FILE, 'utf-8'));
  }
  return {};
}

/**
 * Save verses data
 */
function saveVersesData(data: Record<string, any>): void {
  fs.writeFileSync(VERSES_DATA_FILE, JSON.stringify(data, null, 2));
  
  // Also save to public/api/verses.json for redundancy
  const publicFile = path.join(__dirname, '../public/api/verses.json');
  fs.writeFileSync(publicFile, JSON.stringify(data, null, 2));
}

/**
 * Generate content for a single verse
 */
async function generateVerseContent(
  anthropic: Anthropic,
  verse: PriorityVerse
): Promise<VerseContent | null> {
  
  const prompt = `You are a Bible scholar creating comprehensive content for ${verse.book} ${verse.chapter}:${verse.verse}.

Reference text (NIV): "${verse.text_niv}"

Generate:

1. **Context** (~200 words): Historical and literary context. When/why written, original audience, setting within the book.

2. **Meaning** (~400 words): Deep theological analysis. Original language insights (Hebrew/Greek), key theological concepts, what the verse reveals about God, humanity, or salvation.

3. **Application** (~400 words): Practical application for modern readers. How to live this out today, common misconceptions to avoid, specific examples and action steps.

4. **Prayer** (~200 words): A heartfelt prayer based on this verse. Personal, applicable, inspiring.

5. **5 FAQs** (100-150 words each): Common questions about this verse with thorough answers.

Format as JSON:
{
  "context": "...",
  "meaning": "...",
  "application": "...",
  "prayer": "...",
  "faqs": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Write at a 10th-grade reading level. Be theologically accurate and pastoral. Avoid fluff.`;

  try {
    console.log(`   Generating: ${verse.book} ${verse.chapter}:${verse.verse}`);
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const aiContent = JSON.parse(jsonMatch[0]);
    
    // Build complete verse content (using NIV for all translations for now)
    const verseContent: VerseContent = {
      slug: verse.slug,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text_kjv: verse.text_niv, // TODO: Fetch actual KJV text
      text_niv: verse.text_niv,
      text_esv: verse.text_niv, // TODO: Fetch actual ESV text
      text_nlt: verse.text_niv, // TODO: Fetch actual NLT text
      text_msg: verse.text_niv, // TODO: Fetch actual MSG text
      text_nasb: verse.text_niv, // TODO: Fetch actual NASB text
      context: aiContent.context,
      meaning: aiContent.meaning,
      application: aiContent.application,
      prayer: aiContent.prayer,
      faqs: aiContent.faqs
    };
    
    console.log(`   ✓ Generated successfully`);
    return verseContent;
    
  } catch (error) {
    console.error(`   ✗ Failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Deploy to Vercel
 */
function deployToVercel(): void {
  try {
    console.log('\n🚀 Deploying to Vercel...');
    
    // Commit changes
    execSync('git add lib/verses-data.json public/api/verses.json', { cwd: path.join(__dirname, '..') });
    execSync(`git commit -m "Add batch of generated verses"`, { cwd: path.join(__dirname, '..') });
    execSync('git push', { cwd: path.join(__dirname, '..') });
    
    console.log('   ✓ Pushed to Git - Vercel will auto-deploy\n');
    
  } catch (error) {
    console.error('   ✗ Deploy failed:', error);
  }
}

/**
 * Main batch generation function
 */
async function main() {
  console.log('🚀 Starting batch generation for 1,000 verses\n');
  
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    process.exit(1);
  }
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  // Load data
  const priorityVerses: PriorityVerse[] = JSON.parse(
    fs.readFileSync(PRIORITY_FILE, 'utf-8')
  );
  
  const checkpoint = loadCheckpoint();
  const versesData = loadVersesData();
  
  console.log(`📊 Status:`);
  console.log(`   Total verses: ${priorityVerses.length}`);
  console.log(`   Already generated: ${checkpoint.lastProcessed}`);
  console.log(`   Remaining: ${priorityVerses.length - checkpoint.lastProcessed}\n`);
  
  // Process in batches of 50
  const BATCH_SIZE = 50;
  const DEPLOY_EVERY = 100;
  
  for (let i = checkpoint.lastProcessed; i < priorityVerses.length; i += BATCH_SIZE) {
    const batch = priorityVerses.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil((priorityVerses.length - checkpoint.lastProcessed) / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (verses ${i + 1}-${Math.min(i + BATCH_SIZE, priorityVerses.length)})`);
    console.log(`${'='.repeat(60)}\n`);
    
    let batchSuccessful = 0;
    let batchFailed = 0;
    
    for (const verse of batch) {
      // Check if already exists
      if (versesData[verse.slug]) {
        console.log(`   ⊘ Skipping ${verse.book} ${verse.chapter}:${verse.verse} (already exists)`);
        checkpoint.lastProcessed++;
        continue;
      }
      
      const content = await generateVerseContent(anthropic, verse);
      
      if (content) {
        versesData[content.slug] = content;
        checkpoint.totalGenerated++;
        batchSuccessful++;
      } else {
        checkpoint.totalFailed++;
        batchFailed++;
      }
      
      checkpoint.lastProcessed++;
      
      // Save after each verse (in case of interruption)
      saveCheckpoint(checkpoint);
      
      // Rate limiting: 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Save verses data after batch
    saveVersesData(versesData);
    
    console.log(`\n📊 Batch complete:`);
    console.log(`   Successful: ${batchSuccessful}`);
    console.log(`   Failed: ${batchFailed}`);
    console.log(`   Total progress: ${checkpoint.lastProcessed}/${priorityVerses.length} (${(checkpoint.lastProcessed / priorityVerses.length * 100).toFixed(1)}%)`);
    
    // Deploy every 100 verses
    if (checkpoint.lastProcessed - checkpoint.lastDeployedAt >= DEPLOY_EVERY) {
      deployToVercel();
      checkpoint.lastDeployedAt = checkpoint.lastProcessed;
      saveCheckpoint(checkpoint);
      
      // Wait 30 seconds for deployment to complete
      console.log('⏳ Waiting 30s for deployment...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  // Final deployment
  if (checkpoint.lastProcessed > checkpoint.lastDeployedAt) {
    deployToVercel();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ BATCH GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n📊 Final Stats:`);
  console.log(`   Total generated: ${checkpoint.totalGenerated}`);
  console.log(`   Total failed: ${checkpoint.totalFailed}`);
  console.log(`   Success rate: ${(checkpoint.totalGenerated / priorityVerses.length * 100).toFixed(1)}%`);
  console.log(`\n🎉 All ${priorityVerses.length} verses processed!\n`);
}

// Run
main().catch(console.error);
