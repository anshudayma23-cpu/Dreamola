import { UserIcon, CalendarIcon, BookOpenIcon, UsersIcon } from 'lucide-react';
import { FollowButton } from './FollowButton';

export interface ProfileUser {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  publicDreamCount: number;
  isFollowing: boolean;
}

export function UserProfileCard({
  user,
  onFollowToggled,
}: {
  user: ProfileUser;
  onFollowToggled?: (isFollowing: boolean) => void;
}) {
  return (
    <div className="bg-gradient-to-b from-purple-900/20 to-white/5 border border-purple-500/20 rounded-3xl p-8 md:p-10 backdrop-blur-md shadow-[0_0_40px_rgba(138,43,226,0.1)] mb-12">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-purple-900/40 border-2 border-purple-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <UserIcon className="w-12 h-12 text-purple-200" />
          </div>

          <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-1">
              {user.displayName || `@${user.username}`}
            </h1>
            <p className="text-purple-300/80 text-sm mb-3">@{user.username}</p>

            {user.bio && (
              <p className="text-white/80 text-sm max-w-lg font-light leading-relaxed mb-4">
                {user.bio}
              </p>
            )}

            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-white/40">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-6">
          <FollowButton
            username={user.username}
            initialIsFollowing={user.isFollowing}
            onFollowToggled={onFollowToggled}
          />

          <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
            <div>
              <span className="block text-xl font-bold text-white font-serif">{user.publicDreamCount}</span>
              <span className="text-[11px] text-white/40 uppercase tracking-wider">Dreams</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="block text-xl font-bold text-white font-serif">{user.followerCount}</span>
              <span className="text-[11px] text-white/40 uppercase tracking-wider">Followers</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="block text-xl font-bold text-white font-serif">{user.followingCount}</span>
              <span className="text-[11px] text-white/40 uppercase tracking-wider">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
