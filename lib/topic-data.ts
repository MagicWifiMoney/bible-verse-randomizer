/**
 * Topic Data Loader
 * 
 * Loads topic data from topics-master.json and cross-references
 * with priority verses to populate topic pages.
 */

import { TopicPageData } from '@/components/templates/TopicPage';
import topicsRaw from '@/data/topics-master.json';
import priorityVerses from '@/data/priority-1000.json';

// ── Types ──────────────────────────────────────────────────────

interface RawTopic {
    slug: string;
    title: string;
    searchVolume: number;
    competition: number | null;
}

interface PriorityVerse {
    id: number;
    book: string;
    chapter: number;
    verse: number;
    slug: string;
    text_niv: string;
}

// ── Constants ──────────────────────────────────────────────────

const MIN_SEARCH_VOLUME = 5000;

/**
 * Canonical topic groups — map variant slugs back to a single canonical page.
 * This prevents thin/duplicate pages for near-synonyms.
 */
const CANONICAL_MAP: Record<string, string> = {
    'loving': 'love',
    'love-god': 'love',
    'gods-love': 'love',
    'god-s-love': 'love',
    'love-of-god': 'love',
    'the-love-of-god': 'love',
    'love-from-god': 'love',
    'love-for-god': 'love',
    'being-loved-by-god': 'love',
    'loving-god': 'love',
    'god-love': 'love',
    'encouraging': 'encouragement',
    'healers': 'healing',
    'anxious': 'anxiety',
    'anxiousness': 'anxiety',
    'for-forgiveness': 'forgiveness',
    'forgiveness-of-sins': 'forgiveness',
    'forgiving': 'forgiveness',
    'grieving': 'grief',
    'worrying': 'worry',
    'worries': 'worry',
    'the-day': 'day',
    'days': 'day',
    'verses': 'love', // too generic, merge
    'joyful': 'joy',
    'joyfulness': 'joy',
    'being-patient': 'patience',
    'trusting-god': 'trust-in-god',
    'trusting-in-god': 'trust-in-god',
    'trusting-in-the-lord': 'trust-in-god',
    'trusting-the-lord': 'trust-in-god',
    'trust-in-the-lord': 'trust-in-god',
    'matrimony': 'marriage',
    'marriages': 'marriage',
    'a-relationship': 'relationship',
    'relationships': 'relationship',
    'gratefulness': 'gratitude',
    'thankfulness': 'gratitude',
    'being-thankful': 'gratitude',
    'mom': 'mother',
    'moms': 'mother',
    'mothers': 'mother',
    'a-mother': 'mother',
    'motherhood': 'mother',
    'mothering': 'mother',
    'xmas': 'christmas',
    'the-dead': 'death',
    'dying': 'death',
    'pray': 'prayer',
    'prayers': 'prayer',
    'praying': 'prayer',
    'repent': 'repentance',
    'athletics': 'athletes',
    'the-holy-spirit': 'holy-spirit',
    'the-fruits-of-holy-spirit': 'fruit-of-the-spirit',
    'the-fruits-of-the-spirit': 'fruit-of-the-spirit',
    'fruits-of-the-spirit': 'fruit-of-the-spirit',
    'the-fruit-of-the-spirit': 'fruit-of-the-spirit',
    'fruit-of-the-holy-spirit': 'fruit-of-the-spirit',
    'a-friend': 'friendship',
    'a-good-friend': 'friendship',
    'the-family': 'family',
    'birthday': 'birthdays',
    'consolation': 'comfort',
    'comforting': 'comfort',
    'thanksgiving-day': 'thanksgiving',
    'wrath': 'anger',
    'funerals': 'funeral-service',
    'hard-times-and-strength': 'strength-in-hard-times',
    'healing-and-strength': 'strength-and-healing',
    'strength-and-healing': 'strength-in-hard-times',
    'love-thy-neighbor': 'loving-thy-neighbor',
    'loving-your-neighbor': 'loving-thy-neighbor',
    'guarding-your-heart': 'guarding-your-heart', // keep as-is (unique)
    'love-for-marriage': 'marriage',
    'love-and-marriage': 'marriage',
    'love-marriage': 'marriage',
    'marriage-and-love': 'marriage',
    'marriage-love': 'marriage',
    'iron-sharpens-iron': 'iron-sharpens-iron', // keep as-is (unique)
    'praying-for-healing': 'healing',
    'honoring-your-father-and-mother': 'honoring-your-father-and-mother', // keep
    'work-hard': 'hard-work',
};

// ── Topic keyword → verse keyword matching ─────────────────────

const TOPIC_VERSE_KEYWORDS: Record<string, string[]> = {
    'love': ['love', 'loved', 'loves', 'loving'],
    'faith': ['faith', 'believe', 'believed', 'believes', 'trust'],
    'hope': ['hope', 'hoped', 'hopes'],
    'peace': ['peace', 'peaceful'],
    'strength': ['strength', 'strong', 'mighty', 'power'],
    'encouragement': ['encourage', 'encouraged', 'comfort', 'strengthen'],
    'healing': ['heal', 'healed', 'healing', 'restore'],
    'prayer': ['pray', 'prayer', 'prayed'],
    'forgiveness': ['forgive', 'forgiven', 'forgiveness', 'pardon'],
    'joy': ['joy', 'joyful', 'rejoice', 'glad'],
    'anxiety': ['anxious', 'anxiety', 'worry', 'fear'],
    'grief': ['grief', 'grieve', 'mourn', 'mourning', 'sorrow'],
    'patience': ['patience', 'patient', 'endure', 'persevere'],
    'marriage': ['marriage', 'husband', 'wife', 'marry'],
    'family': ['family', 'children', 'father', 'mother', 'parents'],
    'comfort': ['comfort', 'comforted', 'consolation'],
    'trust-in-god': ['trust', 'trusted', 'trusting'],
    'gratitude': ['thank', 'thankful', 'grateful', 'thanksgiving'],
    'death': ['death', 'die', 'died', 'dead'],
    'anger': ['anger', 'angry', 'wrath'],
    'humility': ['humble', 'humility', 'meek'],
    'protection': ['protect', 'protection', 'shield', 'refuge', 'shelter'],
    'wisdom': ['wisdom', 'wise', 'understanding'],
    'christmas': ['born', 'manger', 'bethlehem', 'shepherd'],
    'depression': ['despair', 'downcast', 'affliction'],
    'perseverance': ['persevere', 'endure', 'steadfast', 'perseverance'],
    'hard-work': ['work', 'labor', 'diligent'],
    'baptism': ['baptize', 'baptized', 'baptism', 'water'],
    'communion': ['bread', 'wine', 'body', 'blood', 'remembrance'],
    'repentance': ['repent', 'repentance', 'turn'],
};

// ── Build deduplicated topic map ───────────────────────────────

function buildTopicMap(): Map<string, { title: string; searchVolume: number; variants: string[] }> {
    const map = new Map<string, { title: string; searchVolume: number; variants: string[] }>();
    const topics = topicsRaw as RawTopic[];

    for (const t of topics) {
        const canonical = CANONICAL_MAP[t.slug] || t.slug;

        const existing = map.get(canonical);
        if (existing) {
            // Keep highest search volume title
            if (t.searchVolume > existing.searchVolume) {
                existing.title = t.title;
                existing.searchVolume = t.searchVolume;
            }
            if (!existing.variants.includes(t.slug)) {
                existing.variants.push(t.slug);
            }
        } else {
            map.set(canonical, {
                title: t.title,
                searchVolume: t.searchVolume,
                variants: [t.slug],
            });
        }
    }

    return map;
}

let _topicMap: Map<string, { title: string; searchVolume: number; variants: string[] }> | null = null;
function getTopicMap() {
    if (!_topicMap) _topicMap = buildTopicMap();
    return _topicMap;
}

// ── Match verses to a topic ────────────────────────────────────

function findVersesForTopic(slug: string, variants: string[], limit = 20) {
    const allVerses = priorityVerses as PriorityVerse[];
    const keywords = TOPIC_VERSE_KEYWORDS[slug] || [];

    // Also derive keywords from slug and variants
    const derivedKeywords = [slug, ...variants]
        .flatMap(s => s.split('-'))
        .filter(w => w.length > 2);
    const searchTerms = [...new Set([...keywords, ...derivedKeywords])].map(k => k.toLowerCase());

    if (searchTerms.length === 0) return [];

    const scored: Array<{ verse: PriorityVerse; score: number }> = [];

    for (const v of allVerses) {
        const text = (v.text_niv || '').toLowerCase();
        let score = 0;
        for (const term of searchTerms) {
            if (text.includes(term)) score++;
        }
        if (score > 0) {
            scored.push({ verse: v, score });
        }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
}

// ── Generate description for a topic ───────────────────────────

function generateDescription(title: string, verseCount: number): string {
    return `${title} is a powerful theme throughout the Bible. Explore ${verseCount}+ carefully selected Scripture passages about ${title.toLowerCase()}, each with context and meaning to deepen your understanding of God's Word.`;
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Get all topic slugs for generateStaticParams.
 * Only returns topics with sufficient search volume.
 */
export function getAllTopicSlugs(): string[] {
    const map = getTopicMap();
    const slugs: string[] = [];

    for (const [slug, data] of map.entries()) {
        if (data.searchVolume >= MIN_SEARCH_VOLUME) {
            slugs.push(slug);
        }
    }

    return slugs;
}

/**
 * Get topic data by slug, matching the TopicPageData interface.
 */
export function getTopicData(slug: string): TopicPageData | null {
    const map = getTopicMap();

    // Check if this slug is a variant → redirect-like behavior (serve canonical)
    const canonical = CANONICAL_MAP[slug] || slug;
    const topicEntry = map.get(canonical);

    if (!topicEntry) return null;

    // Find matching verses
    const matchedVerses = findVersesForTopic(canonical, topicEntry.variants);

    if (matchedVerses.length === 0) {
        // Even without matched verses, still return the page with empty list
    }

    const verses = matchedVerses.map((m, i) => ({
        id: m.verse.id,
        book: m.verse.book,
        chapter: m.verse.chapter,
        verse: m.verse.verse,
        slug: m.verse.slug,
        text: m.verse.text_niv,
        relevance_score: m.score,
        category: undefined,
    }));

    return {
        id: hashSlug(canonical),
        name: topicEntry.title,
        slug: canonical,
        description: generateDescription(topicEntry.title, verses.length),
        level: 1,
        verses,
    };
}

/**
 * Get related topic slugs for internal linking.
 * Returns topics that share keywords with the given slug.
 */
export function getRelatedTopicSlugs(slug: string, limit = 6): string[] {
    const allSlugs = getAllTopicSlugs();
    const sourceKeywords = new Set(
        (TOPIC_VERSE_KEYWORDS[slug] || slug.split('-')).map(k => k.toLowerCase())
    );

    const scored: Array<{ slug: string; overlap: number }> = [];

    for (const other of allSlugs) {
        if (other === slug) continue;
        const otherKeywords = (TOPIC_VERSE_KEYWORDS[other] || other.split('-')).map(k => k.toLowerCase());
        const overlap = otherKeywords.filter(k => sourceKeywords.has(k)).length;
        // Also score by slug word overlap
        const slugOverlap = other.split('-').filter(w => sourceKeywords.has(w)).length;
        const total = overlap + slugOverlap;
        if (total > 0) {
            scored.push({ slug: other, overlap: total });
        }
    }

    scored.sort((a, b) => b.overlap - a.overlap);

    // If we don't have enough related, pad with random high-SV topics
    const result = scored.slice(0, limit).map(s => s.slug);
    if (result.length < limit) {
        for (const s of allSlugs) {
            if (result.length >= limit) break;
            if (s !== slug && !result.includes(s)) result.push(s);
        }
    }

    return result;
}

/** Simple numeric hash from slug for stable IDs */
function hashSlug(slug: string): number {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = ((hash << 5) - hash) + slug.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}
