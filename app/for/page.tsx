import { Metadata } from 'next';
import Link from 'next/link';
import { getAllIntentSlugs, getIntentData } from '@/lib/intent-data';

export const metadata: Metadata = {
    title: 'Bible Verses by Occasion — Weddings, Funerals, Tattoos & More',
    description: 'Find the perfect Bible verse for any occasion. Browse Scripture for weddings, funerals, graduations, tattoos, comfort, strength, and hundreds more life situations.',
    alternates: { canonical: 'https://bibleverserandomizer.com/for' },
    openGraph: {
        title: 'Bible Verses by Occasion',
        description: 'Find the perfect Bible verse for any occasion — weddings, tattoos, comfort, and more.',
        url: 'https://bibleverserandomizer.com/for',
        siteName: 'Bible Verse Randomizer',
        type: 'website',
    },
};

export default function IntentsIndexPage() {
    const slugs = getAllIntentSlugs();
    const intents = slugs
        .map(slug => {
            const data = getIntentData(slug);
            return data ? { name: data.name, slug: data.slug, category: data.category, verseCount: data.verses.length } : null;
        })
        .filter(Boolean);

    // Group by category
    const grouped: Record<string, typeof intents> = {};
    for (const intent of intents) {
        if (!intent) continue;
        if (!grouped[intent.category]) grouped[intent.category] = [];
        grouped[intent.category].push(intent);
    }

    // Sort categories by count (most populated first)
    const categories = Object.keys(grouped).sort((a, b) =>
        (grouped[b]?.length || 0) - (grouped[a]?.length || 0)
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Breadcrumb */}
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800">Browse by Occasion</span>
                </nav>

                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Bible Verses for Every Occasion
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Find the perfect Scripture for {intents.length} life situations — from weddings
                        and graduations to moments of grief and anxiety.
                    </p>
                </header>

                {/* Category Groups */}
                {categories.map(category => (
                    <section key={category} className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                            {category}
                            <span className="text-sm font-normal text-slate-400 ml-2">
                                ({grouped[category]?.length})
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {grouped[category]?.map(intent => intent && (
                                <Link
                                    key={intent.slug}
                                    href={`/for/${intent.slug}`}
                                    className="group flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all"
                                >
                                    <span className="text-slate-800 group-hover:text-amber-700 font-medium">
                                        {intent.name}
                                    </span>
                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                        {intent.verseCount} verses
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Cross-links */}
                <div className="mt-16 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Browse More</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link href="/topics" className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-800">By Topic</h3>
                            <p className="text-sm text-slate-500 mt-1">Love, faith, hope, forgiveness & more</p>
                        </Link>
                        <Link href="/books" className="block p-4 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-800">By Book</h3>
                            <p className="text-sm text-slate-500 mt-1">All 66 books of the Bible</p>
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
