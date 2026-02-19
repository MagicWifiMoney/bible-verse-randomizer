'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';

interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  verseCount?: number;
}

export default function EmailPopup({ isOpen, onClose, verseCount = 0 }: EmailPopupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#d97706', '#fbbf24', '#92400e', '#78350f'],
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

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      setStatus('success');
      setMessage('Welcome! Your first verse is on its way.');
      localStorage.setItem('hasSubscribed', 'true');
      triggerCelebration();

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
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
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✨</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {verseCount > 0
                  ? `You've discovered ${verseCount} verses today!`
                  : `Your Daily Verse Awaits`}
              </h2>
              <p className="text-slate-600">
                {verseCount > 0
                  ? `Don't lose your favorites — we'll send a personally curated verse to your inbox every morning.`
                  : `Start each morning with a personally curated Bible verse — delivered straight to your inbox.`}
              </p>
            </div>

            {/* Endowment framing — show what they get */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-700 font-medium mb-2">What you&apos;ll get:</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>📖 A curated verse with meaning & context</li>
                <li>🙏 A reflection prompt to start your day</li>
                <li>📊 6 translations to deepen understanding</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-all disabled:opacity-50 shadow-lg"
              >
                {status === 'loading' ? 'Joining...' : 'Get My Daily Verse →'}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Join 1,000+ readers · No spam · Unsubscribe anytime
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
