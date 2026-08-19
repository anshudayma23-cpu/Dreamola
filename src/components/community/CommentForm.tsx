'use client';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from '../auth/LoginModal';
import { SendIcon } from 'lucide-react';

export function CommentForm({
  dreamId,
  onCommentAdded,
}: {
  dreamId: string;
  onCommentAdded: (comment: any) => void;
}) {
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!body.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/dreams/${dreamId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');

      setBody('');
      onCommentAdded(data.comment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full mt-4">
        {error && <div className="text-red-400 text-xs">{error}</div>}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Share your thoughts or interpretation..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-purple-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!body.trim() || isSubmitting}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-5 py-3 rounded-2xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center shrink-0"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </form>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
