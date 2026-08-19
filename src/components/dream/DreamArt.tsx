'use client';
import { useState } from 'react';

export function DreamArt({ artUrl }: { artUrl: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full aspect-square md:aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(138,43,226,0.2)] bg-black/50 relative flex items-center justify-center">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-purple-400/80 animate-pulse text-sm font-medium">Downloading masterpiece...</p>
        </div>
      )}
      <img 
        src={artUrl} 
        alt="AI generated dream art" 
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}
