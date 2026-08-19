import { Play as PlayIcon } from 'lucide-react';

export function VideoBadge() {
  return (
    <div 
      className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-xl cursor-not-allowed group relative"
    >
      <PlayIcon className="w-4 h-4 text-purple-400" />
      <span className="text-sm font-medium text-white/80">Generate Video</span>
      
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-semibold">
        Coming Soon!
      </div>
    </div>
  );
}
