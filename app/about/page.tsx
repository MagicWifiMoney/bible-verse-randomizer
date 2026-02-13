import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About — Bible Verse Randomizer",
  description: "Learn about Bible Verse Randomizer and how we help people discover God's Word daily.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="text-center mb-12">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-semibold mb-4 inline-block">
            ← Back to Randomizer
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            About
          </h1>
        </header>

        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-700 mb-4">
              Bible Verse Randomizer was created to help people discover and engage with God&apos;s Word 
              in a fresh, inspiring way. We believe that Scripture has the power to transform lives, 
              and sometimes the verse you need most is the one you discover unexpectedly.
            </p>
            <p className="text-slate-700 mb-4">
              Our tool makes it easy to explore the Bible by topic, discover daily verses, and share 
              meaningful Scripture with friends and family. Whether you&apos;re seeking comfort, wisdom, 
              courage, or hope, there&apos;s a verse waiting for you.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Features</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 text-xl">✓</span>
                <span>Random verse generator with beautiful design</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 text-xl">✓</span>
                <span>Filter verses by topic (Love, Faith, Hope, Strength, and more)</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 text-xl">✓</span>
                <span>Daily verse that updates every 24 hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 text-xl">✓</span>
                <span>Share verses on social media</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 text-xl">✓</span>
                <span>Download verses as beautiful images</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 text-xl">✓</span>
                <span>Save your favorite verses</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 text-xl">✓</span>
                <span>Optional daily email delivery</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">From the Makers of Sermon Clips</h2>
            <p className="text-slate-200 mb-6">
              Bible Verse Randomizer is brought to you by the team behind Sermon Clips, 
              the leading AI-powered sermon clipping tool for churches.
            </p>
            <p className="text-slate-200 mb-6">
              If you&apos;re a pastor or church leader looking to extend your message beyond Sunday, 
              check out Sermon Clips. Our AI technology makes it easy to create engaging video 
              clips from your sermons for social media.
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

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Contact</h2>
            <p className="text-slate-700 mb-4">
              Have questions or feedback? We&apos;d love to hear from you!
            </p>
            <p className="text-slate-700">
              Email us at:{' '}
              <a href="mailto:hello@bibleverserandomizer.com" className="text-amber-600 hover:text-amber-700 font-semibold">
                hello@bibleverserandomizer.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg"
          >
            Start Discovering Verses
          </Link>
        </div>
      </div>
    </div>
  );
}
