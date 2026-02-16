/**
 * Topic Page Template
 * 
 * Displays collection of verses for a specific topic
 * Target: 2,000+ words
 */

import React from 'react';
import Link from 'next/link';

export interface TopicPageData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  level: number;
  parent_topic?: { name: string; slug: string };
  sub_topics?: Array<{ id: number; name: string; slug: string; verseCount: number }>;
  verses: Array<{
    id: number;
    book: string;
    chapter: number;
    verse: number;
    slug: string;
    text: string;
    relevance_score: number;
    category?: string;
  }>;
}

export interface TopicPageProps {
  topic: TopicPageData;
}

export default function TopicPage({ topic }: TopicPageProps) {
  // Group verses by sub-category if available
  const groupedVerses = groupVersesByCategory(topic.verses);

  return (
    <div className="topic-page max-w-7xl mx-auto px-4 py-8">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bible Verses About {topic.name}
        </h1>
        
        {topic.description && (
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            {topic.description}
          </p>
        )}

        <p className="text-gray-600">
          Discover {topic.verses.length}+ powerful Bible verses about {topic.name.toLowerCase()}. 
          Read Scripture passages with context, meaning, and practical application for your life today.
        </p>
      </header>

      {/* Sub-topics Navigation */}
      {topic.sub_topics && topic.sub_topics.length > 0 && (
        <nav className="mb-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Explore More Specific Topics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topic.sub_topics.map(sub => (
              <Link
                key={sub.id}
                href={`/topic/${sub.slug}`}
                className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition"
              >
                <div className="font-semibold text-gray-900">{sub.name}</div>
                <div className="text-sm text-gray-600">{sub.verseCount} verses</div>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Featured/Top Verses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Top {topic.name} Verses
        </h2>
        <p className="text-gray-700 mb-6">
          These are the most well-known and frequently referenced verses about {topic.name.toLowerCase()}:
        </p>
        
        <div className="space-y-6">
          {topic.verses.slice(0, 5).map(verse => (
            <div key={verse.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <blockquote className="text-xl text-gray-900 font-serif leading-relaxed mb-3">
                "{verse.text}"
              </blockquote>
              <cite className="text-lg font-semibold text-gray-800">
                <Link 
                  href={`/verse/${verse.slug}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {verse.book} {verse.chapter}:{verse.verse}
                </Link>
              </cite>
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  📋 Copy
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm">
                  📤 Share
                </button>
                <Link
                  href={`/verse/${verse.slug}`}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorized Verse Lists */}
      {Object.entries(groupedVerses).map(([category, verses]) => (
        <section key={category} className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verses.map(verse => (
              <div key={verse.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition">
                <blockquote className="text-gray-900 mb-2 leading-relaxed">
                  "{verse.text}"
                </blockquote>
                <cite className="text-sm">
                  <Link
                    href={`/verse/${verse.slug}`}
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {verse.book} {verse.chapter}:{verse.verse}
                  </Link>
                </cite>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Copy</button>
                  <button className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Save</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Application Section */}
      <section className="mb-12 bg-green-50 rounded-xl p-8 border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How to Apply These {topic.name} Verses
        </h2>
        
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="mb-4">
            Reading Bible verses about {topic.name.toLowerCase()} is just the beginning. 
            Here are practical ways to apply these Scriptures to your daily life:
          </p>
          
          <ol className="space-y-3 mb-6">
            <li><strong>Memorization:</strong> Choose one verse that resonates with you and commit it to memory. Write it on a card and review it daily.</li>
            <li><strong>Meditation:</strong> Spend 5-10 minutes reflecting on what these verses mean for your specific situation.</li>
            <li><strong>Prayer:</strong> Use these verses as a foundation for prayer, asking God to help you embody these truths.</li>
            <li><strong>Journaling:</strong> Write about how these verses apply to challenges or decisions you're facing.</li>
            <li><strong>Sharing:</strong> Encourage others by sharing these verses with friends who might benefit from them.</li>
          </ol>
        </div>
      </section>

      {/* Tools & Resources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Resources for {topic.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href={`/tool/verse-image?topic=${topic.slug}`} className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-md transition">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Create Images</h3>
            <p className="text-sm text-gray-600">Make shareable {topic.name.toLowerCase()} verse graphics</p>
          </Link>
          
          <Link href={`/tool/flashcards?topic=${topic.slug}`} className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-md transition">
            <div className="text-4xl mb-3">🗂️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Flashcards</h3>
            <p className="text-sm text-gray-600">Memorize these verses with digital flashcards</p>
          </Link>
          
          <Link href={`/reading-plan/${topic.slug}`} className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-md transition">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reading Plan</h3>
            <p className="text-sm text-gray-600">7-day {topic.name} Bible study</p>
          </Link>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          Daily Verses on {topic.name}
        </h2>
        <p className="mb-6">
          Get a {topic.name.toLowerCase()} verse delivered to your inbox every morning.
        </p>
        <form className="max-w-md mx-auto flex gap-3">
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900"
          />
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
            Subscribe
          </button>
        </form>
      </section>

    </div>
  );
}

/**
 * Group verses by sub-category
 */
function groupVersesByCategory(verses: TopicPageData['verses']): Record<string, TopicPageData['verses']> {
  const grouped: Record<string, TopicPageData['verses']> = {};
  
  verses.forEach(verse => {
    const category = verse.category || 'All Verses';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(verse);
  });
  
  return grouped;
}
