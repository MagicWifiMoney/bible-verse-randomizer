import { getVersesByTopic, topics, type Topic } from '@/lib/verses';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return topics.map((topic) => ({
    topic: topic.toLowerCase(),
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ topic: string }> 
}): Promise<Metadata> {
  const { topic } = await params;
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  
  return {
    title: `${capitalizedTopic} Bible Verses — Bible Verse Randomizer`,
    description: `Discover inspiring Bible verses about ${topic}. Find comfort, guidance, and wisdom from Scripture.`,
  };
}

export default async function TopicPage({ 
  params 
}: { 
  params: Promise<{ topic: string }> 
}) {
  const { topic } = await params;
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  
  // Validate topic
  if (!topics.map(t => t.toLowerCase()).includes(topic.toLowerCase())) {
    notFound();
  }

  const verses = getVersesByTopic(capitalizedTopic as Topic);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-semibold mb-4 inline-block">
            ← Back to Randomizer
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            {capitalizedTopic} Bible Verses
          </h1>
          <p className="text-xl text-slate-600">
            {verses.length} inspiring verses about {topic}
          </p>
        </header>

        <div className="space-y-6">
          {verses.map((verse, index) => (
            <div
              key={`${verse.reference}-${index}`}
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-amber-500"
            >
              <p className="text-lg md:text-xl font-serif leading-relaxed text-slate-800 italic mb-4">
                &ldquo;{verse.text}&rdquo;
              </p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-slate-900">
                  {verse.reference}
                </p>
                <div className="flex flex-wrap gap-2">
                  {verse.topics.filter(t => t !== capitalizedTopic).map((t) => (
                    <Link
                      key={t}
                      href={`/topics/${t.toLowerCase()}`}
                      className="px-2 py-1 bg-white rounded-full text-xs font-medium text-amber-700 hover:shadow-md transition-all"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg"
          >
            Discover More Topics
          </Link>
        </div>

        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              Turn Bible Verses into Video Clips
            </h3>
            <p className="text-slate-300 mb-6">
              Create engaging video content for your church with AI-powered sermon clipping
            </p>
            <a
              href="https://sermon-clips.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-all shadow-lg"
            >
              Try Sermon Clips Free →
            </a>
          </div>
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
            Learn More →
          </a>
        </footer>
      </div>
    </div>
  );
}
