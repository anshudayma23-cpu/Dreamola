'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  Trash2, 
  Download, 
  CreditCard, 
  Loader2, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export default function AccountPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [hasSub, setHasSub] = useState(false);

  // Status/Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentPlan = session?.user?.plan || 'free';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dream?auth=login&redirect=/account');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');

      const u = data.user;
      setUsername(u.username);
      setEmail(u.email);
      setDisplayName(u.displayName || '');
      setBio(u.bio || '');
      setHasSub(!!u.razorpaySubscriptionId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose unlimited database storage and PDF recaps immediately.')) {
      return;
    }

    setIsCancelling(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');

      setSuccessMsg('Subscription cancelled successfully.');
      setHasSub(false);
      await updateSession(); // Refresh NextAuth Session JWT token cache
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel subscription.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExportData = async () => {
    if (currentPlan === 'free') {
      alert('Subconscious database history is a premium feature. Free users do not have saved records to export.');
      return;
    }

    setExportLoading(true);
    try {
      const res = await fetch('/api/dreams');
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to retrieve dream history');

      const blob = new Blob([JSON.stringify(data.dreams, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dreamola_Export_${username}.json`;
      a.click();
    } catch (err: any) {
      alert(err.message || 'Failed to export history.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ CRITICAL WARNING: Deleting your account is completely permanent. This will irreversibly destroy your profile, followers list, and all recorded dream history in the database. Proceed?')) {
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      alert('Account deleted successfully. We are logging you out.');
      signOut({ callbackUrl: '/' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#09090e] text-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
        <p className="text-sm text-purple-300/80 animate-pulse font-medium">Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090e] text-white p-4 md:p-8 flex justify-center relative overflow-hidden">
      <div className="w-full max-w-4xl flex flex-col gap-8 pb-32 mt-12 z-10">
        
        {/* Page Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl md:text-4xl font-serif text-purple-200 mb-1 flex items-center gap-2">
            <Settings className="w-8 h-8 text-purple-400" />
            Account Settings
          </h1>
          <p className="text-sm text-white/50">Manage your credentials, subscriptions, and data exports.</p>
        </div>

        {successMsg && (
          <div className="text-emerald-400 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-sm flex items-center gap-2">
            <Check className="w-5 h-5 shrink-0" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="text-red-400 p-4 bg-red-950/20 border border-red-500/30 rounded-2xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Edit Profile Form */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <form onSubmit={handleUpdateProfile} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/5 pb-3">
                <User className="w-5 h-5 text-purple-400" /> Edit Profile Details
              </h3>

              {/* Username & Email (Disabled) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Username</label>
                  <input
                    type="text"
                    disabled
                    value={`@${username}`}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/40 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={email}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/40 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Display Name</label>
                <input
                  type="text"
                  placeholder="Enter display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">About / Bio</label>
                <textarea
                  rows={4}
                  placeholder="Write a brief bio about your dream journey..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl p-4 text-sm focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-2xl text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Column 3: Subscription & Actions */}
          <div className="md:col-span-1 flex flex-col gap-6">
            
            {/* Subscription Box */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                  <CreditCard className="w-5 h-5 text-purple-400" /> Subscription Plan
                </h3>

                <div className="flex items-center gap-2.5 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${
                    currentPlan === 'premium'
                      ? 'text-amber-300 bg-amber-950/30 border-amber-500/20'
                      : currentPlan === 'mid'
                      ? 'text-purple-300 bg-purple-950/30 border-purple-500/20'
                      : 'text-white/40 bg-white/5 border-white/5'
                  }`}>
                    {currentPlan === 'premium' ? 'Oracle' : currentPlan === 'mid' ? 'Lucid' : 'Dreamer'}
                  </span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed mb-6">
                  {currentPlan === 'free'
                    ? 'Upgrade to unlock private storage, PDF metrics recaps, and unlock subconscious visualizers.'
                    : 'Thank you for supporting Dreamola development! You have active access to the journal vault.'}
                </p>
              </div>

              {hasSub ? (
                <button
                  disabled={isCancelling}
                  onClick={handleCancelSubscription}
                  className="w-full border border-red-500/20 hover:border-red-500/30 hover:bg-red-500/10 text-red-400 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancel Subscription
                </button>
              ) : currentPlan === 'free' ? (
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl text-xs font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer"
                >
                  Upgrade Account
                </button>
              ) : (
                <div className="text-[10px] text-white/30 text-center italic">
                  Lifetime/Admin Account
                </div>
              )}
            </div>

            {/* Data Export Box */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <Download className="w-5 h-5 text-purple-400" /> Export Data
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Download a complete JSON database dump of all your recorded dreams and interpretations.
              </p>

              <button
                onClick={handleExportData}
                disabled={exportLoading || currentPlan === 'free'}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {exportLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Export Subconscious JSON
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-950/10 border border-red-500/20 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2 border-b border-red-500/10 pb-3 mb-4">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-xs text-red-200/50 leading-relaxed mb-6">
                Delete your account and all associated dreams permanently. This cannot be undone.
              </p>

              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full bg-red-950/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white py-3 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Account Permanently
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
