'use client';
import Link from 'next/link';
import { CalendarIcon } from 'lucide-react';

interface Dream {
  id: string;
  dreamText: string;
  interpretation: string | null;
  artUrl: string | null;
  moodTags: string[];
  customTags: string[];
  isPublic: boolean;
  createdAt: string;
}

export function DreamList({ dreams }: { dreams: Dream[] }) {
  if (dreams.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl p-8">
        <p className="text-xl text-white/60 mb-6 font-serif">Your journal is empty.</p>
        <Link 
          href="/dream" 
          className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity"
        >
          Write your first dream
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dreams.map(dream => (
        <Link 
          href={`/journal/${dream.id}`} 
          key={dream.id}
          className="group block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(138,43,226,0.05)]"
        >
          {dream.artUrl && (
            <div className="w-full aspect-video overflow-hidden border-b border-white/10">
              <img 
                src={dream.artUrl} 
                alt="AI Generated Art" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-6 flex flex-col justify-between h-[220px]">
            <div>
              <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                <CalendarIcon className="w-3.5 h-3.5" />
                {new Date(dream.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </div>
              <p className="text-white/80 line-clamp-3 mb-4 font-serif text-lg leading-relaxed">
                {dream.dreamText}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {dream.moodTags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
              {dream.customTags.slice(0, 1).map(tag => (
                <span key={tag} className="text-xs bg-white/5 text-white/60 px-2.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
