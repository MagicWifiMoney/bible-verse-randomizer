'use client';

import { useState, useEffect, useRef } from 'react';
import { getRandomVerse, getDailyVerse, topics, type Topic, type Verse } from '@/lib/verses';
import VerseDisplay from '@/components/VerseDisplay';
import TopicFilter from '@/components/TopicFilter';
import EmailPopup from '@/components/EmailPopup';
import SermonClipsCTA from '@/components/SermonClipsCTA';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import ActionButtons from '@/components/ActionButtons';

export default function Home() {
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [verseCount, setVerseCount] = useState(0);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showSermonCTA, setShowSermonCTA] = useState(false);
  const [favorites, setFavorites] = useState<Verse[]>([]);
  const [history, setHistory] = useState<Verse[]>([]);
  const verseDisplayRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    const savedHistory = localStorage.getItem('history');
    const savedVerseCount = localStorage.getItem('verseCount');
    const hasSubscribed = localStorage.getItem('hasSubscribed');

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedVerseCount) setVerseCount(parseInt(savedVerseCount));

    // Show email popup after 3rd verse view (if not subscribed)
    if (!hasSubscribed && savedVerseCount && parseInt(savedVerseCount) >= 2) {
      setTimeout(() => setShowEmailPopup(true), 2000);
    }

    // Load daily verse initially
    setCurrentVerse(getDailyVerse());
  }, []);

  const generateNewVerse = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      const newVerse = getRandomVerse(selectedTopic);
      setCurrentVerse(newVerse);
      
      // Update history
      const newHistory = [newVerse, ...history.slice(0, 19)];
      setHistory(newHistory);
      localStorage.setItem('history', JSON.stringify(newHistory));
      
      // Update verse count
      const newCount = verseCount + 1;
      setVerseCount(newCount);
      localStorage.setItem('verseCount', newCount.toString());
      
      // Show email popup after 3rd verse
      if (newCount === 3 && !localStorage.getItem('hasSubscribed')) {
        setTimeout(() => setShowEmailPopup(true), 2000);
      }
      
      // Show sermon CTA after every 5th verse
      if (newCount % 5 === 0) {
        setTimeout(() => setShowSermonCTA(true), 3000);
      }
      
      setIsTransitioning(false);
    }, 300);
  };

  const toggleFavorite = () => {
    if (!currentVerse) return;
    
    const isFavorited = favorites.some(f => f.reference === currentVerse.reference);
    
    if (isFavorited) {
      const newFavorites = favorites.filter(f => f.reference !== currentVerse.reference);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      const newFavorites = [currentVerse, ...favorites];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  };

  const isFavorited = currentVerse ? favorites.some(f => f.reference === currentVerse.reference) : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Bible Verse Randomizer
          </h1>
          <p className="text-xl text-slate-600">
            Discover God&apos;s Word Daily
          </p>
        </header>

        <div className="mb-8">
          <TopicFilter
            topics={topics}
            selectedTopic={selectedTopic}
            onSelectTopic={(topic) => {
              setSelectedTopic(topic);
              // Generate new verse when topic changes
              setTimeout(() => generateNewVerse(), 100);
            }}
          />
        </div>

        <div ref={verseDisplayRef}>
          <VerseDisplay
            verse={currentVerse}
            isTransitioning={isTransitioning}
          />
        </div>

        {currentVerse && (
          <ActionButtons
            verse={currentVerse}
            isFavorited={isFavorited}
            onToggleFavorite={toggleFavorite}
            onGenerateNew={generateNewVerse}
            verseDisplayRef={verseDisplayRef}
          />
        )}

        {showSermonCTA && (
          <SermonClipsCTA onClose={() => setShowSermonCTA(false)} />
        )}

        <footer className="mt-16 text-center text-slate-600 border-t border-slate-200 pt-8">
          <p className="mb-2">
            <strong>From the makers of Sermon Clips</strong>
          </p>
          <p className="text-sm mb-4">
            AI-powered sermon clipping for churches
          </p>
          <a
            href="https://sermon-clips.com"
            className="text-amber-600 hover:text-amber-700 font-semibold"
          >
            Try Sermon Clips →
          </a>
        </footer>
      </div>

      <EmailPopup
        isOpen={showEmailPopup}
        onClose={() => {
          setShowEmailPopup(false);
          localStorage.setItem('emailPopupDismissed', 'true');
        }}
      />

      <ExitIntentPopup />
    </div>
  );
}
