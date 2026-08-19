'use client';
import { SparklesIcon, FlameIcon, ClockIcon } from 'lucide-react';

const POPULAR_THEMES = ['flying', 'water', 'falling', 'doors', 'space', 'lucid', 'forest', 'animals'];

interface FilterBarProps {
  sort: string;
  setSort: (s: string) => void;
  selectedTheme: string;
  setSelectedTheme: (t: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function FilterBar({
  sort,
  setSort,
  selectedTheme,
  setSelectedTheme,
  searchQuery,
  setSearchQuery,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 w-full mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Sort Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setSort('recent')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              sort === 'recent'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Recent
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              sort === 'popular'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FlameIcon className="w-4 h-4" />
            Most Loved
          </button>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search dreams, symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Theme chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-xs text-white/40 uppercase font-semibold tracking-wider mr-2 flex items-center gap-1">
          <SparklesIcon className="w-3 h-3 text-purple-400" />
          Themes:
        </span>
        <button
          onClick={() => setSelectedTheme('')}
          className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
            !selectedTheme
              ? 'bg-white text-black font-semibold'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {POPULAR_THEMES.map((theme) => (
          <button
            key={theme}
            onClick={() => setSelectedTheme(selectedTheme === theme ? '' : theme)}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors capitalize ${
              selectedTheme === theme
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            #{theme}
          </button>
        ))}
      </div>
    </div>
  );
}
