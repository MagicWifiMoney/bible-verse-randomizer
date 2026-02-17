/**
 * Chapter Data Loader
 * Provides verse data for chapter-level pages, pulling from NIV.json.
 * Generates per-chapter content, FAQ, and cross-links for 1,189 indexable pages.
 */

import nivVerses from '@/data/NIV.json';

interface NivVerse {
    pk: number;
    translation: string;
    book: number;      // 1-based book number
    chapter: number;
    verse: number;
    text: string;
}

// Canonical book order (matches NIV.json book numbers 1-66)
const BOOK_NAMES: string[] = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John',
    '3 John', 'Jude', 'Revelation',
];

const BOOK_SLUGS: string[] = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1-samuel', '2-samuel',
    '1-kings', '2-kings', '1-chronicles', '2-chronicles', 'ezra',
    'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
    'ecclesiastes', 'song-of-solomon', 'isaiah', 'jeremiah', 'lamentations',
    'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk',
    'zephaniah', 'haggai', 'zechariah', 'malachi',
    'matthew', 'mark', 'luke', 'john', 'acts',
    'romans', '1-corinthians', '2-corinthians', 'galatians', 'ephesians',
    'philippians', 'colossians', '1-thessalonians', '2-thessalonians',
    '1-timothy', '2-timothy', 'titus', 'philemon', 'hebrews',
    'james', '1-peter', '2-peter', '1-john', '2-john',
    '3-john', 'jude', 'revelation',
];

const BOOK_CHAPTERS: number[] = [
    50, 40, 27, 36, 34, 24, 21, 4, 31, 24,
    22, 25, 29, 36, 10, 13, 10, 42, 150, 31,
    12, 8, 66, 52, 5, 48, 12, 14, 3, 9,
    1, 4, 7, 3, 3, 3, 2, 14, 4,
    28, 16, 24, 21, 28, 16, 16, 13, 6, 6,
    4, 4, 5, 3, 6, 4, 3, 1, 13,
    5, 5, 3, 5, 1, 1, 1, 22,
];

// Pre-index verses by bookNum+chapter at module load
const allVerses = nivVerses as NivVerse[];
const chapterIndex = new Map<string, NivVerse[]>();
for (const v of allVerses) {
    const key = `${v.book}-${v.chapter}`;
    if (!chapterIndex.has(key)) chapterIndex.set(key, []);
    chapterIndex.get(key)!.push(v);
}

export interface ChapterVerse {
    verse: number;
    text: string;
}

export interface ChapterPageData {
    bookName: string;
    bookSlug: string;
    chapter: number;
    totalChapters: number;
    verses: ChapterVerse[];
    prevChapter: { bookSlug: string; bookName: string; chapter: number } | null;
    nextChapter: { bookSlug: string; bookName: string; chapter: number } | null;
}

function getBookNumber(slug: string): number {
    const idx = BOOK_SLUGS.indexOf(slug);
    return idx >= 0 ? idx + 1 : -1; // NIV uses 1-based
}

/**
 * Returns all valid (bookSlug, chapter) combos for generateStaticParams
 */
export function getAllChapterParams(): { book: string; chapter: string }[] {
    const params: { book: string; chapter: string }[] = [];
    for (let i = 0; i < BOOK_SLUGS.length; i++) {
        for (let ch = 1; ch <= BOOK_CHAPTERS[i]; ch++) {
            params.push({ book: BOOK_SLUGS[i], chapter: String(ch) });
        }
    }
    return params;
}

/**
 * Get chapter data for a specific book + chapter
 */
export function getChapterData(bookSlug: string, chapter: number): ChapterPageData | null {
    const slugIdx = BOOK_SLUGS.indexOf(bookSlug);
    if (slugIdx < 0) return null;

    const bookNum = slugIdx + 1;
    const totalChapters = BOOK_CHAPTERS[slugIdx];
    if (chapter < 1 || chapter > totalChapters) return null;

    const key = `${bookNum}-${chapter}`;
    const raw = chapterIndex.get(key) || [];
    const verses: ChapterVerse[] = raw
        .sort((a, b) => a.verse - b.verse)
        .map(v => ({
            verse: v.verse,
            text: v.text.replace(/<br\/>/g, '\n'),
        }));

    if (verses.length === 0) return null;

    // Compute prev/next — cross book boundaries
    let prevChapter: ChapterPageData['prevChapter'] = null;
    let nextChapter: ChapterPageData['nextChapter'] = null;

    if (chapter > 1) {
        prevChapter = { bookSlug, bookName: BOOK_NAMES[slugIdx], chapter: chapter - 1 };
    } else if (slugIdx > 0) {
        prevChapter = {
            bookSlug: BOOK_SLUGS[slugIdx - 1],
            bookName: BOOK_NAMES[slugIdx - 1],
            chapter: BOOK_CHAPTERS[slugIdx - 1],
        };
    }

    if (chapter < totalChapters) {
        nextChapter = { bookSlug, bookName: BOOK_NAMES[slugIdx], chapter: chapter + 1 };
    } else if (slugIdx < BOOK_SLUGS.length - 1) {
        nextChapter = {
            bookSlug: BOOK_SLUGS[slugIdx + 1],
            bookName: BOOK_NAMES[slugIdx + 1],
            chapter: 1,
        };
    }

    return {
        bookName: BOOK_NAMES[slugIdx],
        bookSlug,
        chapter,
        totalChapters,
        verses,
        prevChapter,
        nextChapter,
    };
}
