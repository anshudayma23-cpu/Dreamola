'use client';
import { useState, useEffect } from 'react';
import { HeartIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from '../auth/LoginModal';

export function LikeButton({
  dreamId,
  initialCount = 0,
}: {
  dreamId: string;
  initialCount?: number;
}) {
  const { isAuthenticated } = useAuth();
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    fetch(`/api/dreams/${dreamId}/like`)
      .then((res) => res.json())
      .then((data) => {
        if (data.likeCount !== undefined) setLikeCount(data.likeCount);
        if (data.isLiked !== undefined) setIsLiked(data.isLiked);
      })
      .catch((err) => console.error(err));
  }, [dreamId, isAuthenticated]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (isPending) return;
    setIsPending(true);

    // Optimistic UI update
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const res = await fetch(`/api/dreams/${dreamId}/like`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsLiked(data.liked);
    } catch (err) {
      console.error(err);
      // Rollback on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
          isLiked
            ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
        }`}
      >
        <HeartIcon
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isLiked ? 'fill-red-400 text-red-400' : ''
          }`}
        />
        <span>{likeCount}</span>
      </button>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
