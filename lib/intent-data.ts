/**
 * Intent Data Loader
 * Loads intent data from intents-master.json and cross-references with priority verses.
 */

import { IntentPageData } from '@/components/templates/IntentPage';
import intentsRaw from '@/data/intents-master.json';
import priorityVerses from '@/data/priority-1000.json';

interface RawIntent { slug: string; title: string; searchVolume: number; competition: number | null; }
interface PriorityVerse { id: number; book: string; chapter: number; verse: number; slug: string; text_niv: string; }

const MIN_SEARCH_VOLUME = 800;

function categorizeIntent(slug: string): string {
    if (slug.includes('tattoo')) return 'Tattoo Inspiration';
    if (slug.includes('wedding') || slug.includes('anniversary') || slug.includes('couples')) return 'Weddings & Love';
    if (slug.includes('funeral') || slug.includes('memorial') || slug.includes('losing')) return 'Grief & Remembrance';
    if (slug.includes('graduation') || slug.includes('new-job') || slug.includes('retirement') || slug.includes('new-beginnings')) return 'Life Milestones';
    if (slug.includes('christmas') || slug.includes('easter') || slug.includes('thanksgiving') || slug.includes('good-friday') || slug.includes('lent') || slug.includes('advent')) return 'Holidays & Seasons';
    if (slug.includes('instagram') || slug.includes('facebook') || slug.includes('social-media') || slug.includes('cards')) return 'Sharing & Social';
    if (slug.includes('kids') || slug.includes('children') || slug.includes('teens') || slug.includes('youth') || slug.includes('students')) return 'For Young People';
    if (slug.includes('women') || slug.includes('men') || slug.includes('mothers') || slug.includes('teachers')) return 'Audience Specific';
    if (slug.includes('kjv') || slug.includes('niv') || slug.includes('esv')) return 'By Translation';
    if (slug.includes('short') || slug.includes('famous') || slug.includes('popular') || slug.includes('powerful') || slug.includes('inspirational')) return 'By Type';
    if (slug.includes('anxiety') || slug.includes('depression') || slug.includes('fear') || slug.includes('grief') || slug.includes('loneliness') || slug.includes('suffering')) return 'Difficult Times';
    if (slug.includes('baptism') || slug.includes('confirmation')) return 'Sacraments';
    if (slug.includes('baby-shower') || slug.includes('pregnancy')) return 'New Life';
    return 'General';
}

const INTENT_KEYWORDS: Record<string, string[]> = {
    'for-tattoos': ['short', 'strength', 'faith', 'love'],
    'for-weddings': ['love', 'marriage', 'husband', 'wife', 'united'],
    'for-funerals': ['death', 'eternal', 'comfort', 'rest', 'peace', 'heaven'],
    'for-comfort': ['comfort', 'peace', 'rest', 'weary'],
    'for-strength': ['strength', 'strong', 'power', 'mighty', 'courage'],
    'for-encouragement': ['encourage', 'strengthen', 'courage', 'hope'],
    'for-love': ['love', 'loved', 'loves'],
    'for-healing': ['heal', 'healed', 'healing', 'restore'],
    'for-hope': ['hope', 'future', 'plans', 'purpose'],
    'for-peace': ['peace', 'rest', 'still', 'calm'],
    'for-faith': ['faith', 'believe', 'trust'],
    'for-guidance': ['guide', 'lead', 'path', 'way', 'wisdom'],
    'for-anxiety': ['anxious', 'worry', 'fear', 'peace'],
    'for-wisdom': ['wisdom', 'wise', 'understanding'],
    'for-depression': ['despair', 'downcast', 'hope', 'joy'],
    'for-grief': ['grief', 'mourn', 'comfort', 'sorrow'],
    'for-graduation': ['future', 'plans', 'purpose', 'prosper'],
    'for-marriage': ['love', 'marriage', 'husband', 'wife'],
    'for-protection': ['protect', 'shield', 'refuge', 'fortress'],
    'for-birthday': ['bless', 'life', 'joy', 'gift'],
    'for-family': ['family', 'children', 'father', 'mother'],
    'for-forgiveness': ['forgive', 'forgiven', 'pardon', 'mercy'],
    'for-patience': ['patience', 'patient', 'endure', 'wait'],
    'for-joy': ['joy', 'rejoice', 'glad'],
    'for-courage': ['courage', 'strong', 'brave', 'bold'],
    'for-thanksgiving': ['thank', 'thankful', 'grateful', 'praise'],
    'for-prayer': ['pray', 'prayer', 'ask', 'seek'],
    'for-baptism': ['baptize', 'baptized', 'water', 'Spirit'],
    'daily': ['day', 'morning', 'daily', 'today'],
    'short': ['God', 'love', 'faith', 'hope', 'peace'],
    'popular': ['God', 'love', 'faith', 'Lord'],
    'powerful': ['power', 'mighty', 'strength', 'Lord'],
};

function buildIntentList(): RawIntent[] {
    return (intentsRaw as RawIntent[])
        .filter(i => i.searchVolume >= MIN_SEARCH_VOLUME)
        .sort((a, b) => b.searchVolume - a.searchVolume);
}

let _intents: RawIntent[] | null = null;
function getIntents() {
    if (!_intents) _intents = buildIntentList();
    return _intents;
}

function findVersesForIntent(slug: string, limit = 15) {
    const allVerses = priorityVerses as PriorityVerse[];
    const keywords = INTENT_KEYWORDS[slug] || [];
    const derived = slug.replace(/^for-/, '').split('-').filter(w => w.length > 2);
    const terms = [...new Set([...keywords, ...derived])].map(k => k.toLowerCase());
    if (terms.length === 0) return [];

    const scored: Array<{ verse: PriorityVerse; score: number }> = [];
    for (const v of allVerses) {
        const text = (v.text_niv || '').toLowerCase();
        let score = 0;
        for (const t of terms) { if (text.includes(t)) score++; }
        if (score > 0) scored.push({ verse: v, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
}

function hashSlug(slug: string): number {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = ((hash << 5) - hash) + slug.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

export function getAllIntentSlugs(): string[] {
    return getIntents().map(i => i.slug);
}

export function getIntentData(slug: string): IntentPageData | null {
    const intent = getIntents().find(i => i.slug === slug);
    if (!intent) return null;

    const matched = findVersesForIntent(slug);
    const verses = matched.map(m => ({
        id: m.verse.id,
        book: m.verse.book,
        chapter: m.verse.chapter,
        verse: m.verse.verse,
        slug: m.verse.slug,
        text: m.verse.text_niv,
        usage_note: undefined,
    }));

    return {
        id: hashSlug(slug),
        name: intent.title,
        slug: intent.slug,
        category: categorizeIntent(intent.slug),
        verses,
    };
}

/**
 * Get related intent slugs for internal linking.
 * Prioritizes intents in the same category, then pads with others.
 */
export function getRelatedIntentSlugs(slug: string, limit = 6): string[] {
    const current = getIntents().find(i => i.slug === slug);
    if (!current) return [];

    const currentCategory = categorizeIntent(slug);
    const allSlugs = getAllIntentSlugs().filter(s => s !== slug);

    // Same category first
    const sameCategory = allSlugs.filter(s => categorizeIntent(s) === currentCategory);
    const others = allSlugs.filter(s => categorizeIntent(s) !== currentCategory);

    return [...sameCategory, ...others].slice(0, limit);
}
