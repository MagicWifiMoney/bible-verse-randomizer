/**
 * Verse Page - JSON-powered (no DB dependency)
 * 
 * Route: /verse/[reference]
 * Example: /verse/john-3-16
 * 
 * Pre-generates 1,000 verse pages from priority-1000.json
 * with all 6 translations loaded from JSON data files.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VersePage from '@/components/templates/VersePage';
import { buildPageSchemas } from '@/lib/seo/schema-builders';
import { getAllVerseSlugs, getVerseDetailData, getPopularInBook } from '@/lib/verse-detail-data';

export const dynamicParams = true;
export const revalidate = 86400; // ISR: regenerate every 24 hours

export async function generateStaticParams() {
  // Seed top 100 verse pages at build time; rest generated on-demand via ISR
  return getAllVerseSlugs().slice(0, 100).map(slug => ({ reference: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ reference: string }> }): Promise<Metadata> {
  const { reference } = await params;
  const verse = getVerseDetailData(reference);
  if (!verse) return { title: 'Verse Not Found' };

  const title = `${verse.book} ${verse.chapter}:${verse.verse} — Meaning, Context & All Translations`;
  const desc = `Read ${verse.book} ${verse.chapter}:${verse.verse} in NIV, KJV, ESV, NLT, MSG & NASB. Explore the meaning, context, and application of this verse.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `https://bibleverserandomizer.com/verse/${reference}` },
    openGraph: {
      title,
      description: desc,
      url: `https://bibleverserandomizer.com/verse/${reference}`,
      type: 'article',
    },
  };
}

export default async function VersePageRoute({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const verse = getVerseDetailData(reference);
  if (!verse) notFound();

  const popularInBook = getPopularInBook(verse.book, verse.slug);

  const schema = buildPageSchemas({
    pageType: 'verse',
    data: verse,
    pathname: `/verse/${reference}`,
    currentPageName: `${verse.book} ${verse.chapter}:${verse.verse}`
  });

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (verse.faqs || []).map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bibleverserandomizer.com' },
      { '@type': 'ListItem', position: 2, name: 'Books', item: 'https://bibleverserandomizer.com/books' },
      { '@type': 'ListItem', position: 3, name: verse.book, item: `https://bibleverserandomizer.com/book/${reference.split('-').slice(0, -2).join('-')}` },
      { '@type': 'ListItem', position: 4, name: `${verse.book} ${verse.chapter}:${verse.verse}` },
    ],
  };

  // Article schema with author (E-E-A-T) and speakable (voice assistants)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${verse.book} ${verse.chapter}:${verse.verse} — Meaning, Context & All Translations`,
    description: `Read ${verse.book} ${verse.chapter}:${verse.verse} in 6 translations with full meaning, context, and application.`,
    url: `https://bibleverserandomizer.com/verse/${reference}`,
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      '@id': 'https://bibleverserandomizer.com/#organization',
      name: 'Bible Verse Randomizer',
      url: 'https://bibleverserandomizer.com',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://bibleverserandomizer.com/#organization',
      name: 'Bible Verse Randomizer',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bibleverserandomizer.com/verse/${reference}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.verse-display blockquote', '.verse-page header h1'],
    },
    about: {
      '@type': 'CreativeWork',
      name: 'The Bible',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <VersePage verse={verse} popularInBook={popularInBook} />
    </>
  );
}
