/**
 * Metadata Factory
 * 
 * Generates SEO metadata (title, description, OG tags, Twitter cards)
 * for all page types in the Bible Verse Programmatic SEO system.
 * 
 * Usage:
 *   const metadata = generateMetadata('verse', verseData);
 *   export const metadata = metadata; // in Next.js page.tsx
 */

import { Metadata } from 'next';

export type PageType = 'verse' | 'topic' | 'sub-topic' | 'intent' | 'book' | 'chapter' | 'home' | 'tool';

export interface VerseMetadataInput {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  slug: string;
  topics?: string[];
}

export interface TopicMetadataInput {
  name: string;
  slug: string;
  verseCount: number;
  description?: string;
}

export interface IntentMetadataInput {
  name: string;
  slug: string;
  category: string;
  verseCount: number;
}

export interface BookMetadataInput {
  name: string;
  slug: string;
  testament: string;
  chapterCount: number;
  verseCount: number;
}

export type MetadataInput = VerseMetadataInput | TopicMetadataInput | IntentMetadataInput | BookMetadataInput;

/**
 * Main metadata generation function
 */
export function generateMetadata(
  pageType: PageType,
  data: MetadataInput,
  baseUrl: string = 'https://bibleverserandomizer.com'
): Metadata {
  switch (pageType) {
    case 'verse':
      return generateVerseMetadata(data as VerseMetadataInput, baseUrl);
    case 'topic':
      return generateTopicMetadata(data as TopicMetadataInput, baseUrl);
    case 'sub-topic':
      return generateSubTopicMetadata(data as TopicMetadataInput, baseUrl);
    case 'intent':
      return generateIntentMetadata(data as IntentMetadataInput, baseUrl);
    case 'book':
      return generateBookMetadata(data as BookMetadataInput, baseUrl);
    case 'chapter':
      return generateChapterMetadata(data as any, baseUrl);
    case 'tool':
      return generateToolMetadata(data as any, baseUrl);
    case 'home':
      return generateHomeMetadata(baseUrl);
    default:
      return generateDefaultMetadata(baseUrl);
  }
}

/**
 * Verse Page Metadata
 * Pattern: "John 3:16 Meaning & Explanation | For God So Loved the World"
 */
function generateVerseMetadata(data: VerseMetadataInput, baseUrl: string): Metadata {
  const reference = `${data.book} ${data.chapter}:${data.verse}`;
  const snippet = truncateText(data.text, 60);
  
  const title = `${reference} Meaning & Explanation | ${snippet}`;
  const description = `Discover the meaning of ${reference}. Read this Bible verse in multiple translations, explore context, and learn how to apply it today. ${truncateText(data.text, 100)}`;
  
  const canonical = `${baseUrl}/verse/${data.slug}`;
  
  // Keywords based on verse reference and topics
  const keywords = [
    reference,
    `${reference} meaning`,
    `${reference} explanation`,
    `${data.book} ${data.chapter}`,
    'Bible verse',
    ...(data.topics || [])
  ];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Bible Verse Randomizer',
      type: 'article',
      images: [
        {
          url: `${baseUrl}/api/og-image?type=verse&ref=${encodeURIComponent(reference)}`,
          width: 1200,
          height: 630,
          alt: `${reference} Bible Verse`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncateText(description, 200),
      images: [`${baseUrl}/api/og-image?type=verse&ref=${encodeURIComponent(reference)}`]
    },
    other: {
      'article:published_time': new Date().toISOString(),
      'article:modified_time': new Date().toISOString(),
      'article:section': 'Bible Verses',
      'article:tag': keywords.slice(0, 5).join(',')
    }
  };
}

/**
 * Topic Page Metadata
 * Pattern: "100+ Bible Verses About Love - Scripture on Love & Relationships"
 */
function generateTopicMetadata(data: TopicMetadataInput, baseUrl: string): Metadata {
  const title = `${data.verseCount}+ Bible Verses About ${data.name} - Scripture on ${data.name}`;
  const description = data.description 
    ? truncateText(data.description, 155)
    : `Discover ${data.verseCount}+ powerful Bible verses about ${data.name.toLowerCase()}. Read Scripture passages with context, meaning, and practical application for your life today.`;
  
  const canonical = `${baseUrl}/topic/${data.slug}`;
  
  const keywords = [
    `Bible verses about ${data.name.toLowerCase()}`,
    `${data.name} Bible verses`,
    `Scripture about ${data.name.toLowerCase()}`,
    `${data.name} in the Bible`,
    'Bible passages',
    data.name
  ];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Bible Verse Randomizer',
      type: 'article',
      images: [
        {
          url: `${baseUrl}/api/og-image?type=topic&name=${encodeURIComponent(data.name)}`,
          width: 1200,
          height: 630,
          alt: `Bible Verses About ${data.name}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncateText(description, 200),
      images: [`${baseUrl}/api/og-image?type=topic&name=${encodeURIComponent(data.name)}`]
    }
  };
}

/**
 * Sub-Topic Page Metadata
 * Pattern: "Bible Verses About Romantic Love - Love in Relationships"
 */
function generateSubTopicMetadata(data: TopicMetadataInput, baseUrl: string): Metadata {
  // Similar to topic but with slight variations
  return generateTopicMetadata(data, baseUrl);
}

/**
 * Intent Page Metadata
 * Pattern: "Bible Verses for Weddings - Perfect Scripture for Your Wedding Day"
 */
function generateIntentMetadata(data: IntentMetadataInput, baseUrl: string): Metadata {
  const title = `Bible Verses for ${data.name} - Perfect Scripture for ${data.name}`;
  const description = `Find the perfect Bible verses for ${data.name.toLowerCase()}. Discover ${data.verseCount}+ meaningful Scripture passages with context and suggestions for how to use them.`;
  
  const canonical = `${baseUrl}/for/${data.slug}`;
  
  const keywords = [
    `Bible verses for ${data.name.toLowerCase()}`,
    `${data.name} Bible verses`,
    `Scripture for ${data.name.toLowerCase()}`,
    `Bible passages for ${data.name.toLowerCase()}`,
    data.category,
    data.name
  ];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Bible Verse Randomizer',
      type: 'article',
      images: [
        {
          url: `${baseUrl}/api/og-image?type=intent&name=${encodeURIComponent(data.name)}`,
          width: 1200,
          height: 630,
          alt: `Bible Verses for ${data.name}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncateText(description, 200),
      images: [`${baseUrl}/api/og-image?type=intent&name=${encodeURIComponent(data.name)}`]
    }
  };
}

/**
 * Book Page Metadata
 * Pattern: "The Gospel of John - Overview, Summary & Key Verses"
 */
function generateBookMetadata(data: BookMetadataInput, baseUrl: string): Metadata {
  const bookPrefix = data.testament === 'New Testament' && ['Matthew', 'Mark', 'Luke', 'John'].includes(data.name)
    ? 'The Gospel of'
    : 'The Book of';
  
  const title = `${bookPrefix} ${data.name} - Overview, Summary & Key Verses`;
  const description = `Explore ${bookPrefix} ${data.name} with ${data.chapterCount} chapters and ${data.verseCount} verses. Read chapter summaries, key themes, and the most important verses from ${data.name}.`;
  
  const canonical = `${baseUrl}/book/${data.slug}`;
  
  const keywords = [
    `Book of ${data.name}`,
    `${data.name} Bible`,
    `${data.name} summary`,
    `${data.name} overview`,
    data.testament,
    'Bible book'
  ];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Bible Verse Randomizer',
      type: 'article',
      images: [
        {
          url: `${baseUrl}/api/og-image?type=book&name=${encodeURIComponent(data.name)}`,
          width: 1200,
          height: 630,
          alt: `The Book of ${data.name}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncateText(description, 200)
    }
  };
}

/**
 * Chapter Page Metadata
 */
function generateChapterMetadata(data: any, baseUrl: string): Metadata {
  const title = `${data.book} Chapter ${data.chapter} - Summary & Verse List`;
  const description = `Read ${data.book} Chapter ${data.chapter} with all ${data.verseCount} verses. Explore chapter summary, key themes, and verse-by-verse breakdown.`;
  
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/book/${data.bookSlug}/chapter/${data.chapter}`
    }
  };
}

/**
 * Tool Page Metadata
 */
function generateToolMetadata(data: any, baseUrl: string): Metadata {
  return {
    title: `${data.name} - Free Bible Verse Tool`,
    description: data.description,
    alternates: {
      canonical: `${baseUrl}/tool/${data.slug}`
    }
  };
}

/**
 * Home Page Metadata
 */
function generateHomeMetadata(baseUrl: string): Metadata {
  return {
    title: 'Bible Verse Randomizer - Random Bible Verses & Scripture Generator',
    description: 'Generate random Bible verses instantly. Explore 31,000+ verses by topic, occasion, or book. Find encouragement, wisdom, and inspiration from Scripture daily.',
    keywords: 'random Bible verse, Scripture generator, Bible verses, daily Bible verse, verse randomizer',
    alternates: {
      canonical: baseUrl
    },
    openGraph: {
      title: 'Bible Verse Randomizer',
      description: 'Generate random Bible verses instantly',
      url: baseUrl,
      siteName: 'Bible Verse Randomizer',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-home.png`,
          width: 1200,
          height: 630
        }
      ]
    }
  };
}

/**
 * Default fallback metadata
 */
function generateDefaultMetadata(baseUrl: string): Metadata {
  return {
    title: 'Bible Verse Randomizer',
    description: 'Explore Bible verses, Scripture, and Christian resources',
    alternates: {
      canonical: baseUrl
    }
  };
}

/**
 * Utility: Truncate text to max length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

/**
 * Utility: Generate meta keywords from data
 */
export function generateKeywords(pageType: string, primaryKeyword: string, variations: string[] = []): string {
  const keywords = [
    primaryKeyword,
    ...variations
  ];
  
  return keywords.join(', ');
}

/**
 * Utility: Validate metadata for SEO best practices
 */
export function validateMetadata(metadata: Metadata): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Title length check (50-60 characters optimal)
  if (metadata.title && metadata.title.toString().length > 60) {
    warnings.push(`Title too long (${metadata.title.toString().length} chars, recommend <60)`);
  }
  if (metadata.title && metadata.title.toString().length < 30) {
    warnings.push(`Title too short (${metadata.title.toString().length} chars, recommend 50-60)`);
  }
  
  // Description length check (150-160 characters optimal)
  if (metadata.description && metadata.description.length > 160) {
    warnings.push(`Description too long (${metadata.description.length} chars, recommend 150-160)`);
  }
  if (metadata.description && metadata.description.length < 120) {
    warnings.push(`Description too short (${metadata.description.length} chars, recommend 150-160)`);
  }
  
  // Required fields check
  if (!metadata.title) warnings.push('Missing title');
  if (!metadata.description) warnings.push('Missing description');
  if (!metadata.alternates?.canonical) warnings.push('Missing canonical URL');
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}
