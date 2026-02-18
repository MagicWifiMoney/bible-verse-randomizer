import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllChapterParams, getChapterData } from '@/lib/chapter-data';

export const dynamicParams = false; // 404 on invalid slugs — speed + trust

export async function generateStaticParams() {
    return getAllChapterParams();
}

export async function generateMetadata({ params }: { params: Promise<{ book: string; chapter: string }> }): Promise<Metadata> {
    const { book, chapter: chStr } = await params;
    const data = getChapterData(book, parseInt(chStr, 10));
    if (!data) return {};

    const title = `${data.bookName} ${data.chapter} — Read, Study & Reflect`;
    const desc = `Read ${data.bookName} Chapter ${data.chapter} (NIV) — ${data.verses.length} verses with full text. Explore key themes, navigate chapters, and discover related Bible topics.`;

    return {
        title,
        description: desc,
        alternates: { canonical: `https://bibleverserandomizer.com/book/${book}/${chStr}` },
        openGraph: {
            title,
            description: desc,
            url: `https://bibleverserandomizer.com/book/${book}/${chStr}`,
            type: 'article',
        },
    };
}

export default async function ChapterPage({ params }: { params: Promise<{ book: string; chapter: string }> }) {
    const { book, chapter: chStr } = await params;
    const chapterNum = parseInt(chStr, 10);
    const data = getChapterData(book, chapterNum);
    if (!data) notFound();

    // Build FAQ schema — conversational questions ChatGPT/LLMs love
    const faqs = [
        {
            q: `What is ${data.bookName} ${data.chapter} about?`,
            a: `${data.bookName} ${data.chapter} contains ${data.verses.length} verses. ${data.verses.length > 0 ? `It begins: "${data.verses[0].text.substring(0, 150).replace(/\n/g, ' ')}..."` : ''}`,
        },
        {
            q: `How many verses are in ${data.bookName} ${data.chapter}?`,
            a: `${data.bookName} Chapter ${data.chapter} contains ${data.verses.length} verses in the NIV translation.`,
        },
        {
            q: `What book of the Bible is ${data.bookName} ${data.chapter} in?`,
            a: `${data.bookName} ${data.chapter} is in the book of ${data.bookName}, which has ${data.totalChapters} chapters total. ${data.bookName} is part of the Bible's canon of Scripture.`,
        },
    ];

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': f.a,
            },
        })),
    };

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': `${data.bookName} ${data.chapter} — Full Chapter Text (NIV)`,
        'description': `Read the full text of ${data.bookName} Chapter ${data.chapter} with ${data.verses.length} verses.`,
        'url': `https://bibleverserandomizer.com/book/${book}/${chStr}`,
        'isPartOf': { '@id': 'https://bibleverserandomizer.com/#website' },
        'publisher': { '@id': 'https://bibleverserandomizer.com/#organization' },
        'mainEntityOfPage': `https://bibleverserandomizer.com/book/${book}/${chStr}`,
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://bibleverserandomizer.com' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Books', 'item': 'https://bibleverserandomizer.com/books' },
            { '@type': 'ListItem', 'position': 3, 'name': data.bookName, 'item': `https://bibleverserandomizer.com/book/${book}` },
            { '@type': 'ListItem', 'position': 4, 'name': `Chapter ${data.chapter}` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <main className="max-w-3xl mx-auto px-4 py-10">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
                    <ol className="flex flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/" itemProp="item" className="hover:text-amber-600"><span itemProp="name">Home</span></Link>
                            <meta itemProp="position" content="1" />
                            <span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/books" itemProp="item" className="hover:text-amber-600"><span itemProp="name">Books</span></Link>
                            <meta itemProp="position" content="2" />
                            <span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href={`/book/${book}`} itemProp="item" className="hover:text-amber-600"><span itemProp="name">{data.bookName}</span></Link>
                            <meta itemProp="position" content="3" />
                            <span className="mx-1">›</span>
                        </li>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <span itemProp="name" className="text-slate-800 font-medium">Chapter {data.chapter}</span>
                            <meta itemProp="position" content="4" />
                        </li>
                    </ol>
                </nav>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {data.bookName} {data.chapter}
                </h1>
                <p className="text-slate-600 mb-8">
                    {data.verses.length} verses · Chapter {data.chapter} of {data.totalChapters} · NIV Translation
                </p>

                {/* Prev / Next Chapter Nav */}
                <div className="flex justify-between items-center mb-8 text-sm">
                    {data.prevChapter ? (
                        <Link
                            href={`/book/${data.prevChapter.bookSlug}/${data.prevChapter.chapter}`}
                            className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                        >
                            ← {data.prevChapter.bookName === data.bookName
                                ? `Chapter ${data.prevChapter.chapter}`
                                : `${data.prevChapter.bookName} ${data.prevChapter.chapter}`}
                        </Link>
                    ) : <span />}
                    {data.nextChapter ? (
                        <Link
                            href={`/book/${data.nextChapter.bookSlug}/${data.nextChapter.chapter}`}
                            className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
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

                {/* Bottom Prev / Next */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200 text-sm">
                    {data.prevChapter ? (
                        <Link
                            href={`/book/${data.prevChapter.bookSlug}/${data.prevChapter.chapter}`}
                            className="text-amber-600 hover:text-amber-800"
                        >
                            ← {data.prevChapter.bookName === data.bookName
                                ? `Chapter ${data.prevChapter.chapter}`
                                : `${data.prevChapter.bookName} ${data.prevChapter.chapter}`}
                        </Link>
                    ) : <span />}
                    <Link href={`/book/${book}`} className="text-slate-600 hover:text-amber-600">
                        {data.bookName} Overview
                    </Link>
                    {data.nextChapter ? (
                        <Link
                            href={`/book/${data.nextChapter.bookSlug}/${data.nextChapter.chapter}`}
                            className="text-amber-600 hover:text-amber-800"
                        >
                            {data.nextChapter.bookName === data.bookName
                                ? `Chapter ${data.nextChapter.chapter}`
                                : `${data.nextChapter.bookName} ${data.nextChapter.chapter}`} →
                        </Link>
                    ) : <span />}
                </div>

                {/* FAQ Section — optimized for ChatGPT/AEO extraction */}
                <section className="mt-12 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Common Questions about {data.bookName} {data.chapter}
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="bg-slate-50 rounded-lg p-4 group">
                                <summary className="font-medium text-slate-800 cursor-pointer group-open:text-amber-700">
                                    {faq.q}
                                </summary>
                                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Chapter Grid — internal links for crawlability */}
                <section className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">
                        All {data.totalChapters} Chapters of {data.bookName}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: data.totalChapters }, (_, i) => i + 1).map(ch => (
                            <Link
                                key={ch}
                                href={`/book/${book}/${ch}`}
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

                {/* Read in Other Translations */}
                <section className="mt-10 border-t border-slate-200 pt-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">
                        Read {data.bookName} {data.chapter} in Other Translations
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {['kjv', 'esv', 'nlt', 'msg', 'nasb'].map(t => (
                            <Link
                                key={t}
                                href={`/book/${book}/${data.chapter}/${t}`}
                                className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 text-sm font-medium transition-colors"
                            >
                                {t.toUpperCase()}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Hub Cross-Links */}
                <nav className="mt-10 border-t border-slate-200 pt-6 flex flex-wrap gap-4 text-sm">
                    <Link href="/topics" className="text-amber-600 hover:text-amber-800 font-medium">Browse by Topic</Link>
                    <Link href="/for" className="text-amber-600 hover:text-amber-800 font-medium">Browse by Occasion</Link>
                    <Link href="/books" className="text-amber-600 hover:text-amber-800 font-medium">All Books</Link>
                    <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">Random Verse</Link>
                </nav>
            </main>
        </>
    );
}
