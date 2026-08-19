import { DreamCard, GalleryDream } from './DreamCard';
import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';

export function GalleryGrid({
  dreams,
  isLoading,
}: {
  dreams: GalleryDream[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="bg-white/5 border border-white/10 rounded-3xl h-80 flex flex-col justify-between p-6"
          >
            <div className="w-full h-40 bg-white/5 rounded-2xl mb-4" />
            <div className="w-3/4 h-4 bg-white/5 rounded" />
            <div className="w-1/2 h-3 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (dreams.length === 0) {
    return (
      <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="w-8 h-8 text-purple-300" />
        </div>
        <h3 className="text-2xl font-serif text-white mb-2">No public dreams found</h3>
        <p className="text-white/60 mb-6 text-sm">
          Be the first to explore the subconscious realm and share your vision with the community!
        </p>
        <Link
          href="/dream"
          className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium px-8 py-3 rounded-full shadow-[0_0_25px_rgba(138,43,226,0.3)] transition-all"
        >
          Share a Dream
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {dreams.map((dream) => (
        <DreamCard key={dream.id} dream={dream} />
      ))}
    </div>
  );
}
