/**
 * Internal Links Engine
 * 
 * Implements hub-and-spoke linking strategy for 200k+ pages.
 * Every page should have 10-15 contextual internal links.
 * 
 * Strategy:
 * - Breadcrumbs (always)
 * - Parent/hub page
 * - Sibling pages (3-5)
 * - Related by topic (5-7)
 * - Cross-references (for verses)
 * - Popular in category (3-5)
 * 
 * Usage:
 *   const links = await getRelatedLinks('verse', verseData, db);
 */

export interface InternalLink {
  url: string;
  text: string;
  type: 'breadcrumb' | 'parent' | 'sibling' | 'related' | 'cross-reference' | 'popular' | 'topic';
  priority?: number; // 1-10, for sorting
}

export interface LinkSection {
  title: string;
  links: InternalLink[];
}

export type PageType = 'verse' | 'topic' | 'intent' | 'book' | 'chapter' | 'home';

/**
 * Main function: Get all related links for a page
 */
export async function getRelatedLinks(
  pageType: PageType,
  data: any,
  context?: {
    db?: any; // Database client
    baseUrl?: string;
    maxLinks?: number;
  }
): Promise<LinkSection[]> {
  const baseUrl = context?.baseUrl || 'https://bibleverserandomizer.com';
  const maxLinks = context?.maxLinks || 15;

  switch (pageType) {
    case 'verse':
      return getVerseRelatedLinks(data, context);
    case 'topic':
      return getTopicRelatedLinks(data, context);
    case 'intent':
      return getIntentRelatedLinks(data, context);
    case 'book':
      return getBookRelatedLinks(data, context);
    case 'chapter':
      return getChapterRelatedLinks(data, context);
    default:
      return [];
  }
}

/**
 * Get related links for verse pages
 */
async function getVerseRelatedLinks(verseData: any, context?: any): Promise<LinkSection[]> {
  const baseUrl = context?.baseUrl || 'https://bibleverserandomizer.com';
  const sections: LinkSection[] = [];

  // Section 1: Breadcrumbs
  sections.push({
    title: 'Navigation',
    links: [
      { url: baseUrl, text: 'Home', type: 'breadcrumb', priority: 10 },
      { url: `${baseUrl}/book/${slugify(verseData.book)}`, text: `Book of ${verseData.book}`, type: 'breadcrumb', priority: 9 },
      { url: `${baseUrl}/book/${slugify(verseData.book)}/chapter/${verseData.chapter}`, text: `${verseData.book} Chapter ${verseData.chapter}`, type: 'parent', priority: 9 }
    ]
  });

  // Section 2: Sibling verses (same chapter)
  const siblings: InternalLink[] = [];
  
  // Previous verse
  if (verseData.verse > 1) {
    siblings.push({
      url: `${baseUrl}/verse/${verseData.book.toLowerCase()}-${verseData.chapter}-${verseData.verse - 1}`,
      text: `${verseData.book} ${verseData.chapter}:${verseData.verse - 1}`,
      type: 'sibling',
      priority: 8
    });
  }
  
  // Next verse (assuming exists - would need chapter data for exact validation)
  siblings.push({
    url: `${baseUrl}/verse/${verseData.book.toLowerCase()}-${verseData.chapter}-${verseData.verse + 1}`,
    text: `${verseData.book} ${verseData.chapter}:${verseData.verse + 1}`,
    type: 'sibling',
    priority: 8
  });
  
  if (siblings.length > 0) {
    sections.push({
      title: 'Nearby Verses',
      links: siblings
    });
  }

  // Section 3: Cross-references (if available)
  if (verseData.cross_references && verseData.cross_references.length > 0) {
    sections.push({
      title: 'Related Verses',
      links: verseData.cross_references.slice(0, 7).map((ref: string) => ({
        url: `${baseUrl}/verse/${slugify(ref)}`,
        text: ref,
        type: 'cross-reference',
        priority: 9
      }))
    });
  }

  // Section 4: Topic links (if available)
  if (verseData.topics && verseData.topics.length > 0) {
    sections.push({
      title: 'Topics in This Verse',
      links: verseData.topics.slice(0, 5).map((topic: any) => ({
        url: `${baseUrl}/topic/${typeof topic === 'string' ? slugify(topic) : topic.slug}`,
        text: typeof topic === 'string' ? topic : topic.name,
        type: 'topic',
        priority: 7
      }))
    });
  }

  // Section 5: Popular verses in same book
  if (context?.db && verseData.book) {
    try {
      const popularInBook = await context.db.query(`
        SELECT book, chapter, verse, slug
        FROM verses
        WHERE book = $1 AND slug != $2
        ORDER BY popularity_score DESC
        LIMIT 5
      `, [verseData.book, verseData.slug]);
      
      if (popularInBook.rows.length > 0) {
        sections.push({
          title: `Popular in ${verseData.book}`,
          links: popularInBook.rows.map((v: any) => ({
            url: `${baseUrl}/verse/${v.slug}`,
            text: `${v.book} ${v.chapter}:${v.verse}`,
            type: 'popular',
            priority: 6
          }))
        });
      }
    } catch (error) {
      console.error('Error fetching popular verses:', error);
    }
  }

  return sections;
}

/**
 * Get related links for topic pages
 */
async function getTopicRelatedLinks(topicData: any, context?: any): Promise<LinkSection[]> {
  const baseUrl = context?.baseUrl || 'https://bibleverserandomizer.com';
  const sections: LinkSection[] = [];

  // Breadcrumbs
  sections.push({
    title: 'Navigation',
    links: [
      { url: baseUrl, text: 'Home', type: 'breadcrumb', priority: 10 },
      { url: `${baseUrl}/topics`, text: 'All Topics', type: 'parent', priority: 9 }
    ]
  });

  // Parent topic (if this is a sub-topic)
  if (topicData.parent_topic_id && topicData.parent_topic) {
    sections.push({
      title: 'Parent Topic',
      links: [{
        url: `${baseUrl}/topic/${topicData.parent_topic.slug}`,
        text: topicData.parent_topic.name,
        type: 'parent',
        priority: 9
      }]
    });
  }

  // Sub-topics (if this is a main topic)
  if (topicData.sub_topics && topicData.sub_topics.length > 0) {
    sections.push({
      title: 'Explore More Specific Topics',
      links: topicData.sub_topics.slice(0, 7).map((sub: any) => ({
        url: `${baseUrl}/topic/${sub.slug}`,
        text: sub.name,
        type: 'sibling',
        priority: 8
      }))
    });
  }

  // Related topics (same level)
  if (topicData.related_topics && topicData.related_topics.length > 0) {
    sections.push({
      title: 'Related Topics',
      links: topicData.related_topics.slice(0, 6).map((topic: any) => ({
        url: `${baseUrl}/topic/${topic.slug}`,
        text: topic.name,
        type: 'related',
        priority: 7
      }))
    });
  }

  // Top verses for this topic
  if (topicData.top_verses && topicData.top_verses.length > 0) {
    sections.push({
      title: `Top ${topicData.name} Verses`,
      links: topicData.top_verses.slice(0, 5).map((verse: any) => ({
        url: `${baseUrl}/verse/${verse.slug}`,
        text: `${verse.book} ${verse.chapter}:${verse.verse}`,
        type: 'related',
        priority: 8
      }))
    });
  }

  return sections;
}

/**
 * Get related links for intent pages
 */
async function getIntentRelatedLinks(intentData: any, context?: any): Promise<LinkSection[]> {
  const baseUrl = context?.baseUrl || 'https://bibleverserandomizer.com';
  const sections: LinkSection[] = [];

  // Breadcrumbs
  sections.push({
    title: 'Navigation',
    links: [
      { url: baseUrl, text: 'Home', type: 'breadcrumb', priority: 10 },
      { url: `${baseUrl}/for`, text: 'Browse by Occasion', type: 'parent', priority: 9 }
    ]
  });

  // Related intents (same category)
  if (intentData.related_intents && intentData.related_intents.length > 0) {
    sections.push({
      title: 'Similar Occasions',
      links: intentData.related_intents.slice(0, 5).map((intent: any) => ({
        url: `${baseUrl}/for/${intent.slug}`,
        text: intent.name,
        type: 'related',
        priority: 7
      }))
    });
  }

  // Top verses for this intent
  if (intentData.verses && intentData.verses.length > 0) {
    sections.push({
      title: `Featured Verses for ${intentData.name}`,
      links: intentData.verses.slice(0, 8).map((verse: any) => ({
        url: `${baseUrl}/verse/${verse.slug}`,
        text: `${verse.book} ${verse.chapter}:${verse.verse}`,
        type: 'related',
        priority: 8
      }))
    });
  }

  // Related topics
  if (intentData.topics && intentData.topics.length > 0) {
    sections.push({
      title: 'Related Topics',
      links: intentData.topics.slice(0, 5).map((topic: any) => ({
        url: `${baseUrl}/topic/${topic.slug}`,
        text: topic.name,
        type: 'topic',
        priority: 7
      }))
    });
  }

  return sections;
}

/**
 * Get related links for book pages
 */
async function getBookRelatedLinks(bookData: any, context?: any): Promise<LinkSection[]> {
  const baseUrl = context?.baseUrl || 'https://bibleverserandomizer.com';
  const sections: LinkSection[] = [];

  // Breadcrumbs
  sections.push({
    title: 'Navigation',
    links: [
      { url: baseUrl, text: 'Home', type: 'breadcrumb', priority: 10 },
      { url: `${baseUrl}/books`, text: 'All Books', type: 'parent', priority: 9 },
      { url: `${baseUrl}/books/${bookData.testament.toLowerCase().replace(' ', '-')}`, text: bookData.testament, type: 'parent', priority: 9 }
    ]
  });

  // All chapters in this book
  const chapters: InternalLink[] = [];
  for (let i = 1; i <= Math.min(bookData.chapter_count, 10); i++) {
    chapters.push({
      url: `${baseUrl}/book/${bookData.slug}/chapter/${i}`,
      text: `Chapter ${i}`,
      type: 'sibling',
      priority: 8
    });
  }
  
  if (chapters.length > 0) {
    sections.push({
      title: `Chapters in ${bookData.name}`,
      links: chapters
    });
  }

  // Key verses in this book
  if (bookData.key_verses && bookData.key_verses.length > 0) {
    sections.push({
      title: `Key Verses in ${bookData.name}`,
      links: bookData.key_verses.slice(0, 7).map((verse: any) => ({
        url: `${baseUrl}/verse/${verse.slug}`,
        text: `${verse.book} ${verse.chapter}:${verse.verse}`,
        type: 'related',
        priority: 9
      }))
    });
  }

  // Previous/Next books
  const navLinks: InternalLink[] = [];
  if (bookData.previous_book) {
    navLinks.push({
      url: `${baseUrl}/book/${bookData.previous_book.slug}`,
      text: `← ${bookData.previous_book.name}`,
      type: 'sibling',
      priority: 7
    });
  }
  if (bookData.next_book) {
    navLinks.push({
      url: `${baseUrl}/book/${bookData.next_book.slug}`,
      text: `${bookData.next_book.name} →`,
      type: 'sibling',
      priority: 7
    });
  }
  
  if (navLinks.length > 0) {
    sections.push({
      title: 'Browse Books',
      links: navLinks
    });
  }

  return sections;
}

/**
 * Get related links for chapter pages
 */
async function getChapterRelatedLinks(chapterData: any, context?: any): Promise<LinkSection[]> {
  const baseUrl = context?.baseUrl || 'https://bibleverserandomizer.com';
  const sections: LinkSection[] = [];

  // Breadcrumbs
  sections.push({
    title: 'Navigation',
    links: [
      { url: baseUrl, text: 'Home', type: 'breadcrumb', priority: 10 },
      { url: `${baseUrl}/book/${chapterData.book_slug}`, text: `Book of ${chapterData.book}`, type: 'parent', priority: 9 }
    ]
  });

  // Previous/Next chapters
  const navLinks: InternalLink[] = [];
  if (chapterData.chapter > 1) {
    navLinks.push({
      url: `${baseUrl}/book/${chapterData.book_slug}/chapter/${chapterData.chapter - 1}`,
      text: `← Chapter ${chapterData.chapter - 1}`,
      type: 'sibling',
      priority: 8
    });
  }
  if (chapterData.chapter < chapterData.total_chapters) {
    navLinks.push({
      url: `${baseUrl}/book/${chapterData.book_slug}/chapter/${chapterData.chapter + 1}`,
      text: `Chapter ${chapterData.chapter + 1} →`,
      type: 'sibling',
      priority: 8
    });
  }
  
  if (navLinks.length > 0) {
    sections.push({
      title: 'Browse Chapters',
      links: navLinks
    });
  }

  return sections;
}

/**
 * Flatten all link sections into a single array
 * Useful for rendering in a sidebar
 */
export function flattenLinks(sections: LinkSection[], maxLinks: number = 15): InternalLink[] {
  const allLinks = sections.flatMap(section => section.links);
  
  // Sort by priority and limit
  return allLinks
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, maxLinks);
}

/**
 * Build anchor text suggestions for internal links
 * Based on page type and context
 */
export function generateAnchorText(
  targetPageType: PageType,
  targetData: any,
  contextWords?: string[]
): string {
  switch (targetPageType) {
    case 'verse':
      return `${targetData.book} ${targetData.chapter}:${targetData.verse}`;
    case 'topic':
      return `Bible verses about ${targetData.name.toLowerCase()}`;
    case 'intent':
      return `Bible verses for ${targetData.name.toLowerCase()}`;
    case 'book':
      return `Book of ${targetData.name}`;
    default:
      return targetData.name || targetData.title || 'Read more';
  }
}

/**
 * Utility: Convert text to URL slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get popular pages for "You might also like" section
 */
export async function getPopularPages(
  category: 'verse' | 'topic' | 'all',
  limit: number = 5,
  db?: any
): Promise<InternalLink[]> {
  if (!db) return [];

  try {
    let query = '';
    let params: any[] = [];

    switch (category) {
      case 'verse':
        query = `
          SELECT slug, book, chapter, verse
          FROM verses
          ORDER BY popularity_score DESC
          LIMIT $1
        `;
        params = [limit];
        break;

      case 'topic':
        query = `
          SELECT slug, name
          FROM topics
          WHERE level = 1
          ORDER BY search_volume DESC
          LIMIT $1
        `;
        params = [limit];
        break;

      default:
        return [];
    }

    const result = await db.query(query, params);
    const baseUrl = 'https://bibleverserandomizer.com';

    return result.rows.map((row: any) => ({
      url: category === 'verse' 
        ? `${baseUrl}/verse/${row.slug}`
        : `${baseUrl}/topic/${row.slug}`,
      text: category === 'verse'
        ? `${row.book} ${row.chapter}:${row.verse}`
        : row.name,
      type: 'popular' as const,
      priority: 5
    }));
  } catch (error) {
    console.error('Error fetching popular pages:', error);
    return [];
  }
}

/**
 * Count total internal links on a page
 * Useful for SEO audits
 */
export function countInternalLinks(sections: LinkSection[]): number {
  return sections.reduce((total, section) => total + section.links.length, 0);
}

/**
 * Validate internal linking meets SEO best practices
 */
export function validateInternalLinking(sections: LinkSection[]): {
  valid: boolean;
  linkCount: number;
  warnings: string[];
} {
  const linkCount = countInternalLinks(sections);
  const warnings: string[] = [];

  if (linkCount < 10) {
    warnings.push(`Only ${linkCount} internal links (recommend 10-15 minimum)`);
  }

  if (linkCount > 50) {
    warnings.push(`Too many links (${linkCount}). Consider limiting to avoid dilution.`);
  }

  const uniqueUrls = new Set(sections.flatMap(s => s.links.map(l => l.url)));
  if (uniqueUrls.size < linkCount) {
    warnings.push('Duplicate links detected');
  }

  return {
    valid: linkCount >= 10 && linkCount <= 50 && uniqueUrls.size === linkCount,
    linkCount,
    warnings
  };
}
