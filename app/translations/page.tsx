/**
 * Bible Translations Comparison Hub Page
 * 
 * Landing page comparing all 6 translations with links to every chapter in each translation.
 * Major link flow hub — connects to 7,134 chapter pages (6 translations × 1,189 chapters).
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Bible Translations Compared — NIV vs KJV vs ESV vs NLT vs MSG vs NASB',
    description: 'Compare 6 Bible translations side by side. Understand the differences between NIV, KJV, ESV, NLT, MSG, and NASB — translation philosophy, accuracy, readability, and best use cases.',
    alternates: { canonical: 'https://bibleverserandomizer.com/translations' },
    openGraph: {
        title: 'Bible Translations Compared — NIV, KJV, ESV, NLT, MSG, NASB',
        description: 'Compare 6 Bible translations — word-for-word vs thought-for-thought. Find the right translation for study, devotion, or memorization.',
        url: 'https://bibleverserandomizer.com/translations',
    },
};

const TRANSLATIONS = [
    {
        key: 'niv', name: 'NIV', fullName: 'New International Version', year: '1978 (rev. 2011)',
        philosophy: 'Dynamic Equivalence', readability: 'High', accuracy: 'High',
        bestFor: 'General reading, church use, and everyday study',
        description: 'The NIV strikes a careful balance between accuracy to the original languages and natural English readability. It is the world\'s most popular modern translation, used in churches and personal devotion worldwide.',
        color: 'bg-blue-50 border-blue-300',
        link: null, // NIV chapters are at /book/[book]/[chapter]
    },
    {
        key: 'kjv', name: 'KJV', fullName: 'King James Version', year: '1611',
        philosophy: 'Formal Equivalence', readability: 'Medium', accuracy: 'Very High',
        bestFor: 'Memorization, liturgy, and literary appreciation',
        description: 'The KJV shaped the English language itself. Its majestic, poetic prose has influenced literature, law, and culture for over 400 years. The cadence of its language makes it ideal for memorization and public reading.',
        color: 'bg-amber-50 border-amber-300',
        link: 'kjv',
    },
    {
        key: 'esv', name: 'ESV', fullName: 'English Standard Version', year: '2001 (rev. 2016)',
        philosophy: 'Essentially Literal', readability: 'High', accuracy: 'Very High',
        bestFor: 'In-depth Bible study, preaching, and theological analysis',
        description: 'The ESV is the gold standard for modern word-for-word translation. Pastors and scholars favor it for its transparency to the original text while maintaining clear, contemporary English.',
        color: 'bg-emerald-50 border-emerald-300',
        link: 'esv',
    },
    {
        key: 'nlt', name: 'NLT', fullName: 'New Living Translation', year: '1996 (rev. 2015)',
        philosophy: 'Dynamic Equivalence', readability: 'Very High', accuracy: 'High',
        bestFor: 'New believers, devotional reading, and youth groups',
        description: 'The NLT renders complex ancient concepts into clear, natural English. It is the most accessible modern translation, making Scripture immediately understandable without sacrificing meaning.',
        color: 'bg-purple-50 border-purple-300',
        link: 'nlt',
    },
    {
        key: 'msg', name: 'MSG', fullName: 'The Message', year: '2002',
        philosophy: 'Paraphrase', readability: 'Very High', accuracy: 'Moderate',
        bestFor: 'Fresh perspective, devotional inspiration, and creative study',
        description: 'Eugene Peterson\'s Message captures the spirit and impact of the original texts using contemporary American idioms. It helps readers experience familiar passages with fresh eyes.',
        color: 'bg-rose-50 border-rose-300',
        link: 'msg',
    },
    {
        key: 'nasb', name: 'NASB', fullName: 'New American Standard Bible', year: '1971 (rev. 2020)',
        philosophy: 'Formal Equivalence', readability: 'Medium', accuracy: 'Highest',
        bestFor: 'Word study, academic analysis, and original-language comparison',
        description: 'The NASB is widely regarded as the most literally accurate English translation. It preserves the exact structure, word order, and terminology of the Hebrew and Greek originals.',
        color: 'bg-cyan-50 border-cyan-300',
        link: 'nasb',
    },
];

const SAMPLE_VERSES = [
    { ref: 'John 3:16', slug: 'john-3-16' },
    { ref: 'Psalm 23:1', slug: 'psalms-23-1' },
    { ref: 'Romans 8:28', slug: 'romans-8-28' },
    { ref: 'Philippians 4:13', slug: 'philippians-4-13' },
    { ref: 'Jeremiah 29:11', slug: 'jeremiah-29-11' },
];

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'What is the most accurate Bible translation?', acceptedAnswer: { '@type': 'Answer', text: 'The NASB (New American Standard Bible) is widely considered the most literally accurate English translation, preserving the exact structure of Hebrew and Greek originals. The ESV is also highly regarded for its essentially literal approach. However, "accuracy" depends on the goal — formal equivalence (word-for-word) is best for study, while dynamic equivalence (thought-for-thought) like NIV better captures the original meaning in natural English.' } },
        { '@type': 'Question', name: 'What Bible translation is easiest to read?', acceptedAnswer: { '@type': 'Answer', text: 'The NLT (New Living Translation) is the easiest modern translation to read while still being a true translation (not a paraphrase). The Message (MSG) by Eugene Peterson is even more accessible but is technically a paraphrase rather than a direct translation. The NIV is the most popular balance of readability and accuracy.' } },
        { '@type': 'Question', name: 'How many Bible translations does Bible Verse Randomizer offer?', acceptedAnswer: { '@type': 'Answer', text: 'Bible Verse Randomizer offers 6 Bible translations: NIV, KJV, ESV, NLT, MSG, and NASB. Every chapter of the Bible is available in all 6 translations, and the top 1,000 most popular verses have side-by-side comparison pages.' } },
        { '@type': 'Question', name: 'What is the difference between a Bible translation and a paraphrase?', acceptedAnswer: { '@type': 'Answer', text: 'A Bible translation (like NIV, KJV, ESV, NLT, NASB) works directly from the original Hebrew and Greek manuscripts, converting the text into English using either word-for-word or thought-for-thought methods. A paraphrase (like The Message) restates the meaning in the translator\'s own words for a more contemporary feel. Both are valuable — translations for study and accuracy, paraphrases for fresh perspective.' } },
    ],
};

export default function TranslationsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <main className="max-w-5xl mx-auto px-4 py-10">
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-1">›</span>
                    <span className="text-slate-800 font-medium">Bible Translations</span>
                </nav>

                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    Bible Translations Compared
                </h1>
                <p className="text-lg text-slate-600 mb-10">
                    Understand the differences between 6 major Bible translations — from word-for-word accuracy to contemporary paraphrase.
                </p>

                {/* Translation Spectrum */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Translation Philosophy Spectrum</h2>
                    <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-rose-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>Word-for-Word</span>
                            <span>Thought-for-Thought</span>
                            <span>Paraphrase</span>
                        </div>
                        <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
                            <div className="absolute h-full bg-gradient-to-r from-blue-400 via-amber-300 to-rose-400 opacity-30 w-full" />
                            {[
                                { name: 'NASB', pos: '8%' },
                                { name: 'KJV', pos: '18%' },
                                { name: 'ESV', pos: '28%' },
                                { name: 'NIV', pos: '50%' },
                                { name: 'NLT', pos: '68%' },
                                { name: 'MSG', pos: '90%' },
                            ].map(t => (
                                <div key={t.name} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border-2 border-amber-500 rounded-full px-2 py-0.5 text-xs font-bold text-slate-800 shadow-sm" style={{ left: t.pos }}>
                                    {t.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Translation Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {TRANSLATIONS.map(t => (
                        <article key={t.key} className={`${t.color} border rounded-xl p-6`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{t.name}</h2>
                                    <p className="text-sm text-slate-600">{t.fullName} · {t.year}</p>
                                </div>
                                <span className="text-xs bg-white text-slate-600 px-2 py-1 rounded-full border">{t.philosophy}</span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed mb-4">{t.description}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                <div className="bg-white/60 rounded-lg p-2"><strong>Readability:</strong> {t.readability}</div>
                                <div className="bg-white/60 rounded-lg p-2"><strong>Accuracy:</strong> {t.accuracy}</div>
                            </div>
                            <p className="text-xs text-slate-500 mb-3"><strong>Best for:</strong> {t.bestFor}</p>
                            <Link
                                href={t.link ? `/book/genesis/1/${t.link}` : '/book/genesis/1'}
                                className="inline-block text-sm text-amber-700 hover:text-amber-900 font-medium"
                            >
                                Start Reading Genesis 1 ({t.name}) →
                            </Link>
                        </article>
                    ))}
                </div>

                {/* Compare specific verses */}
                <section className="border-t border-slate-200 pt-8 mb-10">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Compare a Verse Across All Translations</h2>
                    <p className="text-sm text-slate-600 mb-4">See how these popular verses read differently in each translation:</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_VERSES.map(v => (
                            <Link key={v.slug} href={`/verse/${v.slug}/compare`} className="px-4 py-2 bg-amber-50 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200">
                                {v.ref}
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
                    <Link href="/old-testament" className="text-amber-600 hover:text-amber-800 font-medium">Old Testament</Link>
                    <Link href="/new-testament" className="text-amber-600 hover:text-amber-800 font-medium">New Testament</Link>
                    <Link href="/popular-verses" className="text-amber-600 hover:text-amber-800 font-medium">Popular Verses</Link>
                    <Link href="/books" className="text-amber-600 hover:text-amber-800 font-medium">All 66 Books</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
