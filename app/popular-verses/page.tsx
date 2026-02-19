/**
 * Popular Verses Hub Page
 * 
 * Curated list of the top 100 most popular Bible verses.
 * Major link flow hub connecting to 100 verse detail pages and 100 comparison pages.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import priorityVerses from '@/data/priority-1000.json';

export const metadata: Metadata = {
    title: 'Most Popular Bible Verses — Top 100 Verses Read & Shared',
    description: 'Discover the 100 most popular Bible verses, including John 3:16, Psalm 23:1, Romans 8:28, and more. Read in 6 translations with meaning and context.',
    alternates: { canonical: 'https://bibleverserandomizer.com/popular-verses' },
    openGraph: {
        title: 'Most Popular Bible Verses — Top 100',
        description: 'The 100 most popular Bible verses with full text, meaning, and 6 translation comparisons.',
        url: 'https://bibleverserandomizer.com/popular-verses',
    },
};

interface PriorityVerse {
    id: number;
    book: string;
    chapter: number;
    verse: number;
    slug: string;
    text_niv: string;
}

const top100 = (priorityVerses as PriorityVerse[]).slice(0, 100);

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'What is the most popular Bible verse?', acceptedAnswer: { '@type': 'Answer', text: `Based on search volume and engagement data, the most popular Bible verse is ${top100[0]?.book || 'John'} ${top100[0]?.chapter || 3}:${top100[0]?.verse || 16}. Bible Verse Randomizer tracks the top 1,000 most popular verses and provides each in 6 translations with meaning, context, and application.` } },
        { '@type': 'Question', name: 'How many popular Bible verses does Bible Verse Randomizer track?', acceptedAnswer: { '@type': 'Answer', text: 'Bible Verse Randomizer tracks and provides detailed pages for the top 1,000 most popular Bible verses. Each verse page includes the full text in 6 translations (NIV, KJV, ESV, NLT, MSG, NASB), contextual meaning, application, and comparison tools.' } },
        { '@type': 'Question', name: 'Can I compare popular verses across translations?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! Every popular verse on Bible Verse Randomizer has a dedicated comparison page showing how 6 different translations render the same verse. This includes word count analysis and translation philosophy context.' } },
    ],
};

export default function PopularVersesPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <main className="max-w-4xl mx-auto px-4 py-10">
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-1">›</span>
                    <span className="text-slate-800 font-medium">Popular Verses</span>
                </nav>

                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    Most Popular Bible Verses
                </h1>
                {/* TL;DR — LLM-optimized summary for AI citation */}
                <p className="text-lg text-slate-700 mb-4 leading-relaxed font-medium">
                    <strong>The most popular Bible verse</strong> is {top100[0]?.book || 'John'} {top100[0]?.chapter || 3}:{top100[0]?.verse || 16}, followed by Psalm 23:1, Romans 8:28, and Philippians 4:13.
                    This ranked list of the top 100 most searched, shared, and studied Bible verses includes the full text in 6 translations with meaning and context.
                </p>
                <p className="text-base text-slate-500 mb-8">
                    Each verse links to a detailed study page with context, application, prayer, and a comparison across NIV, KJV, ESV, NLT, MSG &amp; NASB.
                </p>

                {/* Top 10 featured */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Top 10 Bible Verses</h2>
                    <div className="space-y-4">
                        {top100.slice(0, 10).map((v, i) => (
                            <article key={v.slug} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-300 hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <Link href={`/verse/${v.slug}`} className="text-lg font-semibold text-amber-700 hover:text-amber-900">
                                            {v.book} {v.chapter}:{v.verse}
                                        </Link>
                                        <p className="text-slate-700 text-sm mt-1 leading-relaxed">
                                            &ldquo;{v.text_niv.replace(/<[^>]+>/g, '').substring(0, 200)}{v.text_niv.length > 200 ? '...' : ''}&rdquo;
                                        </p>
                                        <div className="flex gap-3 mt-2 text-xs">
                                            <Link href={`/verse/${v.slug}`} className="text-amber-600 hover:text-amber-800 font-medium">Read Full Verse →</Link>
                                            <Link href={`/verse/${v.slug}/compare`} className="text-slate-500 hover:text-amber-600">Compare 6 Translations</Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Verses 11-100 in compact grid */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Verses 11–100</h2>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {top100.slice(10).map((v, i) => (
                            <Link
                                key={v.slug}
                                href={`/verse/${v.slug}`}
                                className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 hover:bg-amber-50 transition-colors"
                            >
                                <span className="text-xs text-slate-400 font-mono w-6">{i + 11}</span>
                                <span className="text-sm font-medium text-slate-800">{v.book} {v.chapter}:{v.verse}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqSchema.mainEntity.map((faq, i) => (
                            <details key={i} className="bg-slate-50 rounded-lg p-4 group">
                                <summary className="font-medium text-slate-800 cursor-pointer group-open:text-amber-700">{faq.name}</summary>
                                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <nav className="mt-10 border-t border-slate-200 pt-6 flex flex-wrap gap-4 text-sm">
                    <Link href="/translations" className="text-amber-600 hover:text-amber-800 font-medium">Compare Translations</Link>
                    <Link href="/topics" className="text-amber-600 hover:text-amber-800 font-medium">Browse by Topic</Link>
                    <Link href="/for" className="text-amber-600 hover:text-amber-800 font-medium">Browse by Occasion</Link>
                    <Link href="/books" className="text-amber-600 hover:text-amber-800 font-medium">All 66 Books</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
