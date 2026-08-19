'use client';
import { useState, useEffect } from 'react';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { MessageCircleIcon } from 'lucide-react';

export function CommentThread({
  dreamId,
  dreamOwnerId,
}: {
  dreamId: string;
  dreamOwnerId?: string;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dreams/${dreamId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data.comments || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [dreamId]);

  const handleCommentAdded = (newComment: any) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleCommentDeleted = (deletedId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== deletedId));
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircleIcon className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-serif font-bold text-white">
          Community Reflections ({comments.length})
        </h3>
      </div>

      <CommentForm dreamId={dreamId} onCommentAdded={handleCommentAdded} />

      <div className="mt-8 space-y-3">
        {isLoading ? (
          <div className="text-center py-6 text-white/40 text-xs animate-pulse">
            Loading reflections...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm italic font-serif">
            No reflections yet. Share the first thought!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              dreamOwnerId={dreamOwnerId}
              onDeleted={handleCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}
