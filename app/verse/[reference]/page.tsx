/**
 * Verse Page - Dynamic Route
 * 
 * Route: /verse/[reference]
 * Example: /verse/john-3-16
 * 
 * Uses ISR (Incremental Static Regeneration)
 * - Revalidate every 24 hours
 * - Pre-build top 1,000 verses
 * - Generate others on-demand
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VersePage, { VersePageData } from '@/components/templates/VersePage';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata-factory';
import { buildPageSchemas } from '@/lib/seo/schema-builders';
import { getRelatedLinks } from '@/lib/seo/internal-links';

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

// Import database verse data loader
import { getVerseData, getAllVerses, getPopularInBook } from '@/lib/verse-data-db';

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ reference: string }> }): Promise<Metadata> {
  const { reference } = await params;
  const verse = await getVerseData(reference);
  
  if (!verse) {
    return {
      title: 'Verse Not Found',
      description: 'The requested Bible verse could not be found.'
    };
  }

  return generateSEOMetadata('verse', {
    book: verse.book,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text_niv || verse.text_kjv || '',
    slug: verse.slug,
    topics: verse.topics?.map(t => t.name)
  });
}

/**
 * Pre-generate static params for top verses
 * (All 10 verses will be pre-built at build time)
 */
export async function generateStaticParams() {
  const allVerses = await getAllVerses();
  
  return allVerses.map((slug: string) => ({
    reference: slug
  }));
}

/**
 * Main page component
 */
export default async function VersePageRoute({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const verse = await getVerseData(reference);

  if (!verse) {
    notFound();
  }

  // Get related links
  const relatedLinks = await getRelatedLinks('verse', verse, {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://bibleverserandomizer.com'
  });

  // Get popular verses in same book
  const popularInBook = await getPopularInBook(verse.book, verse.slug);

  // Generate JSON-LD schema
  const schema = buildPageSchemas({
    pageType: 'verse',
    data: verse,
    pathname: `/verse/${reference}`,
    currentPageName: `${verse.book} ${verse.chapter}:${verse.verse}`
  });

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Render verse page template */}
      <VersePage
        verse={verse}
        relatedLinks={relatedLinks}
        popularInBook={popularInBook}
      />
    </>
  );
}

// Data functions now imported from lib/verse-data.ts
