/**
 * Verse Page Template
 * 
 * Renders individual Bible verse pages with:
 * - Multiple translations
 * - Context & Meaning
 * - Application & Prayer
 * - Cross-references
 * - FAQs
 * - Internal links
 * 
 * Target: 1,500+ words per page
 */

import React from 'react';
import Link from 'next/link';
import { InternalLink, LinkSection } from '@/lib/seo';

export interface VersePageData {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  slug: string;
  testament: string;
  
  // Verse text in multiple translations
  text_kjv?: string;
  text_niv?: string;
  text_esv?: string;
  text_nlt?: string;
  text_msg?: string;
  text_nasb?: string;
  
  // AI-generated content
  context?: string;
  meaning?: string;
  application?: string;
  prayer?: string;
  
  // Related data
  topics?: Array<{ id: number; name: string; slug: string }>;
  cross_references?: Array<{ book: string; chapter: number; verse: number; slug: string; text: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  
  // SEO
  popularity_score?: number;
}

export interface VersePageProps {
  verse: VersePageData;
  relatedLinks?: LinkSection[];
  popularInBook?: Array<{ book: string; chapter: number; verse: number; slug: string }>;
}

export default function VersePage({ verse, relatedLinks = [], popularInBook = [] }: VersePageProps) {
  const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
  const defaultTranslation = verse.text_niv || verse.text_kjv || verse.text_esv || '';

  return (
    <div className="verse-page max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <article className="lg:col-span-2 space-y-8">
          
          {/* Header */}
          <header>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {reference} - Meaning and Context
            </h1>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                📋 Copy
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                📤 Share
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                ⭐ Save
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                🖼️ Create Image
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                🔊 Listen
              </button>
            </div>
          </header>

          {/* Primary Verse Display */}
          <section className="verse-display bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
            <blockquote className="text-2xl leading-relaxed text-gray-900 font-serif mb-4">
              "{defaultTranslation}"
            </blockquote>
            <cite className="text-lg text-gray-700 font-semibold">
              {reference} (NIV)
            </cite>
          </section>

          {/* Translation Tabs */}
          <section className="translations">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Read in Multiple Translations
            </h2>
            <div className="translation-cards grid grid-cols-1 md:grid-cols-2 gap-4">
              {verse.text_niv && (
                <TranslationCard version="NIV" text={verse.text_niv} />
              )}
              {verse.text_kjv && (
                <TranslationCard version="KJV" text={verse.text_kjv} />
              )}
              {verse.text_esv && (
                <TranslationCard version="ESV" text={verse.text_esv} />
              )}
              {verse.text_nlt && (
                <TranslationCard version="NLT" text={verse.text_nlt} />
              )}
              {verse.text_msg && (
                <TranslationCard version="MSG" text={verse.text_msg} />
              )}
              {verse.text_nasb && (
                <TranslationCard version="NASB" text={verse.text_nasb} />
              )}
            </div>
          </section>

          {/* Context Section */}
          {verse.context && (
            <section className="context">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Context and Background
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                {verse.context.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {/* Meaning Section */}
          {verse.meaning && (
            <section className="meaning">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Does {reference} Mean?
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                {verse.meaning.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {/* Application Section */}
          {verse.application && (
            <section className="application bg-green-50 rounded-xl p-6 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How to Apply {reference} Today
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                {verse.application.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {/* Prayer Section */}
          {verse.prayer && (
            <section className="prayer bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Prayer Based on {reference}
              </h2>
              <blockquote className="text-lg italic text-gray-800 leading-relaxed">
                {verse.prayer}
              </blockquote>
            </section>
          )}

          {/* Cross References */}
          {verse.cross_references && verse.cross_references.length > 0 && (
            <section className="cross-references">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Related Verses
              </h2>
              <p className="text-gray-700 mb-4">
                These verses connect thematically or contextually with {reference}:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verse.cross_references.map((ref, i) => (
                  <Link
                    key={i}
                    href={`/verse/${ref.slug}`}
                    className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition"
                  >
                    <cite className="font-semibold text-blue-600">
                      {ref.book} {ref.chapter}:{ref.verse}
                    </cite>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {ref.text}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Topics */}
          {verse.topics && verse.topics.length > 0 && (
            <section className="topics">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Topics in {reference}
              </h2>
              <div className="flex flex-wrap gap-2">
                {verse.topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topic/${topic.slug}`}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition font-medium"
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {verse.faqs && verse.faqs.length > 0 && (
            <section className="faqs" itemScope itemType="https://schema.org/FAQPage">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {verse.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <summary className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-blue-600" itemProp="name">
                      {faq.question}
                    </summary>
                    <div
                      className="mt-3 text-gray-700 prose"
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <p itemProp="text">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Tools CTA */}
          <section className="tools-cta bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Study This Verse Further
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={`/tool/verse-image?verse=${verse.slug}`} className="text-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-1">🎨</div>
                <div className="text-sm">Create Image</div>
              </Link>
              <Link href={`/tool/flashcards?verse=${verse.slug}`} className="text-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-1">🗂️</div>
                <div className="text-sm">Flashcards</div>
              </Link>
              <Link href={`/compare/${verse.slug}`} className="text-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm">Compare</div>
              </Link>
              <Link href={`/tool/journal?verse=${verse.slug}`} className="text-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-1">📝</div>
                <div className="text-sm">Journal</div>
              </Link>
            </div>
          </section>

        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          
          {/* Popular in Book */}
          {popularInBook.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Popular in {verse.book}
              </h3>
              <ul className="space-y-2">
                {popularInBook.map((v, i) => (
                  <li key={i}>
                    <Link
                      href={`/verse/${v.slug}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {v.book} {v.chapter}:{v.verse}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Book Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              About the Book of {verse.book}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {verse.book} is a book of the {verse.testament}.
            </p>
            <Link
              href={`/book/${verse.book.toLowerCase()}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Read full overview →
            </Link>
          </div>

          {/* Related Links */}
          {relatedLinks.map((section, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.slice(0, 5).map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.url}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter CTA */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">
              Daily Verse
            </h3>
            <p className="text-sm mb-4 text-green-50">
              Get a new verse every day in your inbox.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 rounded-lg text-gray-900"
              />
              <button className="w-full bg-white text-green-600 font-semibold py-2 rounded-lg hover:bg-green-50 transition">
                Subscribe Free
              </button>
            </form>
          </div>

        </aside>

      </div>
    </div>
  );
}

/**
 * Translation Card Component
 */
function TranslationCard({ version, text }: { version: string; text: string }) {
  return (
    <div className="translation-card bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900">{version}</span>
        <button className="text-sm text-blue-600 hover:text-blue-800">Copy</button>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">
        "{text}"
      </p>
    </div>
  );
}
