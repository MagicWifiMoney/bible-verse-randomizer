/**
 * Translation-Specific Chapter Page
 * 
 * Route: /book/[book]/[chapter]/[translation]
 * Example: /book/genesis/1/kjv, /book/john/3/esv
 * 
 * 5 translations × 1,189 chapters = 5,945 pages.
 * Each has full verse text, translation context, FAQ schema,
 * and cross-links to the same chapter in other translations.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    getAllTranslationChapterParams,
    getTranslationChapterData,
    VALID_TRANSLATIONS,
    TRANSLATION_META,
} from '@/lib/translation-chapter-data';

export const dynamicParams = false;

export async function generateStaticParams() {
    return getAllTranslationChapterParams();
}

export async function generateMetadata({ params }: { params: Promise<{ book: string; chapter: string; translation: string }> }): Promise<Metadata> {
    const { book, chapter: chStr, translation } = await params;
    const data = getTranslationChapterData(book, parseInt(chStr, 10), translation);
    if (!data) return {};

    const title = `${data.bookName} ${data.chapter} ${data.translationMeta.name} — Full Chapter Text`;
    const desc = `Read ${data.bookName} Chapter ${data.chapter} in the ${data.translationMeta.fullName} (${data.translationMeta.name}). ${data.verses.length} verses — ${data.translationMeta.approach}.`;

    return {
        title,
        description: desc,
        alternates: { canonical: `https://bibleverserandomizer.com/book/${book}/${chStr}/${translation}` },
        openGraph: { title, description: desc, url: `https://bibleverserandomizer.com/book/${book}/${chStr}/${translation}`, type: 'article' },
    };
}

export default async function TranslationChapterPage({ params }: { params: Promise<{ book: string; chapter: string; translation: string }> }) {
    const { book, chapter: chStr, translation } = await params;
    const chapterNum = parseInt(chStr, 10);
    const data = getTranslationChapterData(book, chapterNum, translation);
    if (!data) notFound();

    const meta = data.translationMeta;

    const faqs = [
        {
            q: `What is ${data.bookName} ${data.chapter} in the ${meta.name}?`,
            a: `${data.bookName} ${data.chapter} in the ${meta.fullName} (${meta.name}) contains ${data.verses.length} verses. The ${meta.name} uses a ${meta.approach.toLowerCase()} approach, first published in ${meta.year}.`,
        },
        {
            q: `How does the ${meta.name} translate ${data.bookName} ${data.chapter} differently?`,
            a: `The ${meta.fullName} uses ${meta.approach.toLowerCase()}, ${meta.name === 'KJV' ? 'preserving the classic English of 1611' : meta.name === 'MSG' ? 'rendering the text as a modern paraphrase in contemporary idioms' : 'balancing accuracy with modern readability'}. Compare this with the NIV (dynamic equivalence) version of ${data.bookName} ${data.chapter} for a different perspective.`,
        },
        {
            q: `How many verses are in ${data.bookName} ${data.chapter} (${meta.name})?`,
            a: `${data.bookName} Chapter ${data.chapter} contains ${data.verses.length} verses in the ${meta.fullName}. The book of ${data.bookName} has ${data.totalChapters} chapters total.`,
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
            { '@type': 'ListItem', position: 2, name: 'Books', item: 'https://bibleverserandomizer.com/books' },
            { '@type': 'ListItem', position: 3, name: data.bookName, item: `https://bibleverserandomizer.com/book/${book}` },
            { '@type': 'ListItem', position: 4, name: `Chapter ${data.chapter}`, item: `https://bibleverserandomizer.com/book/${book}/${chStr}` },
            { '@type': 'ListItem', position: 5, name: meta.name },
        ],
    };

    const otherTranslations = VALID_TRANSLATIONS.filter(t => t !== data.translation);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <main className="max-w-3xl mx-auto px-4 py-10">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <ol className="flex flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/" itemProp="item" className="hover:text-amber-600"><span itemProp="name">Home</span></Link>
                            <meta itemProp="position" content="1" /><span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/books" itemProp="item" className="hover:text-amber-600"><span itemProp="name">Books</span></Link>
                            <meta itemProp="position" content="2" /><span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href={`/book/${book}`} itemProp="item" className="hover:text-amber-600"><span itemProp="name">{data.bookName}</span></Link>
                            <meta itemProp="position" content="3" /><span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href={`/book/${book}/${chStr}`} itemProp="item" className="hover:text-amber-600"><span itemProp="name">Ch. {data.chapter}</span></Link>
                            <meta itemProp="position" content="4" /><span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <span itemProp="name" className="text-slate-800 font-medium">{meta.name}</span>
                            <meta itemProp="position" content="5" />
                        </li>
                    </ol>
                </nav>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {data.bookName} {data.chapter} <span className="text-amber-600">({meta.name})</span>
                </h1>
                <p className="text-slate-600 mb-4">
                    {data.verses.length} verses · {meta.fullName} · {meta.approach}
                </p>

                {/* Translation badge */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-slate-700 leading-relaxed">{meta.description}</p>
                </div>

                {/* Read in other translations */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Link
                        href={`/book/${book}/${chStr}`}
                        className="px-3 py-1.5 text-sm rounded-full bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        NIV
                    </Link>
                    {otherTranslations.map(t => (
                        <Link
                            key={t}
                            href={`/book/${book}/${chStr}/${t}`}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${t === data.translation
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                        >
                            {TRANSLATION_META[t].name}
                        </Link>
                    ))}
                </div>

                {/* Prev / Next Chapter Nav */}
                <div className="flex justify-between items-center mb-8 text-sm">
                    {data.prevChapter ? (
                        <Link
                            href={`/book/${data.prevChapter.bookSlug}/${data.prevChapter.chapter}/${translation}`}
                            className="text-amber-600 hover:text-amber-800"
                        >
                            ← {data.prevChapter.bookName === data.bookName
                                ? `Chapter ${data.prevChapter.chapter}`
                                : `${data.prevChapter.bookName} ${data.prevChapter.chapter}`}
                        </Link>
                    ) : <span />}
                    {data.nextChapter ? (
                        <Link
                            href={`/book/${data.nextChapter.bookSlug}/${data.nextChapter.chapter}/${translation}`}
                            className="text-amber-600 hover:text-amber-800"
                        >
                            {data.nextChapter.bookName === data.bookName
                                ? `Chapter ${data.nextChapter.chapter}`
                                : `${data.nextChapter.bookName} ${data.nextChapter.chapter}`} →
                        </Link>
                    ) : <span />}
                </div>

                {/* Verses */}
                <article className="space-y-4">
                    {data.verses.map(v => (
                        <p key={v.verse} className="text-slate-800 leading-relaxed">
                            <sup className="text-amber-600 font-bold mr-1 text-xs">{v.verse}</sup>
                            {v.text}
                        </p>
                    ))}
                </article>

                {/* Bottom nav */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200 text-sm">
                    {data.prevChapter ? (
                        <Link href={`/book/${data.prevChapter.bookSlug}/${data.prevChapter.chapter}/${translation}`} className="text-amber-600 hover:text-amber-800">
                            ← {data.prevChapter.bookName === data.bookName ? `Chapter ${data.prevChapter.chapter}` : `${data.prevChapter.bookName} ${data.prevChapter.chapter}`}
                        </Link>
                    ) : <span />}
                    <Link href={`/book/${book}/${chStr}`} className="text-slate-600 hover:text-amber-600">Read in NIV</Link>
                    {data.nextChapter ? (
                        <Link href={`/book/${data.nextChapter.bookSlug}/${data.nextChapter.chapter}/${translation}`} className="text-amber-600 hover:text-amber-800">
                            {data.nextChapter.bookName === data.bookName ? `Chapter ${data.nextChapter.chapter}` : `${data.nextChapter.bookName} ${data.nextChapter.chapter}`} →
                        </Link>
                    ) : <span />}
                </div>

                {/* FAQ */}
                <section className="mt-12 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        About This Translation
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="bg-slate-50 rounded-lg p-4 group">
                                <summary className="font-medium text-slate-800 cursor-pointer group-open:text-amber-700">{faq.q}</summary>
                                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Chapter Grid */}
                <section className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">
                        {data.bookName} ({meta.name}) — All {data.totalChapters} Chapters
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: data.totalChapters }, (_, i) => i + 1).map(ch => (
                            <Link
                                key={ch}
                                href={`/book/${book}/${ch}/${translation}`}
                                className={`w-10 h-10 flex items-center justify-center rounded text-sm font-medium transition-colors ${ch === data.chapter
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                                    }`}
                            >
                                {ch}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Hub */}
                <nav className="mt-10 border-t border-slate-200 pt-6 flex flex-wrap gap-4 text-sm">
                    <Link href={`/book/${book}/${chStr}`} className="text-amber-600 hover:text-amber-800 font-medium">NIV Version</Link>
                    <Link href={`/book/${book}`} className="text-amber-600 hover:text-amber-800 font-medium">{data.bookName} Overview</Link>
                    <Link href="/topics" className="text-amber-600 hover:text-amber-800 font-medium">Browse by Topic</Link>
                    <Link href="/books" className="text-amber-600 hover:text-amber-800 font-medium">All Books</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
