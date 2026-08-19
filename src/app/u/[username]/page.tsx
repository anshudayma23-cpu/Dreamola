'use client';
import { useEffect, useState } from 'react';
import { UserProfileCard, ProfileUser } from '../../../components/community/UserProfileCard';
import { GalleryGrid } from '../../../components/gallery/GalleryGrid';
import { GalleryDream } from '../../../components/gallery/DreamCard';
import { SparklesIcon } from 'lucide-react';

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [dreams, setDreams] = useState<GalleryDream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${params.username}`).then((res) => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      }),
      fetch(`/api/users/${params.username}/dreams`).then((res) => res.json()),
    ])
      .then(([userData, dreamData]) => {
        setUser(userData.user);
        setDreams(dreamData.dreams || []);
      })
      .catch((err) => {
        console.error(err);
        setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [params.username]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#09090e] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-serif text-white mb-2">User Not Found</h1>
        <p className="text-white/50 text-sm">The dreamer you are looking for does not exist.</p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#09090e] text-white flex items-center justify-center">
        <div className="text-xl text-white/50 animate-pulse font-serif">Connecting to profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090e] text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col pb-32 mt-8">
        <UserProfileCard
          user={user}
          onFollowToggled={(isFollowing) => {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    isFollowing,
                    followerCount: isFollowing ? prev.followerCount + 1 : prev.followerCount - 1,
                  }
                : null
            );
          }}
        />

        <div>
          <div className="flex items-center gap-2 mb-6">
            <SparklesIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-serif font-bold text-white">
              Public Dreams by @{user.username}
            </h2>
          </div>

          <GalleryGrid dreams={dreams} isLoading={false} />
        </div>
      </div>
    </div>
  );
}
