/**
 * Verse Data Loader - Database + JSON File Hybrid
 * 
 * Priority:
 * 1. PostgreSQL database (when DATABASE_URL is set)
 * 2. JSON files in data/verses/ (production fallback)
 */

import { query, queryOne } from './db';
import { VersePageData } from '@/components/templates/VersePage';
import path from 'path';
import fs from 'fs';

// ─── JSON File Fallback ───────────────────────────────────────────────────────

const VERSES_DIR = path.join(process.cwd(), 'data/verses');
const HAS_DB = !!process.env.DATABASE_URL;

function loadVerseFromJson(slug: string): VersePageData | null {
  try {
    const filePath = path.join(VERSES_DIR, `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    return {
      id: raw.id || 0,
      book: raw.book,
      chapter: raw.chapter,
      verse: raw.verse,
      slug: raw.slug,
      testament: detectTestament(raw.book),
      text_niv: raw.text_niv || raw.scrapedText || raw.text || '',
      text_kjv: raw.text_kjv || raw.text || '',
      text_esv: raw.text_esv || raw.text || '',
      text_nlt: raw.text_nlt || raw.text || '',
      text_msg: raw.text_msg || '',
      text_nasb: raw.text_nasb || raw.text || '',
      context: raw.context || generateFallbackContext(raw),
      meaning: raw.meaning || generateFallbackMeaning(raw),
      application: raw.application || generateFallbackApplication(raw),
      prayer: raw.prayer || generateFallbackPrayer(raw),
      topics: [],
      cross_references: [],
      faqs: Array.isArray(raw.faqs) ? raw.faqs.map((f: any) => ({
        question: f.question,
        answer: f.answer,
        order: f.order_index || 0
      })) : [],
      popularity_score: 100
    };
  } catch (err) {
    return null;
  }
}

function getAllVerseSlugsFromFiles(): string[] {
  try {
    if (!fs.existsSync(VERSES_DIR)) return [];
    return fs.readdirSync(VERSES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort();
  } catch {
    return [];
  }
}

// ─── Database Functions ───────────────────────────────────────────────────────

/**
 * Get verse data by reference slug (e.g., "john-3-16")
 */
export async function getVerseData(reference: string): Promise<VersePageData | null> {
  // Try database first
  if (HAS_DB) {
    try {
      const verse = await queryOne<any>(
        `SELECT 
          v.id, v.book, v.chapter, v.verse, v.slug, v.testament,
          v.text_niv, v.text_kjv, v.text_esv, v.text_nlt, v.text_msg, v.text_nasb,
          v.context, v.meaning, v.application, v.prayer, v.popularity_score,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
            FILTER (WHERE t.id IS NOT NULL), '[]'
          ) as topics,
          COALESCE(
            json_agg(jsonb_build_object('question', f.question, 'answer', f.answer, 'order', f.order_index)
            ORDER BY f.order_index)
            FILTER (WHERE f.id IS NOT NULL), '[]'
          ) as faqs
        FROM verses v
        LEFT JOIN verse_topics vt ON v.id = vt.verse_id
        LEFT JOIN topics t ON vt.topic_id = t.id
        LEFT JOIN faqs f ON f.entity_type = 'verse' AND f.entity_id = v.id
        WHERE v.slug = $1
        GROUP BY v.id`,
        [reference]
      );

      if (verse) {
        return {
          id: verse.id,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          slug: verse.slug,
          testament: verse.testament || detectTestament(verse.book),
          text_niv: verse.text_niv,
          text_kjv: verse.text_kjv,
          text_esv: verse.text_esv,
          text_nlt: verse.text_nlt,
          text_msg: verse.text_msg,
          text_nasb: verse.text_nasb,
          context: verse.context || generateFallbackContext(verse),
          meaning: verse.meaning || generateFallbackMeaning(verse),
          application: verse.application || generateFallbackApplication(verse),
          prayer: verse.prayer || generateFallbackPrayer(verse),
          topics: Array.isArray(verse.topics) ? verse.topics : [],
          cross_references: [],
          faqs: Array.isArray(verse.faqs) ? verse.faqs : [],
          popularity_score: verse.popularity_score || 100
        };
      }
    } catch (error) {
      console.error('DB error for verse:', reference, (error as Error).message);
    }
  }

  // Fallback: read from JSON file
  return loadVerseFromJson(reference);
}

/**
 * Get all available verse slugs (for generateStaticParams)
 */
export async function getAllVerses(limit = 1000): Promise<string[]> {
  // Try database
  if (HAS_DB) {
    try {
      const verses = await query<{ slug: string }>(
        `SELECT slug FROM verses WHERE slug IS NOT NULL
         ORDER BY popularity_score DESC NULLS LAST LIMIT $1`,
        [limit]
      );
      if (verses.length > 0) return verses.map(v => v.slug);
    } catch (error) {
      console.error('Error fetching all verses from DB:', error);
    }
  }

  // Fallback: list JSON files
  const slugs = getAllVerseSlugsFromFiles();
  return slugs.slice(0, limit);
}

/**
 * Get popular verses in the same book
 */
export async function getPopularInBook(book: string, currentSlug: string, limit = 5) {
  if (HAS_DB) {
    try {
      const verses = await query<any>(
        `SELECT book, chapter, verse, slug FROM verses
         WHERE book = $1 AND slug != $2
         ORDER BY popularity_score DESC NULLS LAST LIMIT $3`,
        [book, currentSlug, limit]
      );
      if (verses.length > 0) return verses;
    } catch (error) {
      console.error('Error fetching popular in book:', error);
    }
  }

  // Fallback: read from JSON files (return same-book verses)
  try {
    const slugs = getAllVerseSlugsFromFiles();
    const bookSlug = book.toLowerCase().replace(/\s+/g, '-');
    return slugs
      .filter(s => s.startsWith(bookSlug) && s !== currentSlug)
      .slice(0, limit)
      .map(s => {
        const parts = s.split('-');
        const chapter = parseInt(parts[parts.length - 2]) || 0;
        const verse = parseInt(parts[parts.length - 1]) || 0;
        return { book, chapter, verse, slug: s };
      });
  } catch {
    return [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectTestament(book: string): string {
  const OT = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
    '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
    'Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah',
    'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah',
    'Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'];
  return OT.includes(book) ? 'Old Testament' : 'New Testament';
}

function generateFallbackContext(verse: any): string {
  return `This verse from ${verse.book} ${verse.chapter}:${verse.verse} is part of the ${detectTestament(verse.book)}. Explore the historical and literary context of this passage as you study God's Word.`;
}

function generateFallbackMeaning(verse: any): string {
  const text = verse.text_niv || verse.text_kjv || verse.text_esv || verse.text || '';
  return `${verse.book} ${verse.chapter}:${verse.verse} reveals important truths about God's character. "${text}" This passage invites us to deeper understanding of Scripture.`;
}

function generateFallbackApplication(verse: any): string {
  return `As you meditate on ${verse.book} ${verse.chapter}:${verse.verse}, consider how this truth applies to your daily walk with Christ. God's Word is living and active, speaking into every area of our lives.`;
}

function generateFallbackPrayer(verse: any): string {
  return `Father, thank You for Your Word in ${verse.book} ${verse.chapter}:${verse.verse}. Help me to understand and apply this truth in my life. Open my heart to receive what You want to teach me through this passage. In Jesus' name, Amen.`;
}
