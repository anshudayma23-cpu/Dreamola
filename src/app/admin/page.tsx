'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { 
  Users, 
  Sparkles, 
  Image as ImageIcon, 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Check, 
  Trash2, 
  Eye, 
  Crown, 
  Shield, 
  Activity, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalDreams: number;
  totalArtworks: number;
  pendingReports: number;
  dailyActiveUsers?: number;
  monthlyActiveUsers?: number;
  planBreakdown: {
    free: number;
    mid: number;
    premium: number;
  };
  recentDreams: any[];
}

interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  plan: 'free' | 'mid' | 'premium';
  isAdmin: boolean;
  role: string;
  interpretationsUsedToday: number;
  literalArtUsedToday: number;
  feelingArtUsedToday: number;
  createdAt: string;
  _count: {
    dreams: number;
    comments: number;
    likes: number;
  };
}

interface AdminReport {
  id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
  reporter: {
    username: string;
    email: string;
  };
  dream?: {
    id: string;
    dreamText: string;
    interpretation: string | null;
    artUrl: string | null;
    user: {
      username: string;
      email: string;
    };
  };
}

interface AdminDream {
  id: string;
  dreamText: string;
  interpretation: string | null;
  artUrl: string | null;
  moodTags: string[];
  customTags: string[];
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    plan: string;
    isAdmin: boolean;
  };
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'dreams' | 'moderation'>('overview');
  
  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [allDreams, setAllDreams] = useState<AdminDream[]>([]);
  
  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState('');
  const [dreamSearch, setDreamSearch] = useState('');
  
  // UI states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingDreams, setLoadingDreams] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const isAdmin = user?.isAdmin || (user as any)?.role === 'admin' || user?.email?.toLowerCase() === 'anshudayma23@gmail.com';

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const url = new URL('/api/admin/users', window.location.origin);
      if (userSearch) url.searchParams.set('q', userSearch);
      if (userPlanFilter) url.searchParams.set('plan', userPlanFilter);
      
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchAllDreams = async () => {
    setLoadingDreams(true);
    try {
      const url = new URL('/api/admin/dreams', window.location.origin);
      if (dreamSearch) url.searchParams.set('q', dreamSearch);
      
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setAllDreams(data.dreams || []);
      }
    } catch (err) {
      console.error('Failed to fetch all dreams:', err);
    } finally {
      setLoadingDreams(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchStats();
      fetchUsers();
      fetchReports();
      fetchAllDreams();
    }
  }, [isAuthenticated, isAdmin]);

  const handleUpdatePlan = async (userId: string, newPlan: 'free' | 'mid' | 'premium') => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
        showToast('User plan updated successfully');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentStatus })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !currentStatus, role: !currentStatus ? 'admin' : 'user' } : u));
        showToast(`User ${!currentStatus ? 'promoted to Admin' : 'demoted to User'}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleResetLimits = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetLimits: true })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { 
          ...u, 
          interpretationsUsedToday: 0, 
          literalArtUsedToday: 0, 
          feelingArtUsedToday: 0 
        } : u));
        showToast('Daily limits reset for user');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdateReport = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
        showToast(`Report marked as ${status}`);
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDream = async (dreamId: string) => {
    if (!confirm('Are you sure you want to permanently delete this dream from Dreamola?')) return;
    try {
      const res = await fetch(`/api/admin/dreams/${dreamId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.dream?.id !== dreamId));
        setAllDreams(prev => prev.filter(d => d.id !== dreamId));
        showToast('Dream deleted successfully');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-on-surface-variant">
        <RefreshCw className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="font-display text-lg">Unlocking Master Console...</span>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 text-center">
        <div className="glass-card rounded-[3rem] p-12 max-w-md w-full flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-headline-md text-2xl text-on-background">Sanctuary Protected</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The Admin Console requires sovereign clearance. Please log in with an authorized administrator account to continue.
          </p>
          <Link 
            href="/"
            className="btn-aurora px-8 py-3 rounded-full font-button text-sm"
          >
            Return to Canvas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto flex flex-col gap-8 font-sans">
      
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-24 right-8 z-50 glass-card bg-primary-container/90 text-on-primary-container border border-primary/30 px-5 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span className="font-label-md text-sm font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-1">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Master Control Center</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-background">
            Admin Sanctuary
          </h1>
        </div>

        {/* Tab Navigation Pills */}
        <div className="flex items-center gap-2 p-1.5 glass-card rounded-full bg-surface-container-low/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-full font-label-md text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white shadow-sm text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-background'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('users'); fetchUsers(); }}
            className={`px-5 py-2 rounded-full font-label-md text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white shadow-sm text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-background'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Explorers ({stats?.totalUsers ?? '...'})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('dreams'); fetchAllDreams(); }}
            className={`px-5 py-2 rounded-full font-label-md text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dreams'
                ? 'bg-white shadow-sm text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-background'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>All Dreams ({stats?.totalDreams ?? '...'})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('moderation'); fetchReports(); }}
            className={`px-5 py-2 rounded-full font-label-md text-sm transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'moderation'
                ? 'bg-white shadow-sm text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-background'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Moderation</span>
            {(stats?.pendingReports ?? 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8 animate-fadeIn">
          
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Users (Clickable -> Switches to Users tab) */}
            <div 
              onClick={() => { setActiveTab('users'); fetchUsers(); }}
              className="glass-card rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-primary/30"
              title="Click to view all registered user accounts and emails"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant flex items-center gap-1">
                  Explorers
                  <ChevronRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-4xl text-on-background font-semibold">
                  {stats?.totalUsers ?? 0}
                </h3>
                <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                  <span>View all user emails</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </div>

            {/* Card 2: Total Dreams (Clickable -> Switches to Dreams tab) */}
            <div 
              onClick={() => { setActiveTab('dreams'); fetchAllDreams(); }}
              className="glass-card rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-indigo-400/30"
              title="Click to view all dreams prompted on the website"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant flex items-center gap-1">
                  Dreams Decoded
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-4xl text-on-background font-semibold">
                  {stats?.totalDreams ?? 0}
                </h3>
                <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
                  <span>Explore all dream prompts</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </div>

            {/* Card 3: Artworks Generated */}
            <div 
              onClick={() => { setActiveTab('dreams'); fetchAllDreams(); }}
              className="glass-card rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-pink-400/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Canvas Artworks</span>
                <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-700 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-4xl text-on-background font-semibold">
                  {stats?.totalArtworks ?? 0}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">Surreal & literal renderings</p>
              </div>
            </div>

            {/* Card 4: Moderation Reports */}
            <div 
              onClick={() => { setActiveTab('moderation'); fetchReports(); }}
              className="glass-card rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-amber-400/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Reports Queue</span>
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-4xl text-on-background font-semibold">
                  {stats?.pendingReports ?? 0}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">Pending community flags</p>
              </div>
            </div>

          </div>

          {/* Sub-Section: Plan Distribution & Recent Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Plan Tier Distribution */}
            <div className="glass-card rounded-[2.5rem] p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-xl text-on-background">Subscription Tiers</h2>
                <Crown className="w-5 h-5 text-amber-500" />
              </div>

              <div className="space-y-4">
                {/* Free */}
                <div 
                  onClick={() => { setUserPlanFilter('free'); setActiveTab('users'); fetchUsers(); }}
                  className="cursor-pointer group p-2 rounded-xl hover:bg-surface-container-low transition-colors"
                  title="Click to view free users"
                >
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-on-surface-variant group-hover:text-primary transition-colors">Dreamer (Free)</span>
                    <span className="text-on-background font-bold">{stats?.planBreakdown.free ?? 0}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-purple-300 h-2.5 rounded-full" 
                      style={{ width: `${stats?.totalUsers ? ((stats.planBreakdown.free / stats.totalUsers) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Lucid */}
                <div 
                  onClick={() => { setUserPlanFilter('mid'); setActiveTab('users'); fetchUsers(); }}
                  className="cursor-pointer group p-2 rounded-xl hover:bg-surface-container-low transition-colors"
                  title="Click to view Lucid subscribers"
                >
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-on-surface-variant group-hover:text-primary transition-colors">Lucid ($4.99/mo)</span>
                    <span className="text-on-background font-bold">{stats?.planBreakdown.mid ?? 0}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${stats?.totalUsers ? ((stats.planBreakdown.mid / stats.totalUsers) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Oracle */}
                <div 
                  onClick={() => { setUserPlanFilter('premium'); setActiveTab('users'); fetchUsers(); }}
                  className="cursor-pointer group p-2 rounded-xl hover:bg-surface-container-low transition-colors"
                  title="Click to view Oracle subscribers"
                >
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-on-surface-variant group-hover:text-primary transition-colors">Oracle ($9.99/mo)</span>
                    <span className="text-on-background font-bold">{stats?.planBreakdown.premium ?? 0}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full" 
                      style={{ width: `${stats?.totalUsers ? ((stats.planBreakdown.premium / stats.totalUsers) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/10 text-xs text-on-surface-variant leading-relaxed">
                Admins have permanent Oracle status with unlimited text interpretations and AI art engines.
              </div>
            </div>

            {/* Recent Dreams Activity (Shows Last 3 Dreams + Clickable to view all) */}
            <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-xl text-on-background">Live Dream Activity</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Showing 3 most recent dreams</p>
                </div>
                <button 
                  type="button"
                  onClick={() => { setActiveTab('dreams'); fetchAllDreams(); }}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  <span>View All Dreams ({stats?.totalDreams ?? 0})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-outline-variant/10">
                {stats?.recentDreams && stats.recentDreams.length > 0 ? (
                  stats.recentDreams.slice(0, 3).map((d: any) => (
                    <div 
                      key={d.id} 
                      onClick={() => { setActiveTab('dreams'); fetchAllDreams(); }}
                      className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 cursor-pointer hover:bg-surface-container-low/40 p-2 rounded-2xl transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-on-background line-clamp-2">
                          "{d.dreamText}"
                        </p>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="font-semibold text-primary">by @{d.user?.username || 'anonymous'}</span>
                          <span>•</span>
                          <span className="text-on-surface-variant/80">{d.user?.email}</span>
                          <span>•</span>
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {d.artUrl && (
                        <img 
                          src={d.artUrl} 
                          alt="Dream thumbnail" 
                          className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0 shadow-sm" 
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant py-4">No recent dream activity recorded yet.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT (EXPLORERS) */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Header & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-md text-2xl text-on-background">Explorer Accounts</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Complete list of all {users.length} registered accounts across the platform
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Pill Container: DAU & MAU */}
              <div className="glass-panel bg-surface-container-low/90 border border-outline-variant/20 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-on-background" title="Daily Active Users in the last 24 hours">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-on-surface-variant font-normal">DAU:</span>
                  <span className="font-bold text-emerald-600">{stats?.dailyActiveUsers ?? 1}</span>
                </div>
                <div className="w-px h-3 bg-outline-variant/30"></div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-on-background" title="Monthly Active Users in the past 30 days">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-on-surface-variant font-normal">MAU:</span>
                  <span className="font-bold text-primary">{stats?.monthlyActiveUsers ?? Math.max(1, users.length)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                className="self-start sm:self-auto text-xs text-primary hover:underline flex items-center gap-1.5 cursor-pointer bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-full transition-colors font-medium shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Accounts</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-low/80 border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-on-background"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => { setUserPlanFilter(''); fetchUsers(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  userPlanFilter === '' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => { setUserPlanFilter('free'); fetchUsers(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  userPlanFilter === 'free' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => { setUserPlanFilter('mid'); fetchUsers(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  userPlanFilter === 'mid' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                Lucid ($4.99)
              </button>
              <button
                type="button"
                onClick={() => { setUserPlanFilter('premium'); fetchUsers(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  userPlanFilter === 'premium' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                Oracle ($9.99)
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-[2rem] overflow-hidden border border-outline-variant/10 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-low/60 text-xs uppercase tracking-wider text-on-surface-variant">
                    <th className="py-4 px-6">User Email & Name</th>
                    <th className="py-4 px-6">Plan Tier</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Usage Today</th>
                    <th className="py-4 px-6">Dreams Logged</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-right">Reset Limits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                        Loading explorer accounts directory...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-primary-container/5 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-background">{u.username}</span>
                            <span className="text-xs text-primary font-mono select-all font-medium">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={u.plan}
                            onChange={(e) => handleUpdatePlan(u.id, e.target.value as any)}
                            disabled={updatingUserId === u.id}
                            className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-2.5 py-1 text-xs font-semibold text-on-background outline-none cursor-pointer hover:border-primary/40"
                          >
                            <option value="free">Dreamer (Free)</option>
                            <option value="mid">Lucid ($4.99)</option>
                            <option value="premium">Oracle ($9.99)</option>
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                            disabled={updatingUserId === u.id}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                              u.isAdmin 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>{u.isAdmin ? 'Admin' : 'User'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-xs text-on-surface-variant">
                          <div>Meanings: <strong className="text-on-background">{u.interpretationsUsedToday}</strong></div>
                          <div>Art: <strong className="text-on-background">{u.literalArtUsedToday + u.feelingArtUsedToday}</strong></div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-on-background">
                          {u._count.dreams}
                        </td>
                        <td className="py-4 px-6 text-xs text-on-surface-variant">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleResetLimits(u.id)}
                            disabled={updatingUserId === u.id}
                            title="Reset daily usage limits"
                            className="p-2 rounded-full hover:bg-primary-container/20 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ALL DREAMS FEED */}
      {activeTab === 'dreams' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-md text-2xl text-on-background">All Website Dreams</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Live stream of all dream prompts, interpretations, and AI art created on Dreamola ({allDreams.length} total)
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAllDreams}
              className="self-start sm:self-auto text-xs text-primary hover:underline flex items-center gap-1.5 cursor-pointer bg-primary/10 px-3.5 py-1.5 rounded-full"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stream</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search dream prompts, author email, or username..."
              value={dreamSearch}
              onChange={(e) => setDreamSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchAllDreams(); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-low/80 border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-on-background"
            />
          </div>

          {/* Dreams Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingDreams ? (
              <div className="col-span-full py-16 text-center text-on-surface-variant">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                <p>Loading all dreams from database...</p>
              </div>
            ) : allDreams.length === 0 ? (
              <div className="col-span-full glass-card rounded-[2rem] p-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
                <BookOpen className="w-10 h-10 text-primary/40" />
                <h3 className="font-headline-md text-lg text-on-background">No Dreams Found</h3>
                <p className="text-xs max-w-sm">No dream prompts matched your search query or no dreams have been logged yet.</p>
              </div>
            ) : (
              allDreams.map((d) => (
                <div 
                  key={d.id} 
                  className="glass-card rounded-[2rem] p-6 flex flex-col justify-between gap-4 border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-3">
                    {/* Top author & date bar */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-background">@{d.user?.username || 'user'}</span>
                        <span className="text-on-surface-variant/80 font-mono text-[11px]">({d.user?.email})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          d.user?.plan === 'premium' ? 'bg-amber-100 text-amber-800' :
                          d.user?.plan === 'mid' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {d.user?.isAdmin ? 'Admin' : d.user?.plan || 'Free'}
                        </span>
                      </div>
                      <span className="text-on-surface-variant text-[11px]">
                        {new Date(d.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Dream Prompt Text */}
                    <div className="p-3.5 bg-surface-container-low/70 rounded-2xl border border-outline-variant/10">
                      <p className="text-xs uppercase font-bold text-primary tracking-wider mb-1">Prompt Transcription:</p>
                      <p className="text-sm text-on-background leading-relaxed font-medium">
                        "{d.dreamText}"
                      </p>
                    </div>

                    {/* Interpretation snippet */}
                    {d.interpretation && (
                      <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 text-xs text-on-surface-variant leading-relaxed">
                        <strong className="text-primary block mb-0.5">AI Interpretation:</strong>
                        {d.interpretation}
                      </div>
                    )}

                    {/* Artwork if available */}
                    {d.artUrl && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-surface-container group">
                        <img 
                          src={d.artUrl} 
                          alt="Dream visualization" 
                          className="w-full h-full object-cover"
                        />
                        <a 
                          href={d.artUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Open Full Image"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* Mood & Custom Tags */}
                    {(d.moodTags?.length > 0 || d.customTags?.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {d.moodTags?.map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                            {tag}
                          </span>
                        ))}
                        {d.customTags?.map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                    <span className="text-[11px] text-on-surface-variant">
                      {d.isPublic ? '🌐 Shared in Gallery' : '🔒 Private Journal Log'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDream(d.id)}
                      className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Dream</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 4: MODERATION */}
      {activeTab === 'moderation' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-xl text-on-background">Community Reports Queue</h2>
            <button
              type="button"
              onClick={fetchReports}
              className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loadingReports ? (
              <div className="py-12 text-center text-on-surface-variant">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                Checking moderation queue...
              </div>
            ) : reports.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <h3 className="font-headline-md text-lg text-on-background">Moderation Queue is Clean</h3>
                <p className="text-xs max-w-sm">No community reports are currently pending review.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="glass-card rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-outline-variant/10">
                  <div className="flex flex-col gap-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        report.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Reported by @{report.reporter.username} • {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-red-600">
                      Reason: {report.reason}
                    </p>

                    {report.dream && (
                      <div className="p-3 bg-surface-container-low/80 rounded-xl text-xs text-on-surface-variant">
                        <strong className="text-on-background">Dream text: </strong>
                        "{report.dream.dreamText.substring(0, 160)}..."
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {report.dream && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDream(report.dream!.id)}
                        className="px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Dream</span>
                      </button>
                    )}

                    {report.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateReport(report.id, 'dismissed')}
                        className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}

