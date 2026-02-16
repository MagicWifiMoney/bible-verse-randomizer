import { Metadata } from 'next';
import BookOverviewPage, { BookPageData } from '@/components/templates/BookOverviewPage';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { book: string } }): Promise<Metadata> {
  const book = await getBookData(params.book);
  if (!book) return { title: 'Book Not Found' };
  
  return generateSEOMetadata('book', {
    name: book.name,
    slug: book.slug,
    testament: book.testament,
    chapterCount: book.chapterCount,
    verseCount: book.verseCount
  });
}

export default async function BookPageRoute({ params }: { params: { book: string } }) {
  const book = await getBookData(params.book);
  if (!book) return <div>Book not found</div>;
  
  return <BookOverviewPage book={book} />;
}

async function getBookData(slug: string): Promise<BookPageData | null> {
  // TODO: Database query
  return null;
}
