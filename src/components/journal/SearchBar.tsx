'use client';
import { SearchIcon } from 'lucide-react';

const MOODS = ['Scary', 'Calm', 'Confusing', 'Recurring', 'Lucid', 'Sad', 'Exciting'];

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedMood: string;
  setSelectedMood: (m: string) => void;
}

export function SearchBar({ searchQuery, setSearchQuery, selectedMood, setSelectedMood }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by keywords, tags, or symbols..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 transition-colors"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedMood('')}
          className={`px-4 py-1.5 rounded-full text-sm shrink-0 transition-colors ${
            !selectedMood 
              ? 'bg-purple-600 text-white' 
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          All moods
        </button>
        {MOODS.map(mood => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood)}
            className={`px-4 py-1.5 rounded-full text-sm shrink-0 transition-colors ${
              selectedMood === mood 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}
