/**
 * Schema Builders
 * 
 * Generates JSON-LD structured data (schema.org) for all page types.
 * Supports: Article, FAQPage, BreadcrumbList, Organization, WebSite
 * 
 * Usage:
 *   const schema = buildArticleSchema(data);
 *   // In page component: <script type="application/ld+json">{JSON.stringify(schema)}</script>
 */

export type SchemaType = 'article' | 'faq' | 'breadcrumb' | 'organization' | 'website' | 'book';

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author?: string;
  image?: string;
  wordCount?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Build Article schema for verse/topic pages
 * Based on schema.org/Article
 */
export function buildArticleSchema(data: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    author: {
      '@type': 'Organization',
      name: data.author || 'Bible Verse Randomizer',
      url: 'https://bibleverserandomizer.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bible Verse Randomizer',
      url: 'https://bibleverserandomizer.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bibleverserandomizer.com/logo.png'
      }
    },
    image: data.image || 'https://bibleverserandomizer.com/og-default.png',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url
    },
    ...(data.wordCount && { wordCount: data.wordCount }),
    inLanguage: 'en-US',
    articleSection: 'Bible Verses',
    keywords: 'Bible verse, Scripture, Christian resources'
  };
}

/**
 * Build FAQ schema
 * Based on schema.org/FAQPage
 */
export function buildFAQSchema(faqs: FAQItem[], pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': pageUrl,
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Build Breadcrumb schema
 * Based on schema.org/BreadcrumbList
 */
export function buildBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Build Organization schema (for home page)
 * Based on schema.org/Organization
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bible Verse Randomizer',
    url: 'https://bibleverserandomizer.com',
    logo: 'https://bibleverserandomizer.com/logo.png',
    description: 'Random Bible verse generator and comprehensive Scripture resource',
    sameAs: [
      'https://twitter.com/bibleverserand',
      'https://facebook.com/bibleverserandomizer'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@bibleverserandomizer.com'
    }
  };
}

/**
 * Build WebSite schema with search functionality
 * Based on schema.org/WebSite
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bible Verse Randomizer',
    url: 'https://bibleverserandomizer.com',
    description: 'Generate random Bible verses and explore Scripture by topic',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://bibleverserandomizer.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Build Book schema (for Bible books)
 * Based on schema.org/Book
 */
export function buildBookSchema(bookData: {
  name: string;
  url: string;
  description: string;
  numberOfPages?: number;
  bookFormat?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: bookData.name,
    url: bookData.url,
    description: bookData.description,
    ...(bookData.numberOfPages && { numberOfPages: bookData.numberOfPages }),
    bookFormat: bookData.bookFormat || 'EBook',
    inLanguage: 'en',
    genre: 'Religious',
    author: {
      '@type': 'Organization',
      name: 'Multiple Biblical Authors'
    }
  };
}

/**
 * Combine multiple schemas into one script
 * Useful for pages with Article + FAQ + Breadcrumb
 */
export function combineSchemas(...schemas: any[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas
  };
}

/**
 * Verse-specific schema generator
 * Combines Article + FAQ + Breadcrumb
 */
export interface VerseSchemaInput {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  meaning: string;
  url: string;
  breadcrumbs: BreadcrumbItem[];
  faqs?: FAQItem[];
  datePublished: string;
  dateModified: string;
}

export function buildVersePageSchema(data: VerseSchemaInput) {
  const reference = `${data.book} ${data.chapter}:${data.verse}`;
  
  const schemas = [
    // Article schema
    buildArticleSchema({
      headline: `${reference} - Meaning & Explanation`,
      description: data.meaning.substring(0, 200),
      url: data.url,
      datePublished: data.datePublished,
      dateModified: data.dateModified,
      image: `https://bibleverserandomizer.com/api/og-image?type=verse&ref=${encodeURIComponent(reference)}`
    }),
    
    // Breadcrumb schema
    buildBreadcrumbSchema(data.breadcrumbs)
  ];
  
  // Add FAQ schema if FAQs exist
  if (data.faqs && data.faqs.length > 0) {
    schemas.push(buildFAQSchema(data.faqs, data.url));
  }
  
  return combineSchemas(...schemas);
}

/**
 * Topic-specific schema generator
 * Combines Article + Breadcrumb
 */
export interface TopicSchemaInput {
  name: string;
  description: string;
  url: string;
  breadcrumbs: BreadcrumbItem[];
  verseCount: number;
  datePublished: string;
  dateModified: string;
}

export function buildTopicPageSchema(data: TopicSchemaInput) {
  return combineSchemas(
    buildArticleSchema({
      headline: `Bible Verses About ${data.name}`,
      description: data.description,
      url: data.url,
      datePublished: data.datePublished,
      dateModified: data.dateModified
    }),
    buildBreadcrumbSchema(data.breadcrumbs)
  );
}

/**
 * Intent page schema generator
 */
export interface IntentSchemaInput {
  name: string;
  category: string;
  description: string;
  url: string;
  breadcrumbs: BreadcrumbItem[];
  faqs?: FAQItem[];
  datePublished: string;
  dateModified: string;
}

export function buildIntentPageSchema(data: IntentSchemaInput) {
  const schemas = [
    buildArticleSchema({
      headline: `Bible Verses for ${data.name}`,
      description: data.description,
      url: data.url,
      datePublished: data.datePublished,
      dateModified: data.dateModified
    }),
    buildBreadcrumbSchema(data.breadcrumbs)
  ];
  
  if (data.faqs && data.faqs.length > 0) {
    schemas.push(buildFAQSchema(data.faqs, data.url));
  }
  
  return combineSchemas(...schemas);
}

/**
 * Generate breadcrumbs automatically from page path
 * 
 * Example:
 *   /verse/john-3-16 → Home > Verses > John > John 3:16
 *   /topic/love → Home > Topics > Love
 */
export function generateBreadcrumbs(
  pathname: string,
  currentPageName: string,
  baseUrl: string = 'https://bibleverserandomizer.com'
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: baseUrl }
  ];
  
  const segments = pathname.split('/').filter(s => s);
  
  if (segments.length === 0) return breadcrumbs;
  
  // First segment determines category
  const category = segments[0];
  
  switch (category) {
    case 'verse':
      breadcrumbs.push({ name: 'Verses', url: `${baseUrl}/verses` });
      if (segments[1]) {
        const book = segments[1].split('-')[0];
        const bookName = capitalizeWords(book);
        breadcrumbs.push({ 
          name: bookName, 
          url: `${baseUrl}/book/${book}` 
        });
      }
      break;
      
    case 'topic':
      breadcrumbs.push({ name: 'Topics', url: `${baseUrl}/topics` });
      break;
      
    case 'for':
      breadcrumbs.push({ name: 'Browse by Occasion', url: `${baseUrl}/for` });
      break;
      
    case 'book':
      breadcrumbs.push({ name: 'Bible Books', url: `${baseUrl}/books` });
      break;
      
    case 'tool':
      breadcrumbs.push({ name: 'Tools', url: `${baseUrl}/tools` });
      break;
  }
  
  // Add current page
  breadcrumbs.push({ 
    name: currentPageName, 
    url: `${baseUrl}${pathname}` 
  });
  
  return breadcrumbs;
}

/**
 * Helper: Capitalize words
 */
function capitalizeWords(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate schema output for common issues
 */
export function validateSchema(schema: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!schema['@context']) {
    errors.push('Missing @context');
  }
  
  if (!schema['@type'] && !schema['@graph']) {
    errors.push('Missing @type or @graph');
  }
  
  // Type-specific validations
  if (schema['@type'] === 'Article') {
    if (!schema.headline) errors.push('Article missing headline');
    if (!schema.datePublished) errors.push('Article missing datePublished');
  }
  
  if (schema['@type'] === 'FAQPage') {
    if (!schema.mainEntity || schema.mainEntity.length === 0) {
      errors.push('FAQPage has no questions');
    }
  }
  
  if (schema['@type'] === 'BreadcrumbList') {
    if (!schema.itemListElement || schema.itemListElement.length === 0) {
      errors.push('BreadcrumbList has no items');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Build all schemas for a page
 * High-level helper that generates everything needed
 */
export function buildPageSchemas(config: {
  pageType: 'verse' | 'topic' | 'intent' | 'book' | 'home';
  data: any;
  pathname: string;
  currentPageName: string;
  baseUrl?: string;
}) {
  const baseUrl = config.baseUrl || 'https://bibleverserandomizer.com';
  const url = `${baseUrl}${config.pathname}`;
  const breadcrumbs = generateBreadcrumbs(config.pathname, config.currentPageName, baseUrl);
  
  const now = new Date().toISOString();
  const datePublished = config.data.created_at || now;
  const dateModified = config.data.updated_at || now;
  
  switch (config.pageType) {
    case 'verse':
      return buildVersePageSchema({
        reference: `${config.data.book} ${config.data.chapter}:${config.data.verse}`,
        book: config.data.book,
        chapter: config.data.chapter,
        verse: config.data.verse,
        text: config.data.text_niv || config.data.text_kjv || '',
        meaning: config.data.meaning || '',
        url,
        breadcrumbs,
        faqs: config.data.faqs,
        datePublished,
        dateModified
      });
      
    case 'topic':
      return buildTopicPageSchema({
        name: config.data.name,
        description: config.data.description || '',
        url,
        breadcrumbs,
        verseCount: config.data.verseCount || 0,
        datePublished,
        dateModified
      });
      
    case 'intent':
      return buildIntentPageSchema({
        name: config.data.name,
        category: config.data.category,
        description: config.data.description || '',
        url,
        breadcrumbs,
        faqs: config.data.faqs,
        datePublished,
        dateModified
      });
      
    case 'home':
      return combineSchemas(
        buildOrganizationSchema(),
        buildWebSiteSchema()
      );
      
    default:
      return buildArticleSchema({
        headline: config.currentPageName,
        description: '',
        url,
        datePublished,
        dateModified
      });
  }
}
