/**
 * Verse Data Loader
 * Loads verse data from static JSON (for initial deployment)
 * Will be replaced with database queries when scaling
 */

import verses from '@/public/api/verses.json';
import { VersePageData } from '@/components/templates/VersePage';

export async function getVerseData(reference: string): Promise<VersePageData | null> {
  const verseData = verses[reference as keyof typeof verses];
  
  if (!verseData) {
    return null;
  }

  // Transform to match VersePageData interface
  return {
    id: 1, // Static ID for now
    book: verseData.book,
    chapter: verseData.chapter,
    verse: verseData.verse,
    slug: verseData.slug,
    testament: verseData.book.includes('Genesis') || verseData.book.includes('Exodus') || 
               verseData.book.includes('Psalm') || verseData.book.includes('Proverbs') ||
               verseData.book.includes('Isaiah') || verseData.book.includes('Jeremiah') ||
               verseData.book.includes('Joshua') ? 'Old Testament' : 'New Testament',
    text_niv: verseData.text_niv,
    text_kjv: verseData.text_kjv,
    text_esv: verseData.text_esv,
    text_nlt: verseData.text_nlt,
    text_msg: verseData.text_msg,
    text_nasb: verseData.text_nasb,
    context: verseData.context,
    meaning: verseData.meaning,
    application: verseData.application,
    prayer: verseData.prayer,
    topics: extractTopics(reference),
    cross_references: [],
    faqs: verseData.faqs || [],
    popularity_score: 1000
  };
}

/**
 * Extract topics based on verse content
 */
function extractTopics(reference: string): Array<{ id: number; name: string; slug: string }> {
  const topicMap: Record<string, Array<{ id: number; name: string; slug: string }>> = {
    'john-3-16': [
      { id: 1, name: 'Love', slug: 'love' },
      { id: 2, name: 'Salvation', slug: 'salvation' },
      { id: 3, name: 'Faith', slug: 'faith' }
    ],
    'jeremiah-29-11': [
      { id: 4, name: 'Hope', slug: 'hope' },
      { id: 5, name: 'Trust', slug: 'trust' },
      { id: 6, name: 'Future', slug: 'future' }
    ],
    'philippians-4-13': [
      { id: 7, name: 'Strength', slug: 'strength' },
      { id: 8, name: 'Courage', slug: 'courage' },
      { id: 9, name: 'Faith', slug: 'faith' }
    ],
    'psalms-23-1': [
      { id: 10, name: 'Comfort', slug: 'comfort' },
      { id: 11, name: 'Provision', slug: 'provision' },
      { id: 12, name: 'Peace', slug: 'peace' }
    ],
    'romans-8-28': [
      { id: 13, name: 'Hope', slug: 'hope' },
      { id: 14, name: 'Trust', slug: 'trust' },
      { id: 15, name: 'Providence', slug: 'providence' }
    ],
    'proverbs-3-5': [
      { id: 16, name: 'Wisdom', slug: 'wisdom' },
      { id: 17, name: 'Trust', slug: 'trust' },
      { id: 18, name: 'Guidance', slug: 'guidance' }
    ],
    'isaiah-41-10': [
      { id: 19, name: 'Courage', slug: 'courage' },
      { id: 20, name: 'Strength', slug: 'strength' },
      { id: 21, name: 'Comfort', slug: 'comfort' }
    ],
    'matthew-6-33': [
      { id: 22, name: 'Priority', slug: 'priority' },
      { id: 23, name: 'Trust', slug: 'trust' },
      { id: 24, name: 'Kingdom', slug: 'kingdom' }
    ],
    '2-timothy-1-7': [
      { id: 25, name: 'Courage', slug: 'courage' },
      { id: 26, name: 'Power', slug: 'power' },
      { id: 27, name: 'Love', slug: 'love' }
    ],
    'joshua-1-9': [
      { id: 28, name: 'Courage', slug: 'courage' },
      { id: 29, name: 'Strength', slug: 'strength' },
      { id: 30, name: 'Faith', slug: 'faith' }
    ]
  };

  return topicMap[reference] || [];
}

/**
 * Get all available verses
 */
export function getAllVerses() {
  return Object.keys(verses);
}

/**
 * Get popular verses in same book
 */
export async function getPopularInBook(book: string, currentSlug: string) {
  const allVerses = Object.values(verses);
  return allVerses
    .filter(v => v.book === book && v.slug !== currentSlug)
    .map(v => ({
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      slug: v.slug
    }))
    .slice(0, 5);
}
