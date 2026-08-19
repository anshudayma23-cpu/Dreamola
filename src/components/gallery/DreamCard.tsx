import Link from 'next/link';
import { HeartIcon, MessageCircleIcon, UserIcon } from 'lucide-react';

export interface GalleryDream {
  id: string;
  dreamText: string;
  interpretation: string | null;
  artUrl: string | null;
  moodTags: string[];
  customTags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
  };
  _count?: {
    likes: number;
    comments: number;
  };
}

export function DreamCard({ dream }: { dream: GalleryDream }) {
  const likes = dream.likeCount ?? dream._count?.likes ?? 0;
  const comments = dream.commentCount ?? dream._count?.comments ?? 0;

  return (
    <Link
      href={`/dream/${dream.id}`}
      className="group flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.15)] transition-all duration-500"
    >
      {dream.artUrl ? (
        <div className="w-full aspect-[4/3] overflow-hidden bg-black/40 relative">
          <img
            src={dream.artUrl}
            alt="Dream illustration"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-transparent to-transparent opacity-80" />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-purple-900/30 to-indigo-950/40 flex items-center justify-center p-6 text-center">
          <span className="text-sm font-serif italic text-purple-200/60 line-clamp-3">
            "{dream.dreamText}"
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          <p className="text-white/90 font-serif text-base line-clamp-2 leading-relaxed mb-3">
            {dream.dreamText}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {dream.moodTags.slice(0, 2).map((mood) => (
              <span
                key={mood}
                className="text-[11px] bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2.5 py-0.5 rounded-full"
              >
                {mood}
              </span>
            ))}
            {dream.customTags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-white/5 text-white/60 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/40">
          <div className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
            <UserIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>@{dream.user.username}</span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1 hover:text-purple-300 transition-colors">
              <HeartIcon className="w-3.5 h-3.5 text-red-400/80" />
              {likes}
            </span>
            <span className="flex items-center gap-1 hover:text-purple-300 transition-colors">
              <MessageCircleIcon className="w-3.5 h-3.5 text-purple-400/80" />
              {comments}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
