'use client';

interface SermonClipsCTAProps {
  onClose: () => void;
}

export default function SermonClipsCTA({ onClose }: SermonClipsCTAProps) {
  return (
    <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white opacity-50 hover:opacity-100 text-xl"
      >
        ×
      </button>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-3">
            Turn Bible Verses into Stunning Video Clips
          </h3>
          <p className="text-slate-300 mb-4">
            Your church&apos;s sermons deserve to reach beyond Sunday. Create engaging video clips with AI-powered editing.
          </p>
          <a
            href="https://sermon-clips.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-all shadow-lg"
          >
            Try Sermon Clips Free →
          </a>
        </div>
        <div className="text-6xl">
          🎬
        </div>
      </div>
    </div>
  );
}
