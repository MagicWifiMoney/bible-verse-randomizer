'use client';

import { useState, useEffect } from 'react';

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Check if already shown
    const alreadyShown = localStorage.getItem('exitIntentShown');
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
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
