import { getDailyVerse } from '@/lib/verses';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Daily Bible Verse — Bible Verse Randomizer",
  description: "Today's inspirational Bible verse. Get a new verse every day to guide your spiritual journey.",
};

export default function DailyPage() {
  const verse = getDailyVerse();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-semibold mb-4 inline-block">
            ← Back to Randomizer
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Daily Bible Verse
          </h1>
          <p className="text-xl text-slate-600">
            {today}
          </p>
        </header>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-xl p-8 md:p-12 border-l-4 border-amber-500">
          <div className="space-y-6">
            <p className="text-2xl md:text-3xl font-serif leading-relaxed text-slate-800 italic">
              &ldquo;{verse.text}&rdquo;
            </p>
            <div className="flex justify-end">
              <p className="text-xl font-semibold text-slate-900">
                — {verse.reference}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              {verse.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`/topics/${topic.toLowerCase()}`}
                  className="px-3 py-1 bg-white rounded-full text-sm font-medium text-amber-700 shadow-sm hover:shadow-md transition-all"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg"
          >
            Discover More Verses
          </Link>
        </div>

        <footer className="mt-16 text-center text-slate-600 border-t border-slate-200 pt-8">
          <p className="mb-2">
            <strong>From the makers of Sermon Clips</strong>
          </p>
          <p className="text-sm mb-4">
            AI-powered sermon clipping for churches
          </p>
          <a
            href="https://sermon-clips.com"
            className="text-amber-600 hover:text-amber-700 font-semibold"
          >
            Try Sermon Clips →
          </a>
        </footer>
      </div>
    </div>
  );
}
