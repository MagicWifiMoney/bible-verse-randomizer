/**
 * Bible API Wrapper
 * Provides access to Bible verse data from bolls.life API and local JSON files
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BibleVerse {
  pk: number;
  translation: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface VerseReference {
  book: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  slug: string;
}

// Book number to name mapping (1-66)
export const BOOK_NAMES: { [key: number]: string } = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
  6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
  16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
  21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
  26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
  31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
  36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi',
  40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
  45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
  50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy',
  55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James',
  60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John',
  65: 'Jude', 66: 'Revelation'
};

// Testament mapping
export const TESTAMENT: { [key: number]: string } = {
  ...Object.fromEntries(Array.from({length: 39}, (_, i) => [i + 1, 'Old Testament'])),
  ...Object.fromEntries(Array.from({length: 27}, (_, i) => [i + 40, 'New Testament']))
};

/**
 * Clean HTML tags from verse text (Strong's numbers, sup tags, etc.)
 */
export function cleanVerseText(text: string): string {
  return text
    .replace(/<S>\d+<\/S>/g, '') // Remove Strong's numbers
    .replace(/<sup>.*?<\/sup>/g, '') // Remove footnotes
    .replace(/<[^>]+>/g, '') // Remove any other HTML tags
    .trim();
}

/**
 * Create a slug from book, chapter, verse
 */
export function createSlug(book: string | number, chapter: number, verse: number): string {
  const bookName = typeof book === 'number' ? BOOK_NAMES[book] : book;
  return `${bookName.toLowerCase().replace(/\s+/g, '-')}-${chapter}-${verse}`;
}

/**
 * Load Bible translation from local JSON file
 */
export async function loadTranslationFromFile(
  translation: 'KJV' | 'NIV' | 'ESV' | 'NLT' | 'MSG' | 'NASB'
): Promise<BibleVerse[]> {
  const filePath = path.join(process.cwd(), 'data', `${translation}.json`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const verses: BibleVerse[] = JSON.parse(fileContent);
  
  return verses;
}

/**
 * Fetch a single verse from bolls.life API
 */
export async function fetchVerse(
  translation: string,
  book: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> {
  const url = `https://bolls.life/get-verse/${translation}/${book}/${chapter}/${verse}/`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch verse: ${url}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching verse: ${error}`);
    return null;
  }
}

/**
 * Get all verses grouped by reference (book, chapter, verse)
 * Returns a map of reference -> translations
 */
export function groupVersesByReference(verses: BibleVerse[]): Map<string, Map<string, string>> {
  const grouped = new Map<string, Map<string, string>>();
  
  for (const verse of verses) {
    const key = `${verse.book}-${verse.chapter}-${verse.verse}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, new Map());
    }
    
    const translations = grouped.get(key)!;
    translations.set(verse.translation, cleanVerseText(verse.text));
  }
  
  return grouped;
}

/**
 * Get all unique verse references from a set of verses
 */
export function getUniqueReferences(verses: BibleVerse[]): VerseReference[] {
  const seen = new Set<string>();
  const references: VerseReference[] = [];
  
  for (const verse of verses) {
    const key = `${verse.book}-${verse.chapter}-${verse.verse}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      
      const bookName = BOOK_NAMES[verse.book];
      const slug = createSlug(verse.book, verse.chapter, verse.verse);
      const testament = TESTAMENT[verse.book];
      
      references.push({
        book: bookName,
        bookNumber: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        slug
      });
    }
  }
  
  return references;
}

export default {
  loadTranslationFromFile,
  fetchVerse,
  cleanVerseText,
  createSlug,
  groupVersesByReference,
  getUniqueReferences,
  BOOK_NAMES,
  TESTAMENT
};
