import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicPage from '@/components/templates/TopicPage';
import { Breadcrumbs, RelatedLinks } from '@/components/seo/RelatedLinks';
import { generateMetadata as generateSEOMetadata, buildPageSchemas, generateBreadcrumbs, buildFAQSchema } from '@/lib/seo';
import { getTopicData, getAllTopicSlugs, getRelatedTopicSlugs } from '@/lib/topic-data';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicData(slug);
  if (!topic) return { title: 'Topic Not Found' };

  return generateSEOMetadata('topic', {
    name: topic.name,
    slug: topic.slug,
    verseCount: topic.verses.length,
    description: topic.description
  });
}

export async function generateStaticParams() {
  return getAllTopicSlugs().map(slug => ({ slug }));
}

export default async function TopicPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopicData(slug);
  if (!topic) notFound();

  // Build breadcrumbs
  const breadcrumbs = generateBreadcrumbs(`/topic/${slug}`, topic.name);

  // Build related topics for internal linking
  const relatedSlugs = getRelatedTopicSlugs(slug, 6);
  const relatedTopics = relatedSlugs
    .map(s => getTopicData(s))
    .filter(Boolean);

  // Build JSON-LD schema
  const schema = buildPageSchemas({
    pageType: 'topic',
    data: { name: topic.name, description: topic.description, verseCount: topic.verses.length },
    pathname: `/topic/${slug}`,
    currentPageName: topic.name,
  });

  // Generate FAQ schema for AEO/LLM discoverability
  const faqs = [
    {
      question: `What does the Bible say about ${topic.name.toLowerCase()}?`,
      answer: topic.description || `The Bible contains many passages about ${topic.name.toLowerCase()}. Key verses include ${topic.verses.slice(0, 3).map(v => `${v.book} ${v.chapter}:${v.verse}`).join(', ')}.`
    },
    {
      question: `How many Bible verses are about ${topic.name.toLowerCase()}?`,
      answer: `There are ${topic.verses.length}+ Bible verses related to ${topic.name.toLowerCase()} on this page, drawn from both the Old and New Testaments.`
    },
    {
      question: `What is the best Bible verse about ${topic.name.toLowerCase()}?`,
      answer: topic.verses[0] ? `One of the most popular Bible verses about ${topic.name.toLowerCase()} is ${topic.verses[0].book} ${topic.verses[0].chapter}:${topic.verses[0].verse}: "${topic.verses[0].text.substring(0, 150)}..."` : `Browse this page to find popular verses about ${topic.name.toLowerCase()}.`
    }
  ];
  const faqSchema = buildFAQSchema(faqs, `https://bibleverserandomizer.com/topic/${slug}`);

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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs links={breadcrumbs.map(b => ({ url: b.url, text: b.name, type: 'breadcrumb' as const }))} />

          <TopicPage topic={topic} />

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

          {/* Related Topics — Internal Links */}
          {relatedTopics.length > 0 && (
            <section className="mt-12 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Related Topics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {relatedTopics.map(rt => rt && (
                  <a
                    key={rt.slug}
                    href={`/topic/${rt.slug}`}
                    className="p-3 rounded-lg bg-white border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all text-amber-700 hover:text-amber-900 font-medium"
                  >
                    {rt.name}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Browse More — Hub Cross Links */}
          <nav className="mt-10 border-t border-slate-200 pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/topics" className="text-amber-600 hover:text-amber-800">← All Topics</a>
              <a href="/for" className="text-amber-600 hover:text-amber-800">Browse by Occasion</a>
              <a href="/books" className="text-amber-600 hover:text-amber-800">Books of the Bible</a>
              <a href="/" className="text-amber-600 hover:text-amber-800">Random Verse</a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
