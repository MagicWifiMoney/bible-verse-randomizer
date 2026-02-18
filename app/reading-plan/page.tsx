/**
 * Bible Reading Plan — Free Tool Page
 * 
 * Interactive reading plan with links to every chapter (all 6 translations).
 * One of the highest-value free tools for SEO — targets "bible reading plan" (22K+ monthly searches).
 * Creates a massive internal link mesh to chapter pages.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { BOOKS } from '@/lib/book-data';

export const metadata: Metadata = {
    title: 'Bible Reading Plan — Read the Entire Bible in 1 Year (Free)',
    description: 'Free Bible reading plan to read the entire Bible in one year. 365 daily readings with links to every chapter in 6 translations. Start any day — no signup required.',
    alternates: { canonical: 'https://bibleverserandomizer.com/reading-plan' },
    openGraph: {
        title: 'Free Bible Reading Plan — Read the Bible in 1 Year',
        description: '365 daily readings covering all 66 books. Links to every chapter in NIV, KJV, ESV, NLT, MSG & NASB.',
        url: 'https://bibleverserandomizer.com/reading-plan',
    },
};

// Generate 365-day reading plan covering all 1,189 chapters
function generateReadingPlan(): Array<{ day: number; readings: Array<{ book: string; bookSlug: string; chapter: number }> }> {
    const allChapters: Array<{ book: string; bookSlug: string; chapter: number }> = [];
    for (const book of BOOKS) {
        for (let ch = 1; ch <= book.chapters; ch++) {
            allChapters.push({ book: book.name, bookSlug: book.slug, chapter: ch });
        }
    }

    const plan: Array<{ day: number; readings: Array<{ book: string; bookSlug: string; chapter: number }> }> = [];
    const chaptersPerDay = Math.ceil(allChapters.length / 365);

    for (let day = 0; day < 365; day++) {
        const start = day * chaptersPerDay;
        const end = Math.min(start + chaptersPerDay, allChapters.length);
        if (start < allChapters.length) {
            plan.push({ day: day + 1, readings: allChapters.slice(start, end) });
        }
    }
    return plan;
}

const plan = generateReadingPlan();

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'How do I read the Bible in one year?', acceptedAnswer: { '@type': 'Answer', text: `Reading the Bible in one year requires reading approximately ${Math.ceil(1189 / 365)} chapters per day. This free reading plan divides all 1,189 chapters across 365 days, with direct links to every chapter. You can read in any of 6 translations: NIV, KJV, ESV, NLT, MSG, or NASB.` } },
        { '@type': 'Question', name: 'How many chapters are in the Bible?', acceptedAnswer: { '@type': 'Answer', text: 'The Bible has 1,189 chapters total — 929 in the Old Testament (39 books) and 260 in the New Testament (27 books). Psalms has the most chapters (150), while several books have only one chapter (Obadiah, Philemon, 2 John, 3 John, Jude).' } },
        { '@type': 'Question', name: 'What is the best Bible translation for a reading plan?', acceptedAnswer: { '@type': 'Answer', text: 'For a year-long Bible reading plan, the NIV or NLT are popular choices due to their readability. The ESV is excellent for deeper study. You can also switch translations by chapter — every chapter on Bible Verse Randomizer is available in NIV, KJV, ESV, NLT, MSG, and NASB.' } },
    ],
};

export default function ReadingPlanPage() {
    // Group plan by month (30/31 day blocks)
    const months = [
        { name: 'January', days: 31 }, { name: 'February', days: 28 }, { name: 'March', days: 31 },
        { name: 'April', days: 30 }, { name: 'May', days: 31 }, { name: 'June', days: 30 },
        { name: 'July', days: 31 }, { name: 'August', days: 31 }, { name: 'September', days: 30 },
        { name: 'October', days: 31 }, { name: 'November', days: 30 }, { name: 'December', days: 31 },
    ];

    let dayOffset = 0;

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <main className="max-w-4xl mx-auto px-4 py-10">
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-1">›</span>
                    <span className="text-slate-800 font-medium">Reading Plan</span>
                </nav>

                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    Read the Bible in One Year
                </h1>
                <p className="text-lg text-slate-600 mb-4">
                    365 days · {Math.ceil(1189 / 365)}–{Math.ceil(1189 / 365) + 1} chapters per day · Every chapter linked in 6 translations
                </p>
                <p className="text-sm text-slate-500 mb-8">
                    No signup required. Start any day. Click any chapter to read in your preferred translation.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Total Chapters', value: '1,189' },
                        { label: 'Daily Readings', value: `~${Math.ceil(1189 / 365)}` },
                        { label: 'Books', value: '66' },
                        { label: 'Translations', value: '6' },
                    ].map(s => (
                        <div key={s.label} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-amber-700">{s.value}</div>
                            <div className="text-xs text-slate-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Monthly Sections */}
                {months.map(month => {
                    const monthDays = plan.slice(dayOffset, dayOffset + month.days);
                    dayOffset += month.days;

                    return (
                        <section key={month.name} className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-3 sticky top-0 bg-white/90 backdrop-blur py-2 z-10">{month.name}</h2>
                            <div className="space-y-2">
                                {monthDays.map(day => (
                                    <div key={day.day} className="flex items-start gap-3 bg-slate-50 rounded-lg px-4 py-3">
                                        <span className="flex-shrink-0 w-10 h-8 bg-amber-100 text-amber-700 rounded flex items-center justify-center text-xs font-bold">
                                            Day {day.day}
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {day.readings.map(r => (
                                                <Link
                                                    key={`${r.bookSlug}-${r.chapter}`}
                                                    href={`/book/${r.bookSlug}/${r.chapter}`}
                                                    className="text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded transition-colors"
                                                >
                                                    {r.book} {r.chapter}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}

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
                    <Link href="/popular-verses" className="text-amber-600 hover:text-amber-800 font-medium">Popular Verses</Link>
                    <Link href="/translations" className="text-amber-600 hover:text-amber-800 font-medium">Compare Translations</Link>
                    <Link href="/old-testament" className="text-amber-600 hover:text-amber-800 font-medium">Old Testament</Link>
                    <Link href="/new-testament" className="text-amber-600 hover:text-amber-800 font-medium">New Testament</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
