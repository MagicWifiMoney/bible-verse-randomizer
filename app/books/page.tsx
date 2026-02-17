import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBookSlugs, getBookData } from '@/lib/book-data';

export const metadata: Metadata = {
    title: 'Books of the Bible — All 66 Books Overview | Bible Verse Randomizer',
    description: 'Explore all 66 books of the Bible with summaries, key themes, chapter counts, and notable verses. Browse the Old and New Testament books.',
    alternates: { canonical: 'https://bibleverserandomizer.com/books' },
    openGraph: {
        title: 'Books of the Bible — Complete Guide',
        description: 'Explore all 66 books of the Bible with summaries, themes, and key verses.',
        url: 'https://bibleverserandomizer.com/books',
        siteName: 'Bible Verse Randomizer',
        type: 'website',
    },
};

export default function BooksIndexPage() {
    const slugs = getAllBookSlugs();
    const books = slugs
        .map(slug => getBookData(slug))
        .filter(Boolean);

    const otBooks = books.filter(b => b?.testament === 'Old Testament');
    const ntBooks = books.filter(b => b?.testament === 'New Testament');

    const totalChapters = books.reduce((sum, b) => sum + (b?.chapterCount || 0), 0);
    const totalVerses = books.reduce((sum, b) => sum + (b?.verseCount || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Breadcrumb */}
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800">Books of the Bible</span>
                </nav>

                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Books of the Bible
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                        Explore all 66 books — {totalChapters.toLocaleString()} chapters and {totalVerses.toLocaleString()} verses
                        of God&apos;s Word.
                    </p>
                    <div className="flex justify-center gap-6 text-sm">
                        <a href="#old-testament" className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 transition-colors">
                            Old Testament ({otBooks.length})
                        </a>
                        <a href="#new-testament" className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 transition-colors">
                            New Testament ({ntBooks.length})
                        </a>
                    </div>
                </header>

                {/* Old Testament */}
                <section id="old-testament" className="mb-14">
                    <h2 className="text-3xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6">
                        Old Testament
                        <span className="text-sm font-normal text-slate-400 ml-2">({otBooks.length} books)</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {otBooks.map(book => book && (
                            <Link
                                key={book.slug}
                                href={`/book/${book.slug}`}
                                className="group p-4 rounded-lg bg-white border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-slate-800 group-hover:text-amber-700 font-semibold">
                                        {book.name}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {book.chapterCount} ch
                                    </span>
                                </div>
                                {book.themes[0] && (
                                    <p className="text-xs text-slate-500 line-clamp-1">
                                        {book.themes[0].name}: {book.themes[0].description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* New Testament */}
                <section id="new-testament" className="mb-14">
                    <h2 className="text-3xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6">
                        New Testament
                        <span className="text-sm font-normal text-slate-400 ml-2">({ntBooks.length} books)</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {ntBooks.map(book => book && (
                            <Link
                                key={book.slug}
                                href={`/book/${book.slug}`}
                                className="group p-4 rounded-lg bg-white border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-slate-800 group-hover:text-amber-700 font-semibold">
                                        {book.name}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {book.chapterCount} ch
                                    </span>
                                </div>
                                {book.themes[0] && (
                                    <p className="text-xs text-slate-500 line-clamp-1">
                                        {book.themes[0].name}: {book.themes[0].description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Cross-links */}
                <div className="mt-16 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Browse More</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link href="/topics" className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-800">By Topic</h3>
                            <p className="text-sm text-slate-500 mt-1">Love, faith, hope, forgiveness & more</p>
                        </Link>
                        <Link href="/for" className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-800">By Occasion</h3>
                            <p className="text-sm text-slate-500 mt-1">Verses for weddings, funerals, tattoos & more</p>
                        </Link>
                        <Link href="/" className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-800">Random Verse</h3>
                            <p className="text-sm text-slate-500 mt-1">Get a random Bible verse instantly</p>
                        </Link>
                    </div>
                </div>

                <footer className="mt-16 text-center text-slate-600 border-t border-slate-200 pt-8">
                    <p className="text-sm">© {new Date().getFullYear()} Bible Verse Randomizer</p>
                </footer>
            </div>
        </div>
    );
}
