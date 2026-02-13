import { Verse } from '@/lib/verses';

interface VerseDisplayProps {
  verse: Verse | null;
  isTransitioning: boolean;
}

export default function VerseDisplay({ verse, isTransitioning }: VerseDisplayProps) {
  if (!verse) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading verse...</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-xl p-8 md:p-12 border-l-4 border-amber-500 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <div className="space-y-6">
        <p className="text-2xl md:text-3xl font-serif leading-relaxed text-slate-800 italic">
          &ldquo;{verse.text}&rdquo;
        </p>
        <div className="flex justify-end">
          <p className="text-xl font-semibold text-slate-900">
            — {verse.reference}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          {verse.topics.map((topic) => (
            <span
              key={topic}
              className="px-3 py-1 bg-white rounded-full text-sm font-medium text-amber-700 shadow-sm"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
