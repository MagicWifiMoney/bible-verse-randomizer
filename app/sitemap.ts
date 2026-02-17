import { MetadataRoute } from 'next';
import { getAllTopicSlugs } from '@/lib/topic-data';
import { getAllIntentSlugs } from '@/lib/intent-data';
import { getAllBookSlugs } from '@/lib/book-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bibleverserandomizer.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/daily`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/for`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Topic pages
  const topicPages: MetadataRoute.Sitemap = getAllTopicSlugs().map(slug => ({
    url: `${baseUrl}/topic/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Intent pages
  const intentPages: MetadataRoute.Sitemap = getAllIntentSlugs().map(slug => ({
    url: `${baseUrl}/for/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Book pages
  const bookPages: MetadataRoute.Sitemap = getAllBookSlugs().map(slug => ({
    url: `${baseUrl}/book/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...topicPages, ...intentPages, ...bookPages];
}
