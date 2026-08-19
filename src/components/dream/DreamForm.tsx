'use client';
import { useState } from 'react';

const MOODS = ['Scary', 'Calm', 'Confusing', 'Recurring', 'Lucid', 'Sad', 'Exciting'];

export function DreamForm({ onSubmit, isLoading }: { onSubmit: (text: string, moods: string[], custom: string[]) => void, isLoading: boolean }) {
  const [text, setText] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      if (!customTags.includes(customTagInput.trim())) {
        setCustomTags([...customTags, customTagInput.trim()]);
      }
      setCustomTagInput('');
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I was flying over a city made of glass..."
        className="w-full h-40 bg-transparent text-xl md:text-2xl outline-none placeholder-white/30 resize-none font-serif"
        disabled={isLoading}
      />
      
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-sm text-white/50 mb-3">How did it feel?</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {MOODS.map(mood => (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                selectedMoods.includes(mood) 
                  ? 'bg-purple-500/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border-purple-400' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border-transparent'
              } border`}
              type="button"
            >
              {mood}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {customTags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 flex items-center gap-2">
              #{tag}
              <button onClick={() => setCustomTags(tags => tags.filter(t => t !== tag))} className="hover:text-white">✕</button>
            </span>
          ))}
          <input
            type="text"
            placeholder="+ Add custom tag (press Enter)"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={handleAddCustomTag}
            className="bg-transparent text-sm text-white outline-none placeholder-white/30 ml-2 w-48"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onSubmit(text, selectedMoods, customTags)}
          disabled={text.length < 10 || isLoading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(138,43,226,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Interpreting...' : 'Reveal Meaning'}
        </button>
      </div>
    </div>
  );
}
