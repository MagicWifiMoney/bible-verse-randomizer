'use client';

import { useState } from 'react';
import { Verse } from '@/lib/verses';
import { toPng } from 'html-to-image';

interface ActionButtonsProps {
  verse: Verse;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onGenerateNew: () => void;
  verseDisplayRef: React.RefObject<HTMLDivElement | null>;
}

export default function ActionButtons({
  verse,
  isFavorited,
  onToggleFavorite,
  onGenerateNew,
  verseDisplayRef,
}: ActionButtonsProps) {
  const [copying, setCopying] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleCopy = async () => {
    const text = `"${verse.text}" — ${verse.reference}`;
    await navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleShare = (platform: 'twitter' | 'facebook') => {
    const text = `"${verse.text}" — ${verse.reference}`;
    const url = 'https://bibleverserandomizer.com';
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleDownloadImage = async () => {
    if (!verseDisplayRef.current) return;
    
    setGenerating(true);
    try {
      const dataUrl = await toPng(verseDisplayRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${verse.reference.replace(/\s/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
    setGenerating(false);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onGenerateNew}
          className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Generate New Verse
        </button>

        <button
          onClick={onToggleFavorite}
          className={`px-6 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg ${
            isFavorited
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {isFavorited ? '❤️ Favorited' : '🤍 Favorite'}
        </button>

        <button
          onClick={handleCopy}
          className="px-6 py-3 bg-white text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-all shadow-md hover:shadow-lg"
        >
          {copying ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => handleShare('twitter')}
          className="px-6 py-2 bg-sky-500 text-white rounded-full font-medium hover:bg-sky-600 transition-all shadow-md"
        >
          Share on Twitter
        </button>

        <button
          onClick={() => handleShare('facebook')}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all shadow-md"
        >
          Share on Facebook
        </button>

        <button
          onClick={handleDownloadImage}
          disabled={generating}
          className="px-6 py-2 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-md disabled:opacity-50"
        >
          {generating ? 'Generating...' : '📸 Download Image'}
        </button>
      </div>
    </div>
  );
}
