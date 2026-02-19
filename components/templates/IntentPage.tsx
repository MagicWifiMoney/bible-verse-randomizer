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
        {/* TL;DR — LLM-optimized summary for AI citation */}
        <p className="text-lg text-gray-700 leading-relaxed font-medium">
          <strong>The best Bible verses for {intent.name.toLowerCase()}</strong> include passages about God's love, strength, and guidance.
          This page features {intent.verses.length}+ carefully curated Scripture passages for {intent.name.toLowerCase()}, each selected for its relevance and depth.
          Read, save, and share the perfect verse for your situation.
        </p>
      </header>

      {/* Featured Verse */}
      <section className="mb-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What is the best Bible verse for {intent.name.toLowerCase()}?
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
          What are the top {intent.verses.length} Bible verses for {intent.name.toLowerCase()}?
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
                  Copy My Verse
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                  Save My Verse
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why These Verses Matter — Editorial depth */}
      <section className="mb-12 bg-blue-50 rounded-xl p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Why do Bible verses for {intent.name.toLowerCase()} matter?
        </h2>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            Scripture has been a source of comfort, wisdom, and guidance for people navigating {intent.name.toLowerCase()} throughout history.
            The {intent.verses.length} verses curated on this page were chosen because they speak directly to the spiritual and emotional needs
            that arise in the context of {intent.name.toLowerCase()}.
          </p>
          <p className="mb-4">
            Whether you&apos;re looking for words of encouragement, a passage to share with someone you care about, or a verse to meditate on during
            a challenging season, these Scriptures offer timeless truth. Each verse links to a detailed study page with context, meaning,
            application, and the text in 6 different translations.
          </p>
        </div>
      </section>

      {/* How to Use */}
      <section className="mb-12 bg-green-50 rounded-xl p-8 border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How should I use Bible verses for {intent.name.toLowerCase()}?
        </h2>
        <div className="prose max-w-none text-gray-700">
          <ol className="space-y-3">
            <li><strong>Read in context:</strong> Click through to the verse detail page to understand the full passage and its original context before the book, chapter and audience.</li>
            <li><strong>Compare translations:</strong> Each verse is available in 6 translations — try reading a verse in the NIV for clarity and the KJV for its poetic weight.</li>
            <li><strong>Personalize your reflection:</strong> Use the application and prayer guides on each verse page to connect the Scripture to your specific situation.</li>
            <li><strong>Share thoughtfully:</strong> Copy your favorite verse and consider the recipient&apos;s emotional state when sharing. A well-chosen verse at the right moment carries extraordinary power.</li>
          </ol>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Get Your Daily Inspiration</h2>
        <p className="mb-6">Receive a personally curated verse every morning — no spam, unsubscribe anytime.</p>
        <form className="max-w-md mx-auto flex gap-3">
          <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900" />
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg">Get My Daily Verse →</button>
        </form>
      </section>

    </div>
  );
}
