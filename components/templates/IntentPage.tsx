/**
 * Intent Page Template
 * For occasion/situation-based pages (weddings, funerals, tattoos, etc.)
 * Target: 1,800+ words
 */

import React from 'react';
import Link from 'next/link';

export interface IntentPageData {
  id: number;
  name: string;
  slug: string;
  category: string;
  verses: Array<{
    id: number;
    book: string;
    chapter: number;
    verse: number;
    slug: string;
    text: string;
    usage_note?: string;
  }>;
}

export default function IntentPage({ intent }: { intent: IntentPageData }) {
  return (
    <div className="intent-page max-w-4xl mx-auto px-4 py-8">
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bible Verses for {intent.name}
        </h1>
        <p className="text-xl text-gray-700">
          Find the perfect Bible verses for {intent.name.toLowerCase()}. 
          Discover {intent.verses.length}+ meaningful Scripture passages.
        </p>
      </header>

      {/* Featured Verse */}
      <section className="mb-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          A Verse for {intent.name}
        </h2>
        {intent.verses[0] && (
          <>
            <blockquote className="text-2xl text-gray-900 font-serif leading-relaxed mb-3">
              "{intent.verses[0].text}"
            </blockquote>
            <cite className="text-lg font-semibold text-gray-800">
              <Link href={`/verse/${intent.verses[0].slug}`} className="text-purple-600 hover:underline">
                {intent.verses[0].book} {intent.verses[0].chapter}:{intent.verses[0].verse}
              </Link>
            </cite>
          </>
        )}
      </section>

      {/* Main Verse List */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {intent.verses.length} Verses for {intent.name}
        </h2>
        
        <div className="space-y-6">
          {intent.verses.map(verse => (
            <div key={verse.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
              <blockquote className="text-lg text-gray-900 mb-3 leading-relaxed">
                "{verse.text}"
              </blockquote>
              <cite className="font-semibold">
                <Link href={`/verse/${verse.slug}`} className="text-blue-600 hover:underline">
                  {verse.book} {verse.chapter}:{verse.verse}
                </Link>
              </cite>
              {verse.usage_note && (
                <p className="mt-3 text-sm text-gray-600 italic">
                  💡 {verse.usage_note}
                </p>
              )}
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Copy
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Use */}
      <section className="mb-12 bg-green-50 rounded-xl p-8 border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How to Use These Verses for {intent.name}
        </h2>
        <div className="prose max-w-none text-gray-700">
          <ol className="space-y-3">
            <li>Choose verses that resonate most with your specific situation</li>
            <li>Consider the context and meaning before using them</li>
            <li>Personalize by adding your own reflections or prayers</li>
            <li>Share thoughtfully, keeping the recipient in mind</li>
          </ol>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Get More Inspiration</h2>
        <p className="mb-6">Receive daily Bible verses and encouragement.</p>
        <form className="max-w-md mx-auto flex gap-3">
          <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900" />
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg">Subscribe</button>
        </form>
      </section>

    </div>
  );
}
