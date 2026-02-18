/**
 * Old Testament Hub Page
 * 
 * Aggregate landing page linking to all 39 OT books, popular chapters, and key verses.
 * Acts as a "link flow" hub distributing PageRank to child pages.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { BOOKS } from '@/lib/book-data';

export const metadata: Metadata = {
    title: 'Old Testament — All 39 Books, Chapters & Verses',
    description: 'Explore all 39 books of the Old Testament. Read Genesis through Malachi with chapter summaries, key verses in 6 translations, and topical connections.',
    alternates: { canonical: 'https://bibleverserandomizer.com/old-testament' },
    openGraph: {
        title: 'Old Testament — All 39 Books, Chapters & Verses',
        description: 'Explore all 39 books of the Old Testament with full chapter text in NIV, KJV, ESV, NLT, MSG & NASB.',
        url: 'https://bibleverserandomizer.com/old-testament',
    },
};

const OT_SECTIONS = [
    { name: 'The Pentateuch (Torah)', range: [0, 5], description: 'The five books of Moses — creation, the patriarchs, the Exodus, and the Law.', color: 'bg-amber-50 border-amber-200' },
    { name: 'Historical Books', range: [5, 17], description: 'The history of Israel from the conquest of Canaan through the Babylonian exile and return.', color: 'bg-blue-50 border-blue-200' },
    { name: 'Wisdom & Poetry', range: [17, 22], description: 'Songs, proverbs, and philosophical reflections on life, suffering, and the fear of the Lord.', color: 'bg-purple-50 border-purple-200' },
    { name: 'Major Prophets', range: [22, 27], description: 'The lengthy prophetic works of Isaiah, Jeremiah, Lamentations, Ezekiel, and Daniel.', color: 'bg-emerald-50 border-emerald-200' },
    { name: 'Minor Prophets', range: [27, 39], description: 'Twelve shorter prophetic books — messages of judgment, hope, and restoration.', color: 'bg-rose-50 border-rose-200' },
];

const KEY_OT_VERSES = [
    { ref: 'Genesis 1:1', slug: 'genesis-1-1', text: 'In the beginning God created the heavens and the earth.' },
    { ref: 'Psalm 23:1', slug: 'psalms-23-1', text: 'The LORD is my shepherd, I lack nothing.' },
    { ref: 'Proverbs 3:5', slug: 'proverbs-3-5', text: 'Trust in the LORD with all your heart and lean not on your own understanding.' },
    { ref: 'Isaiah 40:31', slug: 'isaiah-40-31', text: 'But those who hope in the LORD will renew their strength.' },
    { ref: 'Jeremiah 29:11', slug: 'jeremiah-29-11', text: 'For I know the plans I have for you, declares the LORD.' },
    { ref: 'Psalm 46:1', slug: 'psalms-46-1', text: 'God is our refuge and strength, an ever-present help in trouble.' },
];

const otBooks = BOOKS.filter(b => b.testament === 'Old Testament');

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'How many books are in the Old Testament?', acceptedAnswer: { '@type': 'Answer', text: 'The Old Testament contains 39 books, divided into five sections: the Pentateuch (5 books), the Historical Books (12), Wisdom and Poetry (5), the Major Prophets (5), and the Minor Prophets (12).' } },
        { '@type': 'Question', name: 'What is the longest book in the Old Testament?', acceptedAnswer: { '@type': 'Answer', text: 'Psalms is the longest book in the Old Testament with 150 chapters. Isaiah is the longest prophetic book with 66 chapters.' } },
        { '@type': 'Question', name: 'What translations are available for Old Testament books?', acceptedAnswer: { '@type': 'Answer', text: 'Bible Verse Randomizer offers every Old Testament chapter in 6 translations: NIV, KJV, ESV, NLT, MSG, and NASB.' } },
    ],
};

export default function OldTestamentPage() {
    const totalChapters = otBooks.reduce((s, b) => s + b.chapters, 0);
    const totalPages = totalChapters * 6; // 6 translations

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <main className="max-w-4xl mx-auto px-4 py-10">
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-1">›</span>
                    <Link href="/books" className="hover:text-amber-600">Books</Link>
                    <span className="mx-1">›</span>
                    <span className="text-slate-800 font-medium">Old Testament</span>
                </nav>

                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    The Old Testament
                </h1>
                <p className="text-lg text-slate-600 mb-8">
                    {otBooks.length} books · {totalChapters.toLocaleString()} chapters · {totalPages.toLocaleString()}+ pages across 6 translations
                </p>

                {/* Book sections */}
                {OT_SECTIONS.map(section => (
                    <section key={section.name} className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{section.name}</h2>
                        <p className="text-slate-600 text-sm mb-4">{section.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {otBooks.slice(section.range[0], section.range[1]).map(book => (
                                <Link
                                    key={book.slug}
                                    href={`/book/${book.slug}`}
                                    className={`${section.color} border rounded-lg p-3 hover:shadow-md transition-shadow`}
                                >
                                    <h3 className="font-semibold text-slate-800 text-sm">{book.name}</h3>
                                    <p className="text-xs text-slate-500">{book.chapters} chapters</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Key verses */}
                <section className="mt-12 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Most Popular Old Testament Verses</h2>
                    <div className="space-y-3">
                        {KEY_OT_VERSES.map(v => (
                            <Link key={v.slug} href={`/verse/${v.slug}`} className="block bg-slate-50 rounded-lg p-4 hover:bg-amber-50 transition-colors">
                                <span className="font-semibold text-amber-700 text-sm">{v.ref}</span>
                                <p className="text-slate-700 text-sm mt-1">&ldquo;{v.text}&rdquo;</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Related topics */}
                <section className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Popular Old Testament Topics</h2>
                    <div className="flex flex-wrap gap-2">
                        {['creation', 'faith', 'covenant', 'prophecy', 'wisdom', 'law', 'psalms', 'prayer', 'judgment', 'mercy', 'redemption', 'worship'].map(t => (
                            <Link key={t} href={`/topic/${t}`} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors capitalize">
                                {t}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Hub links */}
                <nav className="mt-10 border-t border-slate-200 pt-6 flex flex-wrap gap-4 text-sm">
                    <Link href="/new-testament" className="text-amber-600 hover:text-amber-800 font-medium">New Testament →</Link>
                    <Link href="/translations" className="text-amber-600 hover:text-amber-800 font-medium">Compare Translations</Link>
                    <Link href="/popular-verses" className="text-amber-600 hover:text-amber-800 font-medium">Popular Verses</Link>
                    <Link href="/books" className="text-amber-600 hover:text-amber-800 font-medium">All 66 Books</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
