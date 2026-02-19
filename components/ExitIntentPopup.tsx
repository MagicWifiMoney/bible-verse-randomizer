'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Determine if user is already subscribed
  const isSubscribed = typeof window !== 'undefined' && localStorage.getItem('hasSubscribed') === 'true';

  useEffect(() => {
    // Check if already shown this session
    const alreadyShown = localStorage.getItem('exitIntentShown');
    if (alreadyShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    // 5-second grace period to avoid false triggers
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#d97706', '#fbbf24', '#92400e'],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed');

      setStatus('success');
      setMessage('Welcome! Your first verse is on its way. 🎉');
      localStorage.setItem('hasSubscribed', 'true');
      triggerCelebration();

      setTimeout(() => setIsOpen(false), 3000);
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (!isOpen) return null;

  // Stage 2: Already subscribed — cross-promote Sermon Clips
  if (isSubscribed) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-300">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>

          <div className="text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Before You Go...
            </h2>
            <p className="text-xl text-slate-700 mb-6">
              Your church&apos;s sermons deserve to reach beyond Sunday
            </p>
            <p className="text-slate-600 mb-8">
              Turn powerful sermon moments into viral video clips with AI-powered editing.
              Perfect for churches looking to extend their message to social media.
            </p>

            <a
              href="https://sermon-clips.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-800 transition-all shadow-xl mb-4"
            >
              Try Sermon Clips Free →
            </a>

            <p className="text-sm text-slate-500">
              From the makers of Bible Verse Randomizer
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Stage 1: Not subscribed — capture email first
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
        >
          ×
        </button>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-green-600 font-semibold text-lg">{message}</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Don&apos;t Miss Tomorrow&apos;s Verse
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              You&apos;re leaving without saving your progress. Get a curated verse delivered every morning — free forever.
            </p>

            {/* Value bullets */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <ul className="text-sm text-slate-700 space-y-2">
                <li>✨ Daily verse with meaning & context</li>
                <li>📊 All 6 translations included</li>
                <li>🙏 Reflection prompts for deeper study</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              {status === 'error' && (
                <p className="text-red-600 text-sm">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-all disabled:opacity-50 shadow-lg text-lg"
              >
                {status === 'loading' ? 'Joining...' : 'Save My Progress & Get Daily Verses →'}
              </button>

              <p className="text-xs text-slate-500">
                Join 1,000+ readers · No spam · Unsubscribe anytime
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
