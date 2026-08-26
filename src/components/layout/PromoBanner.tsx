'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '../../hooks/useAuth';
import { Zap, Sparkles, Check } from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';

const PROMO_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PromoBanner() {
  const { isAuthenticated, user } = useAuth();
  const { update: updateSession } = useSession();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get or set the 7-day launch promo target end timestamp
    let targetTime = localStorage.getItem('dreamola_promo_target_end');
    if (!targetTime) {
      const newTarget = Date.now() + PROMO_DURATION_MS;
      localStorage.setItem('dreamola_promo_target_end', newTarget.toString());
      targetTime = newTarget.toString();
    }

    const targetEnd = parseInt(targetTime, 10);

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetEnd - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (user?.plan === 'mid' || user?.plan === 'premium') {
      setClaimStatus('Lucid Plan Active!');
      setTimeout(() => setClaimStatus(null), 3000);
      return;
    }

    setIsClaiming(true);
    try {
      const res = await fetch('/api/account/claim-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimStatus('Claimed 1 Month Free!');
        await updateSession();
      } else {
        setClaimStatus(data.message || data.error || 'Failed to claim');
      }
    } catch (err) {
      console.error(err);
      setClaimStatus('Failed to claim');
    } finally {
      setIsClaiming(false);
      setTimeout(() => setClaimStatus(null), 4000);
    }
  };

  if (isExpired || !timeLeft) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <>
      <div className="w-full flex justify-center pt-20 pb-0 px-4 pointer-events-auto z-40 relative">
        <div className="w-full max-w-[1020px] bg-[#181445]/95 backdrop-blur-xl border border-amber-400/30 text-white rounded-full shadow-[0_8px_32px_rgba(245,158,11,0.15)] px-3.5 sm:px-6 py-2 flex items-center justify-between gap-2 transition-all">
          
          {/* Left Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-sans font-bold text-xs sm:text-sm text-white shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
            <span className="whitespace-nowrap">1 Month FREE Lucid Plan</span>
          </div>

          {/* Center Timer */}
          <div className="font-mono text-xs sm:text-sm font-bold text-amber-400 tracking-wider whitespace-nowrap">
            <span>{pad(timeLeft.days)}d</span>
            <span className="mx-0.5 sm:mx-1 text-amber-400/70">:</span>
            <span>{pad(timeLeft.hours)}h</span>
            <span className="mx-0.5 sm:mx-1 text-amber-400/70">:</span>
            <span>{pad(timeLeft.minutes)}m</span>
            <span className="mx-0.5 sm:mx-1 text-amber-400/70">:</span>
            <span>{pad(timeLeft.seconds)}s</span>
          </div>

          {/* Right Action */}
          <div className="shrink-0">
            {claimStatus ? (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 text-amber-400" />
                {claimStatus}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming}
                className="bg-gradient-to-r from-[#630ed4] to-[#a855f7] hover:opacity-95 text-white font-sans text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <span>{isClaiming ? 'Claiming...' : 'Claim →'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
