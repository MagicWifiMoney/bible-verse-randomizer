/**
 * Verse Data Loader - Database Version
 * Loads verse data from PostgreSQL database
 */

import { query, queryOne } from './db';
import { VersePageData } from '@/components/templates/VersePage';

/**
 * Get verse data by reference slug (e.g., "john-3-16")
 */
export async function getVerseData(reference: string): Promise<VersePageData | null> {
  try {
    const verse = await queryOne<any>(
      `SELECT 
        v.id,
        v.book,
        v.chapter,
        v.verse,
        v.slug,
        v.testament,
        v.text_niv,
        v.text_kjv,
        v.text_esv,
        v.text_nlt,
        v.text_msg,
        v.text_nasb,
        v.context,
        v.meaning,
        v.application,
        v.prayer,
        v.popularity_score,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'slug', t.slug
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as topics,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'question', f.question,
              'answer', f.answer,
              'order', f.display_order
            ) ORDER BY f.display_order
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) as faqs
      FROM verses v
      LEFT JOIN verse_topics vt ON v.id = vt.verse_id
      LEFT JOIN topics t ON vt.topic_id = t.id
      LEFT JOIN faqs f ON v.id = f.verse_id
      WHERE v.slug = $1
      GROUP BY v.id`,
      [reference]
    );

    if (!verse) {
      return null;
    }

    // Transform to match VersePageData interface
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
      cross_references: [], // TODO: Add cross-references query
      faqs: Array.isArray(verse.faqs) ? verse.faqs : [],
      popularity_score: verse.popularity_score || 100
    };
  } catch (error) {
    console.error('Error fetching verse data:', error);
    return null;
  }
}

/**
 * Get all available verse slugs (for generateStaticParams)
 * Returns top verses by popularity to pre-generate
 */
export async function getAllVerses(limit = 1000): Promise<string[]> {
  try {
    const verses = await query<{ slug: string }>(
      `SELECT slug 
       FROM verses 
       WHERE slug IS NOT NULL
       ORDER BY popularity_score DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );
    return verses.map(v => v.slug);
  } catch (error) {
    console.error('Error fetching all verses:', error);
    return [];
  }
}

/**
 * Get popular verses in the same book
 */
export async function getPopularInBook(book: string, currentSlug: string, limit = 5) {
  try {
    const verses = await query<any>(
      `SELECT book, chapter, verse, slug
       FROM verses
       WHERE book = $1 AND slug != $2
       ORDER BY popularity_score DESC NULLS LAST
       LIMIT $3`,
      [book, currentSlug, limit]
    );
    return verses;
  } catch (error) {
    console.error('Error fetching popular verses in book:', error);
    return [];
  }
}

/**
 * Detect testament from book name (fallback)
 */
function detectTestament(book: string): string {
  const oldTestamentBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];
  
  return oldTestamentBooks.includes(book) ? 'Old Testament' : 'New Testament';
}

/**
 * Generate fallback content when AI content not yet available
 */
function generateFallbackContext(verse: any): string {
  return `This verse from ${verse.book} ${verse.chapter}:${verse.verse} is part of the ${detectTestament(verse.book)}. Explore the historical and literary context of this passage as you study God's Word.`;
}

function generateFallbackMeaning(verse: any): string {
  const text = verse.text_niv || verse.text_kjv || verse.text_esv || '';
  return `${verse.book} ${verse.chapter}:${verse.verse} reveals important truths about God's character and His relationship with humanity. "${text}" This passage invites us to deeper understanding of Scripture.`;
}

function generateFallbackApplication(verse: any): string {
  return `As you meditate on ${verse.book} ${verse.chapter}:${verse.verse}, consider how this truth applies to your daily walk with Christ. God's Word is living and active, speaking into every area of our lives.`;
}

function generateFallbackPrayer(verse: any): string {
  return `Father, thank You for Your Word in ${verse.book} ${verse.chapter}:${verse.verse}. Help me to understand and apply this truth in my life. Open my heart to receive what You want to teach me through this passage. In Jesus' name, Amen.`;
}
