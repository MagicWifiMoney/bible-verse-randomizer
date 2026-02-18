/**
 * New Testament Hub Page
 * 
 * Aggregate landing page linking to all 27 NT books, popular chapters, and key verses.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { BOOKS } from '@/lib/book-data';

export const metadata: Metadata = {
    title: 'New Testament — All 27 Books, Chapters & Verses',
    description: 'Explore all 27 books of the New Testament. Read Matthew through Revelation with chapter summaries, key verses in 6 translations, and topical connections.',
    alternates: { canonical: 'https://bibleverserandomizer.com/new-testament' },
    openGraph: {
        title: 'New Testament — All 27 Books, Chapters & Verses',
        description: 'Explore all 27 books of the New Testament with full chapter text in NIV, KJV, ESV, NLT, MSG & NASB.',
        url: 'https://bibleverserandomizer.com/new-testament',
    },
};

const NT_SECTIONS = [
    { name: 'The Gospels', range: [39, 43], description: 'Four accounts of the life, death, and resurrection of Jesus Christ.', color: 'bg-amber-50 border-amber-200' },
    { name: 'History', range: [43, 44], description: 'The Acts of the Apostles — the birth and growth of the early church.', color: 'bg-blue-50 border-blue-200' },
    { name: 'Pauline Epistles', range: [44, 57], description: 'Thirteen letters by the Apostle Paul to churches and individuals.', color: 'bg-purple-50 border-purple-200' },
    { name: 'General Epistles', range: [57, 65], description: 'Letters from James, Peter, John, and Jude to the wider church.', color: 'bg-emerald-50 border-emerald-200' },
    { name: 'Prophecy', range: [65, 66], description: 'The Revelation of Jesus Christ — apocalyptic vision of the end times.', color: 'bg-rose-50 border-rose-200' },
];

const KEY_NT_VERSES = [
    { ref: 'John 3:16', slug: 'john-3-16', text: 'For God so loved the world that he gave his one and only Son.' },
    { ref: 'Romans 8:28', slug: 'romans-8-28', text: 'And we know that in all things God works for the good of those who love him.' },
    { ref: 'Philippians 4:13', slug: 'philippians-4-13', text: 'I can do all this through him who gives me strength.' },
    { ref: 'Matthew 28:19', slug: 'matthew-28-19', text: 'Therefore go and make disciples of all nations.' },
    { ref: 'Galatians 5:22', slug: 'galatians-5-22', text: 'But the fruit of the Spirit is love, joy, peace, forbearance...' },
    { ref: 'Ephesians 2:8', slug: 'ephesians-2-8', text: 'For it is by grace you have been saved, through faith.' },
];

const ntBooks = BOOKS.filter(b => b.testament === 'New Testament');

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'How many books are in the New Testament?', acceptedAnswer: { '@type': 'Answer', text: 'The New Testament contains 27 books, including 4 Gospels, 1 book of history (Acts), 13 Pauline Epistles, 8 General Epistles, and 1 book of prophecy (Revelation).' } },
        { '@type': 'Question', name: 'What is the most quoted New Testament verse?', acceptedAnswer: { '@type': 'Answer', text: 'John 3:16 is widely considered the most quoted verse in the entire Bible: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."' } },
        { '@type': 'Question', name: 'How many chapters are in the New Testament?', acceptedAnswer: { '@type': 'Answer', text: `The New Testament contains ${ntBooks.reduce((s, b) => s + b.chapters, 0)} chapters across 27 books. All chapters are available in 6 translations on Bible Verse Randomizer.` } },
    ],
};

export default function NewTestamentPage() {
    const totalChapters = ntBooks.reduce((s, b) => s + b.chapters, 0);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <main className="max-w-4xl mx-auto px-4 py-10">
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-1">›</span>
                    <Link href="/books" className="hover:text-amber-600">Books</Link>
                    <span className="mx-1">›</span>
                    <span className="text-slate-800 font-medium">New Testament</span>
                </nav>

                <h1 className="text-4xl font-bold text-slate-900 mb-3">The New Testament</h1>
                <p className="text-lg text-slate-600 mb-8">
                    {ntBooks.length} books · {totalChapters.toLocaleString()} chapters · {(totalChapters * 6).toLocaleString()}+ pages across 6 translations
                </p>

                {NT_SECTIONS.map(section => (
                    <section key={section.name} className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{section.name}</h2>
                        <p className="text-slate-600 text-sm mb-4">{section.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {ntBooks.slice(section.range[0] - 39, section.range[1] - 39).map(book => (
                                <Link key={book.slug} href={`/book/${book.slug}`} className={`${section.color} border rounded-lg p-3 hover:shadow-md transition-shadow`}>
                                    <h3 className="font-semibold text-slate-800 text-sm">{book.name}</h3>
                                    <p className="text-xs text-slate-500">{book.chapters} chapters</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Key verses */}
                <section className="mt-12 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Most Popular New Testament Verses</h2>
                    <div className="space-y-3">
                        {KEY_NT_VERSES.map(v => (
                            <Link key={v.slug} href={`/verse/${v.slug}`} className="block bg-slate-50 rounded-lg p-4 hover:bg-amber-50 transition-colors">
                                <span className="font-semibold text-amber-700 text-sm">{v.ref}</span>
                                <p className="text-slate-700 text-sm mt-1">&ldquo;{v.text}&rdquo;</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Topics */}
                <section className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Popular New Testament Topics</h2>
                    <div className="flex flex-wrap gap-2">
                        {['love', 'grace', 'salvation', 'faith', 'hope', 'forgiveness', 'eternal-life', 'peace', 'joy', 'holy-spirit', 'prayer', 'heaven'].map(t => (
                            <Link key={t} href={`/topic/${t}`} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors capitalize">
                                {t.replace(/-/g, ' ')}
                            </Link>
                        ))}
                    </div>
                </section>

                <nav className="mt-10 border-t border-slate-200 pt-6 flex flex-wrap gap-4 text-sm">
                    <Link href="/old-testament" className="text-amber-600 hover:text-amber-800 font-medium">← Old Testament</Link>
                    <Link href="/translations" className="text-amber-600 hover:text-amber-800 font-medium">Compare Translations</Link>
                    <Link href="/popular-verses" className="text-amber-600 hover:text-amber-800 font-medium">Popular Verses</Link>
                    <Link href="/books" className="text-amber-600 hover:text-amber-800 font-medium">All 66 Books</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
