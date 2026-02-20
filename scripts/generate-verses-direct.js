#!/usr/bin/env node
/**
 * Bible Verse Content Generator - Direct to DB (Optimized)
 * 
 * Generates AI content for all remaining verse pages directly into PostgreSQL.
 * Uses DB state as source of truth - no progress file needed.
 * Supports parallel instances via --start-id/--end-id
 * 
 * Usage:
 *   node scripts/generate-verses-direct.js
 *   node scripts/generate-verses-direct.js --start-id 1 --end-id 10000
 *   CONCURRENT=20 node scripts/generate-verses-direct.js
 */

const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// ─── Config ─────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || fs.readFileSync(
  path.join(process.env.HOME, '.config/gemini/api_key'), 'utf-8'
).trim();

const CONCURRENT = parseInt(process.env.CONCURRENT || '20');
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const COST_CAP = 48;

// Gemini 1.5 Flash cost estimates
const COST_PER_VERSE = ((1500 / 1e6) * 0.075) + ((2000 / 1e6) * 0.30);  // ~$0.00071

const VERSES_DIR = path.join(__dirname, '../data/verses');

// ─── Init ────────────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });
fs.mkdirSync(VERSES_DIR, { recursive: true });

// ─── State ───────────────────────────────────────────────────────────────────
let totalGenerated = 0;
let totalFailed = 0;
let estimatedCost = 0;

// ─── Prompt ──────────────────────────────────────────────────────────────────
function buildPrompt(verse) {
  const text = (verse.text_kjv || verse.text_niv || '').substring(0, 300);
  return `Write Bible study content for ${verse.book} ${verse.chapter}:${verse.verse} — "${text}"

Return ONLY a JSON object (no markdown, no extra text):
{"context":"250+ word historical/cultural background","meaning":"350+ word theological meaning","application":"400+ word practical modern application","prayer":"150+ word devotional prayer","faqs":[{"question":"Q1 about this verse","answer":"80+ word answer"},{"question":"Q2","answer":"80+ word answer"},{"question":"Q3","answer":"80+ word answer"},{"question":"Q4","answer":"80+ word answer"},{"question":"Q5","answer":"80+ word answer"}]}`;
}

// ─── Generate ────────────────────────────────────────────────────────────────
async function generateContent(verse) {
  const prompt = buildPrompt(verse);
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      
      // Strip markdown code blocks if present
      text = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      // Find JSON object if there's surrounding text
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart > 0 || jsonEnd < text.length - 1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }
      
      const content = JSON.parse(text);
      
      if (!content.context || content.context.length < 200) throw new Error('Context too short');
      if (!content.meaning || content.meaning.length < 400) throw new Error('Meaning too short');
      if (!content.application || content.application.length < 500) throw new Error('Application too short');
      if (!content.prayer || content.prayer.length < 150) throw new Error('Prayer too short');
      if (!Array.isArray(content.faqs) || content.faqs.length < 5) throw new Error('Not enough FAQs');
      
      return content;
    } catch (err) {
      if (attempt === 2) throw err;
      await sleep(1500 * (attempt + 1));
    }
  }
}

// ─── Save to DB ──────────────────────────────────────────────────────────────
async function saveToDb(verse, content) {
  await pool.query(`
    UPDATE verses
    SET context = $1, meaning = $2, application = $3, prayer = $4, updated_at = NOW()
    WHERE id = $5
  `, [content.context, content.meaning, content.application, content.prayer, verse.id]);
  
  await pool.query(`DELETE FROM faqs WHERE entity_type = 'verse' AND entity_id = $1`, [verse.id]);
  
  for (let i = 0; i < content.faqs.length; i++) {
    const faq = content.faqs[i];
    await pool.query(`
      INSERT INTO faqs (entity_type, entity_id, question, answer, order_index)
      VALUES ('verse', $1, $2, $3, $4)
    `, [verse.id, faq.question, faq.answer, i + 1]);
  }
  
  // Also write JSON backup
  fs.writeFileSync(
    path.join(VERSES_DIR, `${verse.slug}.json`),
    JSON.stringify({
      id: verse.id, book: verse.book, chapter: verse.chapter, verse: verse.verse, slug: verse.slug,
      text: verse.text_kjv,
      text_kjv: verse.text_kjv, text_niv: verse.text_niv, text_esv: verse.text_esv,
      text_nlt: verse.text_nlt, text_msg: verse.text_msg, text_nasb: verse.text_nasb,
      ...content, generatedAt: new Date().toISOString()
    }, null, 2)
  );
}

// ─── Process single verse ────────────────────────────────────────────────────
async function processVerse(verse) {
  try {
    const content = await generateContent(verse);
    await saveToDb(verse, content);
    totalGenerated++;
    estimatedCost += COST_PER_VERSE;
    return 'ok';
  } catch (err) {
    totalFailed++;
    return `fail:${err.message?.substring(0, 60)}`;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? parseInt(args[i+1]) : null; };
  
  const startId = getArg('--start-id') || 1;
  const endId   = getArg('--end-id')   || 99999;
  const limit   = getArg('--limit');
  const worker  = process.env.WORKER_ID || '1';
  
  const logTag = `[W${worker}]`;
  
  console.log(`${logTag} Bible Verse Generator — Model: ${MODEL_NAME}, Concurrent: ${CONCURRENT}`);
  console.log(`${logTag} ID range: ${startId}–${endId} | Budget cap: $${COST_CAP}`);
  
  const { rows: verses } = await pool.query(`
    SELECT id, book, chapter, verse, slug, text_kjv, text_niv, text_esv, text_nlt, text_msg, text_nasb
    FROM verses
    WHERE (context IS NULL OR context = '') AND id >= $1 AND id <= $2
    ORDER BY id
    ${limit ? `LIMIT ${limit}` : ''}
  `, [startId, endId]);
  
  console.log(`${logTag} ${verses.length} verses to generate\n`);
  
  const start = Date.now();
  
  for (let i = 0; i < verses.length; i += CONCURRENT) {
    if (estimatedCost >= COST_CAP) {
      console.log(`${logTag} ⛔ Budget cap $${COST_CAP} reached. Stopping.`);
      break;
    }
    
    const chunk = verses.slice(i, i + CONCURRENT);
    const results = await Promise.all(chunk.map(v => processVerse(v)));
    
    const ok = results.filter(r => r === 'ok').length;
    const fail = results.filter(r => r !== 'ok').length;
    
    if ((i + CONCURRENT) % 100 < CONCURRENT || i + CONCURRENT >= verses.length) {
      const elapsed = ((Date.now() - start) / 60000).toFixed(1);
      const rate = totalGenerated / Math.max((Date.now() - start) / 1000, 1);
      const eta = Math.round((verses.length - i - CONCURRENT) / Math.max(rate, 0.01) / 60);
      console.log(
        `${logTag} [${Math.min(i + chunk.length, verses.length)}/${verses.length}] ` +
        `✅${totalGenerated} ❌${totalFailed} | ` +
        `$${estimatedCost.toFixed(2)} | ` +
        `ETA:${eta}min | ${elapsed}min`
      );
      
      if (fail > 0) {
        const failures = results.filter(r => r !== 'ok');
        console.log(`${logTag}   Failures: ${failures.join(', ')}`);
      }
    }
  }
  
  await pool.end();
  
  const elapsed = ((Date.now() - start) / 60000).toFixed(1);
  console.log(`\n${logTag} ✅ Done: ${totalGenerated} generated, ${totalFailed} failed`);
  console.log(`${logTag} 💰 Est. cost: $${estimatedCost.toFixed(2)}`);
  console.log(`${logTag} ⏱️  Time: ${elapsed} min`);
}

main().catch(err => { console.error('Fatal:', err.message); pool.end(); process.exit(1); });
