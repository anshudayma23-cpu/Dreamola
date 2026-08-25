'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Moon, 
  Lock, 
  Globe, 
  Search, 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  Share2, 
  Sparkles, 
  Plus, 
  Grid, 
  List, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  X
} from 'lucide-react';

interface DreamEntry {
  id: string;
  dreamText: string;
  interpretation: string | null;
  artUrl: string | null;
  moodTags: string[];
  customTags: string[];
  isPublic: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

const FILTER_TAGS = ['#All', '#Lucid', '#Mystical', '#Oceanic', '#Thresholds', '#Nightmare'];

export default function JournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('#All');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  // Interactive state
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const plan = session?.user?.plan || 'free';
  const isAdmin = session?.user?.isAdmin || session?.user?.role === 'admin' || session?.user?.email?.toLowerCase() === 'anshudayma23@gmail.com';
  const isFree = plan === 'free' && !isAdmin;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDreams = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isFree) {
        setDreams([]);
      } else {
        const res = await fetch('/api/dreams');
        if (res.ok) {
          const data = await res.json();
          setDreams(data.dreams || []);
        } else {
          setDreams([]);
        }
      }
    } catch (err) {
      console.error('Failed to load journal:', err);
      setDreams([]);
    } finally {
      setIsLoading(false);
    }
  }, [isFree]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dream?auth=login&redirect=/journal');
      return;
    }
    if (status === 'authenticated') {
      fetchDreams();
    }
  }, [status, fetchDreams, router]);

  // Audio Speech Synthesis
  const handleListen = (dream: DreamEntry) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === dream.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const narrationText = `${dream.customTags[0] || 'Dream'}. ${dream.dreamText}. Psychological Interpretation: ${dream.interpretation || ''}`;
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(dream.id);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Visibility (Private vs Public Gallery)
  const handleToggleVisibility = async (dream: DreamEntry) => {
    if (isFree) {
      router.push('/pricing');
      return;
    }

    const nextState = !dream.isPublic;
    // Optimistic update
    setDreams(prev => prev.map(d => d.id === dream.id ? { ...d, isPublic: nextState } : d));

    try {
      const res = await fetch(`/api/dreams/${dream.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: nextState })
      });
      if (res.ok) {
        showToast(nextState ? '✨ Dream shared to Collective Gallery!' : '🔒 Dream set to Private Vault');
      } else {
        // Revert
        setDreams(prev => prev.map(d => d.id === dream.id ? { ...d, isPublic: !nextState } : d));
      }
    } catch {
      setDreams(prev => prev.map(d => d.id === dream.id ? { ...d, isPublic: !nextState } : d));
    }
  };

  // Delete Dream
  const handleDeleteDream = async (id: string) => {
    try {
      const res = await fetch(`/api/dreams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDreams(prev => prev.filter(d => d.id !== id));
        showToast('Dream removed from journal');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Export JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dreams, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dreamola_journal_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Journal data downloaded (JSON)');
  };

  // Filtered Dreams
  const filteredDreams = dreams.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      d.dreamText.toLowerCase().includes(q) ||
      (d.interpretation && d.interpretation.toLowerCase().includes(q)) ||
      d.customTags.some(t => t.toLowerCase().includes(q)) ||
      d.moodTags.some(t => t.toLowerCase().includes(q));

    const matchesTag = selectedTag === '#All' || 
      d.moodTags.some(t => t.toLowerCase().includes(selectedTag.replace('#', '').toLowerCase())) ||
      d.customTags.some(t => t.toLowerCase().includes(selectedTag.replace('#', '').toLowerCase()));

    return matchesSearch && matchesTag;
  });

  // Quick stats
  const totalEntries = dreams.length;
  const lucidCount = dreams.filter(d => d.moodTags.some(t => t.toLowerCase().includes('lucid'))).length;
  const privateCount = dreams.filter(d => !d.isPublic).length;
  const publicCount = dreams.filter(d => d.isPublic).length;

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-label-md text-sm text-on-surface-variant animate-pulse">
          Opening your nocturnal memory vault...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container flex flex-col justify-between">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 glass-panel bg-white/95 text-primary border border-primary/20 px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span className="font-label-md text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Ambient Blur Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[40%] right-[-20%] w-[60vw] h-[60vw] bg-secondary-container opacity-20 blur-[150px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[40vw] h-[40vw] bg-tertiary-container opacity-10 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-12 mt-8 flex flex-col items-center relative z-10">
        
        {/* Hero Section */}
        <header className="text-center mb-12 flex flex-col items-center w-full">
          <h1 className="font-display-lg text-display-lg md:text-display-lg text-on-surface mb-4">
            Your Nocturnal <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#630ed4] to-[#a855f7]">Sanctuary</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-8">
            Chronicle, decipher, and curate the ephemeral visions of your subconscious mind.
          </p>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="glass-panel bg-white/75 rounded-full px-4 py-2 font-label-md text-label-md flex items-center gap-2 border border-white shadow-sm">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{totalEntries} Total Entries</span>
            </div>
            <div className="glass-panel bg-white/75 rounded-full px-4 py-2 font-label-md text-label-md flex items-center gap-2 border border-white shadow-sm">
              <Moon className="w-4 h-4 text-tertiary" />
              <span>{lucidCount} Lucid Visions</span>
            </div>
            <div className="glass-panel bg-white/75 rounded-full px-4 py-2 font-label-md text-label-md flex items-center gap-2 border border-white shadow-sm">
              <Lock className="w-4 h-4 text-secondary" />
              <span>{privateCount} Private Logs</span>
            </div>
            <div className="glass-panel bg-white/75 rounded-full px-4 py-2 font-label-md text-label-md flex items-center gap-2 border border-white shadow-sm">
              <Globe className="w-4 h-4 text-primary" />
              <span>{publicCount} Shared in Gallery</span>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="glass-panel bg-white/75 w-full rounded-full py-3 px-4 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border border-white shadow-[0_4px_20px_rgba(30,27,75,0.06)]">
          
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dreams..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full pl-10 pr-4 py-2 font-body-md focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-sm"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 flex-grow">
            {FILTER_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full px-4 py-1.5 font-label-md text-label-md transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'glass-panel bg-white/60 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full p-1 border border-outline-variant/30">
            <button 
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
              title="Timeline List"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Free Plan Lock Wrapper */}
        <div className={`w-full relative ${isFree ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
          
          {viewMode === 'timeline' ? (
            /* Timeline Layout */
            <div className="w-full flex flex-col gap-8 relative before:content-[''] before:absolute before:left-8 md:before:left-1/2 before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-primary/20 before:via-secondary/20 before:to-transparent before:-translate-x-1/2">
              
              {filteredDreams.map((dream, idx) => {
                const isEven = idx % 2 === 0;
                const isSpeaking = speakingId === dream.id;

                return (
                  <article 
                    key={dream.id}
                    className={`glass-panel bg-white/80 w-full md:w-[calc(50%-2rem)] ${
                      isEven ? 'self-end' : 'self-start'
                    } rounded-[2rem] p-6 relative border border-white shadow-[0_8px_32px_rgba(30,27,75,0.06)] group hover:-translate-y-1 transition-all duration-300`}
                  >
                    {/* Timeline Node Dot */}
                    <div 
                      className={`absolute top-8 ${
                        isEven ? '-left-10 md:-left-[2.5rem]' : '-right-10 md:-right-[2.5rem]'
                      } w-4 h-4 rounded-full bg-surface border-[3px] border-primary z-10 hidden md:block`}
                    />

                    {/* Card Top Row */}
                    <div className="flex justify-between items-start mb-4">
                      <time className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                        {new Date(dream.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>

                      <div className="flex gap-2 items-center">
                        {dream.moodTags[0] && (
                          <span className="glass-panel bg-surface-container rounded-full px-3 py-1 font-label-md text-[11px] text-tertiary font-semibold">
                            {dream.moodTags[0]}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(dream)}
                          className={`rounded-full px-3 py-1 font-label-md text-[11px] flex items-center gap-1 font-semibold cursor-pointer border ${
                            dream.isPublic 
                              ? 'bg-primary/10 text-primary border-primary/20' 
                              : 'bg-secondary/10 text-secondary border-secondary/20'
                          }`}
                          title="Click to toggle public/private"
                        >
                          {dream.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{dream.isPublic ? 'Shared' : 'Private'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Image Frame */}
                    {dream.artUrl && (
                      <div className="rounded-2xl overflow-hidden mb-5 portal-image relative aspect-video bg-surface-container-high">
                        <img 
                          src={dream.artUrl} 
                          alt="Dream illustration" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Title & Narrative */}
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
                      {dream.customTags[0] || 'Subconscious Reflection'}
                    </h2>

                    <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-3 leading-relaxed">
                      "{dream.dreamText}"
                    </p>

                    {/* AI Insight Snippet */}
                    {dream.interpretation && (
                      <div className="bg-primary/5 rounded-2xl p-4 mb-5 border border-primary/10">
                        <p className="font-label-md text-label-md text-primary flex items-center gap-1.5 mb-1 font-bold">
                          <Sparkles className="w-4 h-4 text-primary" /> AI Insight
                        </p>
                        <p className="font-body-sm text-xs text-on-surface-variant italic leading-relaxed">
                          {dream.interpretation}
                        </p>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
                      <button 
                        type="button"
                        onClick={() => handleListen(dream)}
                        className={`flex items-center gap-1.5 font-button text-button text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                          isSpeaking 
                            ? 'bg-primary text-white animate-pulse' 
                            : 'text-primary hover:bg-primary/10'
                        }`}
                      >
                        {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isSpeaking ? 'Playing...' : 'Listen'}</span>
                      </button>

                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Link 
                          href="/dream"
                          className="p-2 rounded-full hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                          title="Open in Canvas"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button 
                          type="button"
                          onClick={() => setDeletingId(dream.id)}
                          className="p-2 rounded-full hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
                          title="Delete dream"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleToggleVisibility(dream)}
                          className="p-2 rounded-full hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                          title="Toggle Gallery Visibility"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </article>
                );
              })}

              {/* Empty / Prompt Card on Timeline */}
              <article className="w-full md:w-[calc(50%-2rem)] self-start rounded-[2rem] p-8 relative border-2 border-dashed border-primary/30 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center text-center mt-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Moon className="w-6 h-6" />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1 font-bold">
                  Did you wake from a dream?
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-5 text-sm">
                  Capture the subconscious symbols before they fade in the morning light.
                </p>
                <Link 
                  href="/dream"
                  className="aurora-btn px-6 py-2.5 rounded-full font-button text-button text-white shadow-md hover:scale-95 transition-transform flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record New Dream</span>
                </Link>
              </article>

            </div>
          ) : (
            /* Symmetrical Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDreams.map((dream) => (
                <article 
                  key={dream.id}
                  className="glass-panel bg-white/80 rounded-[2rem] p-5 flex flex-col justify-between gap-4 border border-white shadow-[0_8px_32px_rgba(30,27,75,0.06)]"
                >
                  <div>
                    {dream.artUrl && (
                      <div className="rounded-2xl overflow-hidden mb-3 aspect-video bg-surface-container-high">
                        <img src={dream.artUrl} alt="Art" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-on-surface-variant font-semibold">
                        {new Date(dream.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        dream.isPublic ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                      }`}>
                        {dream.isPublic ? 'Shared' : 'Private'}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">
                      {dream.customTags[0] || 'Reflection'}
                    </h3>
                    <p className="text-xs text-on-surface-variant italic line-clamp-3">
                      "{dream.dreamText}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                    <button 
                      onClick={() => handleListen(dream)}
                      className="text-xs text-primary font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" /> Listen
                    </button>
                    <button 
                      onClick={() => setDeletingId(dream.id)}
                      className="text-xs text-on-surface-variant hover:text-error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>

        {/* Free Plan Lock Modal */}
        {isFree && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 mt-32">
            <div className="glass-panel bg-white/95 border border-primary/20 rounded-3xl p-8 md:p-10 max-w-md w-full text-center shadow-[0_12px_48px_rgba(99,14,212,0.15)] animate-fadeIn flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-primary animate-pulse" />
              </div>

              <h2 className="text-2xl font-serif text-on-surface mb-2 font-bold flex items-center gap-1.5 justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
                Unlock Private Journal
              </h2>
              
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Save an encrypted personal journal of your dreams, audio narrations, mood tags, and toggle visibility with the public collective.
              </p>

              <Link
                href="/pricing"
                className="aurora-btn w-full text-white py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-primary/20 hover:opacity-95"
              >
                Upgrade to Lucid / Oracle Tier
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-white flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-headline-md text-lg font-bold text-gray-900">Delete Dream Entry?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This action cannot be undone. This dream will be permanently removed from your sanctuary.
            </p>
            <div className="flex gap-3 w-full mt-3">
              <button 
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-300 bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => handleDeleteDream(deletingId)}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-transparent border-t border-on-surface/10 flex flex-col md:flex-row justify-between items-center px-margin-desktop py-stack-lg w-full max-w-7xl mx-auto mt-16 z-10 relative">
        <div className="font-headline-md text-headline-md text-primary mb-4 md:mb-0 opacity-80 hover:opacity-100 transition-opacity">
          Dreamola
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant/70 mb-4 md:mb-0 text-center">
          © 2026 Dreamola. All dreams encrypted & private.
        </div>
        <div className="flex items-center gap-6 font-label-md text-label-md text-on-surface-variant/70">
          <Link className="hover:text-secondary transition-all" href="/privacy">Privacy</Link>
          <Link className="hover:text-secondary transition-all" href="/terms">Terms</Link>
          <button 
            type="button"
            onClick={handleExportData}
            className="hover:text-primary transition-all flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Journal Data
          </button>
        </div>
      </footer>

    </div>
  );
}
