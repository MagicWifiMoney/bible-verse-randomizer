import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import IntentPage from '@/components/templates/IntentPage';
import { Breadcrumbs } from '@/components/seo/RelatedLinks';
import { generateMetadata as generateSEOMetadata, buildPageSchemas, generateBreadcrumbs, buildFAQSchema } from '@/lib/seo';
import { getIntentData, getAllIntentSlugs, getRelatedIntentSlugs } from '@/lib/intent-data';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ intent: string }> }): Promise<Metadata> {
  const { intent: slug } = await params;
  const intent = getIntentData(slug);
  if (!intent) return { title: 'Not Found' };

  return generateSEOMetadata('intent', {
    name: intent.name,
    slug: intent.slug,
    category: intent.category,
    verseCount: intent.verses.length
  });
}

export async function generateStaticParams() {
  return getAllIntentSlugs().map(slug => ({ intent: slug }));
}

export default async function IntentPageRoute({ params }: { params: Promise<{ intent: string }> }) {
  const { intent: slug } = await params;
  const intent = getIntentData(slug);
  if (!intent) notFound();

  // Build breadcrumbs
  const breadcrumbs = generateBreadcrumbs(`/for/${slug}`, intent.name);

  // Build related intents for internal linking
  const relatedSlugs = getRelatedIntentSlugs(slug, 6);
  const relatedIntents = relatedSlugs
    .map(s => getIntentData(s))
    .filter(Boolean);

  // Build JSON-LD schema
  const schema = buildPageSchemas({
    pageType: 'intent',
    data: { name: intent.name, category: intent.category, description: `Bible verses for ${intent.name.toLowerCase()}` },
    pathname: `/for/${slug}`,
    currentPageName: intent.name,
  });

  // FAQ schema for AEO/LLM discoverability
  const faqs = [
    {
      question: `What are the best Bible verses for ${intent.name.toLowerCase()}?`,
      answer: intent.verses.length > 0
        ? `Popular Bible verses for ${intent.name.toLowerCase()} include ${intent.verses.slice(0, 3).map(v => `${v.book} ${v.chapter}:${v.verse}`).join(', ')}. Browse this page for ${intent.verses.length}+ curated Scripture passages.`
        : `Browse this page to find curated Bible verses for ${intent.name.toLowerCase()}.`
    },
    {
      question: `How do I choose a Bible verse for ${intent.name.toLowerCase()}?`,
      answer: `When choosing a Bible verse for ${intent.name.toLowerCase()}, consider the context and message you want to convey. We've organized ${intent.verses.length}+ relevant verses on this page to help you find the perfect passage.`
    }
  ];
  const faqSchema = buildFAQSchema(faqs, `https://bibleverserandomizer.com/for/${slug}`);

  // Article schema with author (E-E-A-T)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Bible Verses for ${intent.name}`,
    description: `Find the best Bible verses for ${intent.name.toLowerCase()}. ${intent.verses.length}+ curated Scripture passages with meaning and context.`,
    url: `https://bibleverserandomizer.com/for/${slug}`,
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
      '@id': `https://bibleverserandomizer.com/for/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs links={breadcrumbs.map(b => ({ url: b.url, text: b.name, type: 'breadcrumb' as const }))} />

          <IntentPage intent={intent} />

          {/* FAQ Section for AEO */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-white border border-slate-200 rounded-lg p-4 group">
                  <summary className="font-semibold text-slate-800 cursor-pointer group-open:text-amber-700">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-slate-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Intents + Topics — Internal Links */}
          {relatedIntents.length > 0 && (
            <section className="mt-12 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Similar Occasions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {relatedIntents.map(ri => ri && (
                  <a
                    key={ri.slug}
                    href={`/for/${ri.slug}`}
                    className="p-3 rounded-lg bg-white border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all text-amber-700 hover:text-amber-900 font-medium"
                  >
                    {ri.name}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Browse More — Hub Cross Links */}
          <nav className="mt-10 border-t border-slate-200 pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/for" className="text-amber-600 hover:text-amber-800">← All Occasions</a>
              <a href="/topics" className="text-amber-600 hover:text-amber-800">Browse by Topic</a>
              <a href="/books" className="text-amber-600 hover:text-amber-800">Books of the Bible</a>
              <a href="/" className="text-amber-600 hover:text-amber-800">Random Verse</a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
