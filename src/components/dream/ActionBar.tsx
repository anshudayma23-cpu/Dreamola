'use client';
import { BookmarkIcon, ShareIcon, RefreshCwIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { LoginModal } from '../auth/LoginModal';

export function ActionBar({ dreamText, interpretation, artUrl }: { dreamText: string, interpretation: string, artUrl: string }) {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'share' | null>(null);

  const handleSave = async (isPublic: boolean = false) => {
    if (!isAuthenticated) {
      setPendingAction(isPublic ? 'share' : 'save');
      setShowLogin(true);
      return;
    }

    // Call API to save dream (Will be built in Phase 3C)
    console.log("Saving dream:", { dreamText, interpretation, artUrl, isPublic });
    setIsSaved(true);
    if (isPublic) {
      alert("Dream shared to public gallery!");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button 
          onClick={() => handleSave(false)}
          disabled={isSaved}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <BookmarkIcon className="w-5 h-5" />
          {isSaved ? 'Saved to Journal' : 'Save to Journal'}
        </button>

        <button 
          onClick={() => handleSave(true)}
          className="flex-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <ShareIcon className="w-5 h-5" />
          Share to Gallery
        </button>

        <button 
          onClick={() => window.location.reload()}
          className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-3 rounded-xl flex items-center justify-center transition-colors"
          title="Try another dream"
        >
          <RefreshCwIcon className="w-5 h-5" />
        </button>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
