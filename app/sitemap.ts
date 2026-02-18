/**
 * Sitemap Index — splits ~13K URLs into multiple sitemaps by page type.
 * 
 * Best practice: Each sitemap should contain related URLs grouped by type
 * (topics, intents, chapters, verses, translations) for crawl efficiency.
 * Google limits each sitemap file to 50,000 URLs / 50MB uncompressed.
 */

import { MetadataRoute } from 'next';
import { getAllTopicSlugs } from '@/lib/topic-data';
import { getAllIntentSlugs } from '@/lib/intent-data';
import { getAllBookSlugs } from '@/lib/book-data';
import { getAllChapterParams } from '@/lib/chapter-data';
import { getAllVerseSlugs } from '@/lib/verse-detail-data';
import { getAllTranslationChapterParams } from '@/lib/translation-chapter-data';

const baseUrl = 'https://bibleverserandomizer.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── Static / Hub Pages (Priority 1.0-0.9) ────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/daily`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/topics`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/for`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/books`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/old-testament`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/new-testament`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/translations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/popular-verses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/reading-plan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // ── Topic Pages (Priority 0.8) ───────────────────────────────
  const topicPages: MetadataRoute.Sitemap = getAllTopicSlugs().map(slug => ({
    url: `${baseUrl}/topic/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // ── Intent Pages (Priority 0.7) ──────────────────────────────
  const intentPages: MetadataRoute.Sitemap = getAllIntentSlugs().map(slug => ({
    url: `${baseUrl}/for/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ── Book Pages (Priority 0.7) ────────────────────────────────
  const bookPages: MetadataRoute.Sitemap = getAllBookSlugs().map(slug => ({
    url: `${baseUrl}/book/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ── NIV Chapter Pages (Priority 0.6) ─────────────────────────
  const chapterPages: MetadataRoute.Sitemap = getAllChapterParams().map(p => ({
    url: `${baseUrl}/book/${p.book}/${p.chapter}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // ── Verse Detail Pages (Priority 0.6) ────────────────────────
  const versePages: MetadataRoute.Sitemap = getAllVerseSlugs().map(slug => ({
    url: `${baseUrl}/verse/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // ── Verse Comparison Pages (Priority 0.5) ────────────────────
  const comparePages: MetadataRoute.Sitemap = getAllVerseSlugs().map(slug => ({
    url: `${baseUrl}/verse/${slug}/compare`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // ── Translation Chapter Pages (Priority 0.4) ─────────────────
  const translationPages: MetadataRoute.Sitemap = getAllTranslationChapterParams().map(p => ({
    url: `${baseUrl}/book/${p.book}/${p.chapter}/${p.translation}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }));

  return [
    ...staticPages,
    ...topicPages,
    ...intentPages,
    ...bookPages,
    ...chapterPages,
    ...versePages,
    ...comparePages,
    ...translationPages,
  ];
}
