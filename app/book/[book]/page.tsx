import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookOverviewPage from '@/components/templates/BookOverviewPage';
import { Breadcrumbs } from '@/components/seo/RelatedLinks';
import { generateMetadata as generateSEOMetadata, buildPageSchemas, generateBreadcrumbs, buildBookSchema } from '@/lib/seo';
import { getBookData, getAllBookSlugs, getAdjacentBooks } from '@/lib/book-data';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ book: string }> }): Promise<Metadata> {
  const { book: slug } = await params;
  const book = getBookData(slug);
  if (!book) return { title: 'Book Not Found' };

  return generateSEOMetadata('book', {
    name: book.name,
    slug: book.slug,
    testament: book.testament,
    chapterCount: book.chapterCount,
    verseCount: book.verseCount
  });
}

export async function generateStaticParams() {
  return getAllBookSlugs().map(slug => ({ book: slug }));
}

export default async function BookPageRoute({ params }: { params: Promise<{ book: string }> }) {
  const { book: slug } = await params;
  const book = getBookData(slug);
  if (!book) notFound();

  // Build breadcrumbs
  const breadcrumbs = generateBreadcrumbs(`/book/${slug}`, book.name);

  // Get adjacent books for prev/next navigation
  const { prev, next } = getAdjacentBooks(slug);

  // Build JSON-LD schemas
  const pageSchema = buildPageSchemas({
    pageType: 'book',
    data: { name: book.name, description: book.summary },
    pathname: `/book/${slug}`,
    currentPageName: book.name,
  });

  const bookSchema = buildBookSchema({
    name: `The Book of ${book.name}`,
    url: `https://bibleverserandomizer.com/book/${slug}`,
    description: book.summary,
    numberOfPages: book.chapterCount,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs links={breadcrumbs.map(b => ({ url: b.url, text: b.name, type: 'breadcrumb' as const }))} />

          <BookOverviewPage book={book} />

          {/* Related Topics in This Book */}
          {book.themes.length > 0 && (
            <section className="mt-12 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Related Topics</h2>
              <div className="flex flex-wrap gap-2">
                {book.themes.map(theme => (
                  <a
                    key={theme.name}
                    href={`/topic/${theme.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                    className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm hover:bg-amber-100 transition-colors"
                  >
                    {theme.name}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Prev/Next Book Navigation */}
          <div className="mt-10 border-t border-slate-200 pt-6 flex justify-between items-center">
            {prev ? (
              <a href={`/book/${prev.slug}`} className="text-amber-600 hover:text-amber-800 font-medium">
                ← {prev.name}
              </a>
            ) : <span />}
            {next ? (
              <a href={`/book/${next.slug}`} className="text-amber-600 hover:text-amber-800 font-medium">
                {next.name} →
              </a>
            ) : <span />}
          </div>

          {/* Hub Cross Links */}
          <nav className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/books" className="text-amber-600 hover:text-amber-800">← All Books</a>
              <a href="/topics" className="text-amber-600 hover:text-amber-800">Browse by Topic</a>
              <a href="/for" className="text-amber-600 hover:text-amber-800">Browse by Occasion</a>
              <a href="/" className="text-amber-600 hover:text-amber-800">Random Verse</a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
