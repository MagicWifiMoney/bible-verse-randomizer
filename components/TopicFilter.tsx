import { Topic } from '@/lib/verses';

interface TopicFilterProps {
  topics: readonly Topic[];
  selectedTopic: Topic | undefined;
  onSelectTopic: (topic: Topic | undefined) => void;
}

export default function TopicFilter({ topics, selectedTopic, onSelectTopic }: TopicFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={() => onSelectTopic(undefined)}
        className={`px-4 py-2 rounded-full font-medium transition-all ${
          !selectedTopic
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
        }`}
      >
        All Topics
      </button>
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelectTopic(topic)}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedTopic === topic
              ? 'bg-amber-500 text-white shadow-lg'
              : 'bg-white text-slate-700 hover:bg-amber-50 shadow-sm'
          }`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
