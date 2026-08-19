'use client';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Trash2Icon, UserIcon } from 'lucide-react';
import Link from 'next/link';

export function CommentItem({
  comment,
  dreamOwnerId,
  onDeleted,
}: {
  comment: any;
  dreamOwnerId?: string;
  onDeleted: (id: string) => void;
}) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = user?.id && (user.id === comment.userId || user.id === dreamOwnerId);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDeleted(comment.id);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-colors hover:bg-white/[0.05]">
      <div className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center shrink-0">
        <UserIcon className="w-4 h-4 text-purple-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link
            href={`/u/${comment.user.username}`}
            className="text-xs font-semibold text-white/90 hover:text-purple-300 transition-colors"
          >
            @{comment.user.username}
          </Link>
          <span className="text-[11px] text-white/30">
            {new Date(comment.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <p className="text-sm text-white/80 leading-relaxed break-words font-light">
          {comment.body}
        </p>
      </div>

      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-white/30 hover:text-red-400 p-1 self-start transition-colors"
          title="Delete comment"
        >
          <Trash2Icon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
