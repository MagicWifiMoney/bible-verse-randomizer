/**
 * Book Overview Template
 * For Bible book overview pages
 * Target: 2,000+ words
 */

import React from 'react';
import Link from 'next/link';

export interface BookPageData {
  name: string;
  slug: string;
  testament: string;
  chapterCount: number;
  verseCount: number;
  author?: string;
  dateWritten?: string;
  summary: string;
  themes: Array<{ name: string; description: string }>;
  keyVerses: Array<{
    chapter: number;
    verse: number;
    slug: string;
    text: string;
  }>;
}

export default function BookOverviewPage({ book }: { book: BookPageData }) {
  return (
    <div className="book-page max-w-5xl mx-auto px-4 py-8">
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          The Book of {book.name}
        </h1>
        <p className="text-xl text-gray-600">
          {book.testament} • {book.chapterCount} Chapters • {book.verseCount} Verses
        </p>
      </header>

      {/* Quick Facts */}
      <section className="mb-12 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Facts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Testament</div>
            <div className="text-lg font-semibold text-gray-900">{book.testament}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Chapters</div>
            <div className="text-lg font-semibold text-gray-900">{book.chapterCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Verses</div>
            <div className="text-lg font-semibold text-gray-900">{book.verseCount}</div>
          </div>
          {book.author && (
            <div>
              <div className="text-sm text-gray-600">Author</div>
              <div className="text-lg font-semibold text-gray-900">{book.author}</div>
            </div>
          )}
        </div>
      </section>

      {/* Summary */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Summary</h2>
        <div className="prose prose-lg max-w-none text-gray-700">
          {book.summary.split('\n\n').map((para, i) => (
            <p key={i} className="mb-4">{para}</p>
          ))}
        </div>
      </section>

      {/* Key Themes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Main Themes</h2>
        <div className="space-y-4">
          {book.themes.map((theme, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{theme.name}</h3>
              <p className="text-gray-700">{theme.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Verses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Verses in {book.name}</h2>
        <div className="space-y-4">
          {book.keyVerses.map(verse => (
            <div key={verse.slug} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <blockquote className="text-lg text-gray-900 mb-3">"{verse.text}"</blockquote>
              <cite className="font-semibold">
                <Link href={`/verse/${verse.slug}`} className="text-purple-600 hover:underline">
                  {book.name} {verse.chapter}:{verse.verse}
                </Link>
              </cite>
            </div>
          ))}
        </div>
      </section>

      {/* Chapter List */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Chapters in {book.name}</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {Array.from({ length: book.chapterCount }, (_, i) => i + 1).map(ch => (
            <Link
              key={ch}
              href={`/book/${book.slug}/chapter/${ch}`}
              className="block text-center py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition font-semibold text-gray-900"
            >
              {ch}
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
