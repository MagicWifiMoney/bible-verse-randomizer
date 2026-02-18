/**
 * Translation-Specific Chapter Data Loader
 * 
 * Generates chapter-level pages for KJV, ESV, NLT, MSG, NASB.
 * (NIV is the default at /book/[book]/[chapter])
 * 
 * 5 translations × 1,189 chapters = 5,945 pages.
 */

import kjvRaw from '@/data/KJV.json';
import esvRaw from '@/data/ESV.json';
import nltRaw from '@/data/NLT.json';
import msgRaw from '@/data/MSG.json';
import nasbRaw from '@/data/NASB.json';

interface RawVerse {
    pk: number;
    translation: string;
    book: number;
    chapter: number;
    verse: number;
    text: string;
    comment?: string;
}

const VALID_TRANSLATIONS = ['kjv', 'esv', 'nlt', 'msg', 'nasb'] as const;
type TranslationKey = typeof VALID_TRANSLATIONS[number];

const TRANSLATION_META: Record<TranslationKey, { name: string; fullName: string; approach: string; year: string; description: string }> = {
    kjv: {
        name: 'KJV',
        fullName: 'King James Version',
        approach: 'Formal equivalence (word-for-word)',
        year: '1611',
        description: 'The King James Version is the most influential English Bible translation in history. Commissioned by King James I and completed in 1611, it shaped the English language itself. Its majestic prose and formal accuracy make it beloved for memorization and liturgical use.',
    },
    esv: {
        name: 'ESV',
        fullName: 'English Standard Version',
        approach: 'Essentially literal',
        year: '2001 (rev. 2016)',
        description: 'The ESV balances word-for-word accuracy with modern English readability. Favored by scholars and pastors for study and preaching, it preserves the structure of the original Hebrew and Greek while using clear, contemporary language.',
    },
    nlt: {
        name: 'NLT',
        fullName: 'New Living Translation',
        approach: 'Dynamic equivalence (thought-for-thought)',
        year: '1996 (rev. 2015)',
        description: 'The NLT renders the original texts into clear, natural English, prioritizing meaning over word-for-word correspondence. It is excellent for devotional reading and for those new to the Bible, making ancient truths immediately understandable.',
    },
    msg: {
        name: 'MSG',
        fullName: 'The Message',
        approach: 'Contemporary paraphrase',
        year: '2002',
        description: 'The Message by Eugene Peterson presents the Bible in the rhythms and idioms of contemporary American English. More than a translation, it is a paraphrase designed to help readers experience Scripture\'s impact as if hearing it for the first time.',
    },
    nasb: {
        name: 'NASB',
        fullName: 'New American Standard Bible',
        approach: 'Formal equivalence (most literal)',
        year: '1971 (rev. 2020)',
        description: 'The NASB is widely regarded as the most literally accurate English translation. It is the standard for in-depth word study and academic analysis, preserving the exact structure and terminology of the original languages as closely as possible.',
    },
};

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
    50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10,
    13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9,
    1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16,
    16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22,
];

function cleanKjvText(text: string): string {
    return text.replace(/<S>\d+<\/S>/g, '').replace(/\s+/g, ' ').trim();
}

function cleanHtml(text: string): string {
    return text.replace(/<br\/>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Build per-translation indexed data: Map<bookNum-chapter, verse[]>
type ChapterIndex = Map<string, Array<{ verse: number; text: string }>>;

function buildChapterIndex(rawVerses: RawVerse[], isKjv = false): ChapterIndex {
    const index: ChapterIndex = new Map();
    for (const v of rawVerses) {
        const key = `${v.book}-${v.chapter}`;
        if (!index.has(key)) index.set(key, []);
        const cleaned = isKjv ? cleanKjvText(v.text) : cleanHtml(v.text);
        index.get(key)!.push({ verse: v.verse, text: cleaned });
    }
    // Sort each chapter's verses
    for (const verses of index.values()) {
        verses.sort((a, b) => a.verse - b.verse);
    }
    return index;
}

const indexes: Record<TranslationKey, ChapterIndex> = {
    kjv: buildChapterIndex(kjvRaw as RawVerse[], true),
    esv: buildChapterIndex(esvRaw as RawVerse[]),
    nlt: buildChapterIndex(nltRaw as RawVerse[]),
    msg: buildChapterIndex(msgRaw as RawVerse[]),
    nasb: buildChapterIndex(nasbRaw as RawVerse[]),
};

const slugToIndex = new Map<string, number>();
for (let i = 0; i < BOOK_SLUGS.length; i++) {
    slugToIndex.set(BOOK_SLUGS[i], i);
}

export interface TranslationChapterData {
    bookName: string;
    bookSlug: string;
    chapter: number;
    totalChapters: number;
    translation: TranslationKey;
    translationMeta: typeof TRANSLATION_META[TranslationKey];
    verses: Array<{ verse: number; text: string }>;
    prevChapter: { bookSlug: string; bookName: string; chapter: number } | null;
    nextChapter: { bookSlug: string; bookName: string; chapter: number } | null;
}

export function getAllTranslationChapterParams(): Array<{ book: string; chapter: string; translation: string }> {
    const params: Array<{ book: string; chapter: string; translation: string }> = [];
    for (const t of VALID_TRANSLATIONS) {
        for (let i = 0; i < BOOK_SLUGS.length; i++) {
            for (let ch = 1; ch <= BOOK_CHAPTERS[i]; ch++) {
                params.push({ book: BOOK_SLUGS[i], chapter: String(ch), translation: t });
            }
        }
    }
    return params;
}

export function getTranslationChapterData(bookSlug: string, chapter: number, translation: string): TranslationChapterData | null {
    const t = translation.toLowerCase() as TranslationKey;
    if (!VALID_TRANSLATIONS.includes(t)) return null;

    const bookIdx = slugToIndex.get(bookSlug);
    if (bookIdx === undefined) return null;
    if (chapter < 1 || chapter > BOOK_CHAPTERS[bookIdx]) return null;

    const bookNum = bookIdx + 1;
    const key = `${bookNum}-${chapter}`;
    const verses = indexes[t].get(key);
    if (!verses || verses.length === 0) return null;

    // Prev/next chapter
    let prevChapter: TranslationChapterData['prevChapter'] = null;
    let nextChapter: TranslationChapterData['nextChapter'] = null;

    if (chapter > 1) {
        prevChapter = { bookSlug, bookName: BOOK_NAMES[bookIdx], chapter: chapter - 1 };
    } else if (bookIdx > 0) {
        const prevIdx = bookIdx - 1;
        prevChapter = { bookSlug: BOOK_SLUGS[prevIdx], bookName: BOOK_NAMES[prevIdx], chapter: BOOK_CHAPTERS[prevIdx] };
    }

    if (chapter < BOOK_CHAPTERS[bookIdx]) {
        nextChapter = { bookSlug, bookName: BOOK_NAMES[bookIdx], chapter: chapter + 1 };
    } else if (bookIdx < BOOK_SLUGS.length - 1) {
        const nextIdx = bookIdx + 1;
        nextChapter = { bookSlug: BOOK_SLUGS[nextIdx], bookName: BOOK_NAMES[nextIdx], chapter: 1 };
    }

    return {
        bookName: BOOK_NAMES[bookIdx],
        bookSlug,
        chapter,
        totalChapters: BOOK_CHAPTERS[bookIdx],
        translation: t,
        translationMeta: TRANSLATION_META[t],
        verses,
        prevChapter,
        nextChapter,
    };
}

export function isValidTranslation(t: string): boolean {
    return VALID_TRANSLATIONS.includes(t.toLowerCase() as TranslationKey);
}

export { VALID_TRANSLATIONS, TRANSLATION_META };
