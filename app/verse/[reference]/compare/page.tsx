/**
 * Verse Comparison Page
 * 
 * Route: /verse/[reference]/compare
 * Shows the same verse across all 6 translations side by side.
 * 1,000 pages — one per priority verse.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllVerseSlugs, getVerseDetailData } from '@/lib/verse-detail-data';

export const dynamicParams = true;
export const revalidate = 86400; // ISR: regenerate every 24 hours

export async function generateStaticParams() {
    // Seed top 50 comparison pages at build time; rest generated on-demand via ISR
    return getAllVerseSlugs().slice(0, 50).map(slug => ({ reference: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ reference: string }> }): Promise<Metadata> {
    const { reference } = await params;
    const verse = getVerseDetailData(reference);
    if (!verse) return {};

    const title = `${verse.book} ${verse.chapter}:${verse.verse} — Compare 6 Translations`;
    const desc = `Compare ${verse.book} ${verse.chapter}:${verse.verse} across NIV, KJV, ESV, NLT, MSG & NASB. See how different Bible translations render this verse — word-for-word vs thought-for-thought.`;

    return {
        title,
        description: desc,
        alternates: { canonical: `https://bibleverserandomizer.com/verse/${reference}/compare` },
        openGraph: { title, description: desc, url: `https://bibleverserandomizer.com/verse/${reference}/compare`, type: 'article' },
    };
}

const TRANSLATION_INFO: Record<string, { fullName: string; approach: string; year: string; style: string }> = {
    NIV: { fullName: 'New International Version', approach: 'Balance of accuracy and readability', year: '1978 (rev. 2011)', style: 'Dynamic equivalence' },
    KJV: { fullName: 'King James Version', approach: 'Formal / word-for-word', year: '1611', style: 'Formal equivalence' },
    ESV: { fullName: 'English Standard Version', approach: 'Essentially literal', year: '2001 (rev. 2016)', style: 'Formal equivalence' },
    NLT: { fullName: 'New Living Translation', approach: 'Thought-for-thought clarity', year: '1996 (rev. 2015)', style: 'Dynamic equivalence' },
    MSG: { fullName: 'The Message', approach: 'Contemporary paraphrase', year: '2002', style: 'Paraphrase' },
    NASB: { fullName: 'New American Standard Bible', approach: 'Most literal English translation', year: '1971 (rev. 2020)', style: 'Formal equivalence' },
};

export default async function CompareVersePage({ params }: { params: Promise<{ reference: string }> }) {
    const { reference } = await params;
    const verse = getVerseDetailData(reference);
    if (!verse) notFound();

    const translations = [
        { key: 'NIV', text: verse.text_niv },
        { key: 'KJV', text: verse.text_kjv },
        { key: 'ESV', text: verse.text_esv },
        { key: 'NLT', text: verse.text_nlt },
        { key: 'MSG', text: verse.text_msg },
        { key: 'NASB', text: verse.text_nasb },
    ].filter(t => t.text);

    const wordCounts = translations.map(t => ({
        key: t.key,
        words: (t.text || '').split(/\s+/).length,
    }));

    const bookSlug = reference.split('-').slice(0, -2).join('-');

    const faqs = [
        {
            q: `How many Bible translations are there for ${verse.book} ${verse.chapter}:${verse.verse}?`,
            a: `Bible Verse Randomizer offers ${verse.book} ${verse.chapter}:${verse.verse} in ${translations.length} translations: ${translations.map(t => TRANSLATION_INFO[t.key].fullName).join(', ')}. Each uses a different translation philosophy — from word-for-word (KJV, ESV, NASB) to thought-for-thought (NIV, NLT) to paraphrase (MSG).`,
        },
        {
            q: `Which translation of ${verse.book} ${verse.chapter}:${verse.verse} is best?`,
            a: `No single translation is "best" — it depends on your purpose. For deep study, use the ESV or NASB (word-for-word). For devotional reading, the NIV balances accuracy and readability. The NLT and MSG are excellent for understanding the general meaning in modern English. Comparing multiple translations helps grasp the full richness of the text.`,
        },
        {
            q: `What is the difference between literal and dynamic Bible translations?`,
            a: `Literal (formal equivalence) translations like KJV, ESV, and NASB translate word-for-word from the original Hebrew/Greek. Dynamic equivalence translations like NIV and NLT translate thought-for-thought for clarity. The MSG is a paraphrase that captures the spirit in contemporary language. Each approach has strengths — that's why comparing translations is valuable.`,
        },
    ];

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bibleverserandomizer.com' },
            { '@type': 'ListItem', position: 2, name: verse.book, item: `https://bibleverserandomizer.com/book/${bookSlug}` },
            { '@type': 'ListItem', position: 3, name: `${verse.chapter}:${verse.verse}`, item: `https://bibleverserandomizer.com/verse/${reference}` },
            { '@type': 'ListItem', position: 4, name: 'Compare Translations' },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <main className="max-w-4xl mx-auto px-4 py-10">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <ol className="flex flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/" itemProp="item" className="hover:text-amber-600"><span itemProp="name">Home</span></Link>
                            <meta itemProp="position" content="1" /><span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href={`/book/${bookSlug}`} itemProp="item" className="hover:text-amber-600"><span itemProp="name">{verse.book}</span></Link>
                            <meta itemProp="position" content="2" /><span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href={`/verse/${reference}`} itemProp="item" className="hover:text-amber-600"><span itemProp="name">{verse.chapter}:{verse.verse}</span></Link>
                            <meta itemProp="position" content="3" /><span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <span itemProp="name" className="text-slate-800 font-medium">Compare</span>
                            <meta itemProp="position" content="4" />
                        </li>
                    </ol>
                </nav>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {verse.book} {verse.chapter}:{verse.verse} — Compare Translations
                </h1>
                <p className="text-slate-600 mb-8">
                    Read this verse in {translations.length} Bible translations — from word-for-word to thought-for-thought.
                </p>

                {/* Translation Cards */}
                <div className="space-y-6">
                    {translations.map(t => {
                        const info = TRANSLATION_INFO[t.key];
                        return (
                            <article key={t.key} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">{t.key}</h2>
                                        <p className="text-sm text-slate-500">{info.fullName} · {info.year}</p>
                                    </div>
                                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                                        {info.style}
                                    </span>
                                </div>
                                <blockquote className="text-slate-800 leading-relaxed text-lg border-l-4 border-amber-400 pl-4">
                                    {t.text}
                                </blockquote>
                                <p className="text-xs text-slate-400 mt-2">
                                    {(t.text || '').split(/\s+/).length} words · {info.approach}
                                </p>
                            </article>
                        );
                    })}
                </div>

                {/* Word Count Comparison */}
                <section className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Translation Length Comparison</h2>
                    <div className="bg-slate-50 rounded-xl p-6">
                        {wordCounts.map(wc => (
                            <div key={wc.key} className="flex items-center gap-3 mb-2 last:mb-0">
                                <span className="w-14 text-sm font-mono font-bold text-slate-700">{wc.key}</span>
                                <div className="flex-1 bg-slate-200 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-amber-500 h-full rounded-full transition-all"
                                        style={{ width: `${(wc.words / Math.max(...wordCounts.map(w => w.words))) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-slate-600 w-16 text-right">{wc.words} words</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="bg-slate-50 rounded-lg p-4 group">
                                <summary className="font-medium text-slate-800 cursor-pointer group-open:text-amber-700">
                                    {faq.q}
                                </summary>
                                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Internal Links */}
                <nav className="mt-10 border-t border-slate-200 pt-6 flex flex-wrap gap-4 text-sm">
                    <Link href={`/verse/${reference}`} className="text-amber-600 hover:text-amber-800 font-medium">← Verse Detail</Link>
                    <Link href={`/book/${bookSlug}/${verse.chapter}`} className="text-amber-600 hover:text-amber-800 font-medium">Read Full Chapter</Link>
                    <Link href="/topics" className="text-amber-600 hover:text-amber-800 font-medium">Browse by Topic</Link>
                    <Link href="/books" className="text-amber-600 hover:text-amber-800 font-medium">All Books</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
