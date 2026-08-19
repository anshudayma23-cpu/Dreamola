import { Image as ImageIcon } from 'lucide-react';

export function ArtGenerator({ onGenerate, isLoading }: { onGenerate: () => void, isLoading: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          Visualize this dream
        </h3>
        <p className="text-sm text-white/50">Generate a unique AI illustration based on your dream's imagery.</p>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="shrink-0 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 border border-white/10"
      >
        {isLoading ? 'Generating...' : 'Generate Art'}
      </button>
    </div>
  );
}
