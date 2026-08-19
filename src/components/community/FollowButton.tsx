'use client';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from '../auth/LoginModal';
import { UserPlusIcon, UserCheckIcon } from 'lucide-react';

export function FollowButton({
  username,
  initialIsFollowing = false,
  onFollowToggled,
}: {
  username: string;
  initialIsFollowing?: boolean;
  onFollowToggled?: (isFollowing: boolean) => void;
}) {
  const { isAuthenticated, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Do not show button for self
  if (user?.username?.toLowerCase() === username.toLowerCase()) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsFollowing(data.following);
      onFollowToggled?.(data.following);
    } catch (err) {
      console.error('Follow toggle failed:', err);
      setIsFollowing(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${
          isFollowing
            ? 'bg-white/10 hover:bg-red-500/20 text-white/80 hover:text-red-300 border border-white/10 hover:border-red-500/30'
            : 'bg-white text-black hover:bg-purple-100 hover:scale-105'
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheckIcon className="w-4 h-4 text-purple-300" />
            Following
          </>
        ) : (
          <>
            <UserPlusIcon className="w-4 h-4" />
            Follow
          </>
        )}
      </button>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
