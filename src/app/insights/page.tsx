'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { exportDreamRecapPDF } from '@/lib/pdf-export';
import { 
  Eye, 
  Key, 
  Sparkles, 
  Droplets, 
  Download, 
  Calendar, 
  MoreHorizontal, 
  Cloud, 
  Compass, 
  DoorOpen, 
  Plane, 
  Shield, 
  Infinity as InfinityIcon, 
  Moon, 
  CircleDot, 
  ArrowRight, 
  Loader2, 
  Lock,
  ChevronDown
} from 'lucide-react';

interface SummaryData {
  totalDreams: number;
  lastMonthCount: number;
  spotlightDream?: {
    id: string;
    dreamText: string;
    interpretation: string | null;
    artUrl: string | null;
    createdAt: string;
    moodTags: string[];
    customTags: string[];
  } | null;
}

interface SymbolData {
  keyword: string;
  count: number;
  theme: string;
}

interface MoodData {
  name: string;
  count: number;
}



export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [topSymbols, setTopSymbols] = useState<SymbolData[]>([]);
  const [moods, setMoods] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const plan = session?.user?.plan || 'free';
  const isAdmin = session?.user?.isAdmin || session?.user?.role === 'admin' || session?.user?.email?.toLowerCase() === 'anshudayma23@gmail.com';
  const isFree = plan === 'free' && !isAdmin;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dream?auth=login&redirect=/insights');
      return;
    }

    if (status === 'authenticated') {
      fetchInsights();
    }
  }, [status, isFree]);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      if (isFree) {
        // Free users see empty data behind the lock
        setSummary({ totalDreams: 0, lastMonthCount: 0, spotlightDream: null });
        setTopSymbols([]);
        setMoods([]);
      } else {
        const res = await fetch('/api/insights');
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
          setTopSymbols(data.topSymbols || []);
          setMoods(data.moods || []);
        } else {
          setSummary({ totalDreams: 0, lastMonthCount: 0, spotlightDream: null });
          setTopSymbols([]);
          setMoods([]);
        }
      }
    } catch (err) {
      console.error('Failed to load insights:', err);
      setSummary({ totalDreams: 0, lastMonthCount: 0, spotlightDream: null });
      setTopSymbols([]);
      setMoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfExport = async () => {
    if (!summary) return;
    if (isFree) {
      router.push('/pricing');
      return;
    }

    setIsExporting(true);
    try {
      exportDreamRecapPDF(
        { username: session?.user?.username || 'Dreamer' },
        summary,
        topSymbols,
        moods
      );
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const spotlight = summary?.spotlightDream || null;
  const maxSymbolCount = topSymbols.length > 0 ? Math.max(...topSymbols.map(s => s.count)) : 1;

  // Compute real dominant archetype from top symbol
  const dominantArchetype = topSymbols.length > 0 ? topSymbols[0].keyword : '—';

  // Compute real lucid clarity percentage
  const totalMoodCount = moods.reduce((sum, m) => sum + m.count, 0);
  const lucidMood = moods.find(m => m.name.toLowerCase() === 'lucid');
  const lucidPercent = totalMoodCount > 0 && lucidMood ? Math.round((lucidMood.count / totalMoodCount) * 100) : 0;

  // Compute real dominant emotions (top 2)
  const sortedMoods = [...moods].sort((a, b) => b.count - a.count);
  const emotionalBalance = sortedMoods.length > 0
    ? sortedMoods.slice(0, 2).map(m => m.name.charAt(0).toUpperCase() + m.name.slice(1)).join(' / ')
    : '—';

  // Compute donut chart segments from real mood data
  const totalDonut = sortedMoods.reduce((sum, m) => sum + m.count, 0);
  const donutSegments = sortedMoods.slice(0, 3);
  const donutColors = ['#630ed4', '#fc79bd', '#d2bbff'];
  let donutGradient = 'conic-gradient(from 0deg, #e5e7eb 0% 100%)';
  if (totalDonut > 0) {
    let cumulative = 0;
    const stops: string[] = [];
    donutSegments.forEach((seg, idx) => {
      const pct = (seg.count / totalDonut) * 100;
      stops.push(`${donutColors[idx]} ${cumulative}% ${cumulative + pct}%`);
      cumulative += pct;
    });
    if (cumulative < 100) {
      stops.push(`#e5e7eb ${cumulative}% 100%`);
    }
    donutGradient = `conic-gradient(from 0deg, ${stops.join(', ')})`;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-label-md text-sm text-on-surface-variant animate-pulse">
          Synthesizing subconscious archetype waves...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-secondary-container opacity-20 blur-[150px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[30%] left-[60%] w-[40vw] h-[40vw] bg-tertiary-container opacity-10 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Main Canvas */}
      <main className="relative z-10 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-8 md:gap-12 mt-12 pb-24">
        
        {/* Hero Header */}
        <header className="flex flex-col items-center text-center gap-stack-sm mb-4">
          <h1 className="font-display-lg text-display-lg text-on-background tracking-tight">
            Subconscious <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-container">Insights</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Unveiling the hidden patterns and architectural recurring motifs woven through your nocturnal narratives over the past cycle.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-stack-md mt-6">
            {/* Time Range Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="glass-panel bg-white/75 rounded-full px-6 py-2.5 flex items-center gap-2 text-on-surface border border-white/80 shadow-sm cursor-pointer hover:bg-white transition-colors"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-label-md text-label-md font-semibold">{timeRange}</span>
                <ChevronDown className="w-4 h-4 text-outline ml-1" />
              </button>

              {showTimeDropdown && (
                <div className="absolute left-0 mt-2 w-48 glass-panel bg-white/95 rounded-2xl p-1.5 shadow-xl z-30 border border-outline-variant/20 animate-fadeIn">
                  {['Last 30 Days', 'Past 3 Months', 'All-Time Vision Log'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setTimeRange(opt); setShowTimeDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                        timeRange === opt ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Export Button */}
            <button 
              onClick={handlePdfExport}
              disabled={isExporting}
              className="aurora-btn text-white font-button text-button px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-primary-container/20 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export PDF Report</span>
            </button>
          </div>
        </header>

        {/* Free Plan Lock Wrapper */}
        <div className={`relative ${isFree ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
          
          {/* Key Metrics Row (4 Cards) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
            
            {/* Metric 1 */}
            <div className="glass-panel bg-white/75 rounded-2xl p-stack-lg flex flex-col gap-stack-xs relative group hover:-translate-y-1 transition-transform duration-300 border border-white/80 shadow-[0_4px_24px_rgba(30,27,75,0.06)]">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
                <Eye className="w-5 h-5" />
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Visions</span>
              <div className="font-headline-lg text-headline-lg text-on-background flex items-center gap-4 flex-nowrap mt-2">
                {summary?.totalDreams ?? 0}
                <span className="text-label-md font-bold text-primary bg-primary/10 rounded-full whitespace-nowrap flex items-center justify-center px-4 py-1.5 leading-none">
                  +{summary?.lastMonthCount ?? 0} this cycle
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="glass-panel bg-white/75 rounded-2xl p-stack-lg flex flex-col gap-stack-xs relative group hover:-translate-y-1 transition-transform duration-300 border border-white/80 shadow-[0_4px_24px_rgba(30,27,75,0.06)]">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-2 text-secondary">
                <Key className="w-5 h-5" />
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Dominant Archetype</span>
              <div className="font-headline-md text-headline-md text-on-background mt-1">
                {dominantArchetype}
              </div>
            </div>

            {/* Metric 3 */}
            <div className="glass-panel bg-white/75 rounded-2xl p-stack-lg flex flex-col gap-stack-xs relative group hover:-translate-y-1 transition-transform duration-300 border border-white/80 shadow-[0_4px_24px_rgba(30,27,75,0.06)]">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center mb-2 text-tertiary">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Lucid Clarity</span>
              <div className="font-headline-lg text-headline-lg text-on-background">
                {lucidPercent}%
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-gradient-to-r from-tertiary-fixed to-tertiary h-full rounded-full" style={{ width: `${lucidPercent}%` }}></div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="glass-panel bg-white/75 rounded-2xl p-stack-lg flex flex-col gap-stack-xs relative group hover:-translate-y-1 transition-transform duration-300 border border-white/80 shadow-[0_4px_24px_rgba(30,27,75,0.06)]">
              <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center mb-2 text-secondary">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Emotional Balance</span>
              <div className="font-headline-md text-headline-md text-on-background mt-1 flex items-center gap-2">
                {emotionalBalance}
              </div>
            </div>

          </section>

          {/* Visual Analytics Bento Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md mt-6">
            
            {/* Panel 1: Symbolic Resonance (Col-span 8) */}
            <div className="glass-panel bg-white/75 rounded-3xl p-stack-lg lg:col-span-8 flex flex-col gap-stack-md border border-white/80 shadow-[0_4px_24px_rgba(30,27,75,0.06)]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-headline-md text-headline-md text-on-background">Symbolic Resonance</h3>
                <MoreHorizontal className="w-5 h-5 text-outline cursor-pointer hover:text-primary transition-colors" />
              </div>

              {topSymbols.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {topSymbols.slice(0, 4).map((sym, idx) => {
                    const percent = Math.min(100, Math.max(15, Math.round((sym.count / maxSymbolCount) * 100)));
                    const icons = [Cloud, Droplets, DoorOpen, Plane];
                    const IconComp = icons[idx % icons.length];
                    const colors = [
                      'from-primary-fixed to-primary',
                      'from-tertiary-fixed to-tertiary',
                      'from-secondary-fixed to-secondary',
                      'from-primary-fixed-dim to-primary-container'
                    ];

                    return (
                      <div key={idx}>
                        <div className="flex justify-between font-label-md text-label-md mb-1.5">
                          <span className="text-on-background flex items-center gap-2 font-semibold">
                            <IconComp className="w-4 h-4 text-primary" />
                            {sym.keyword}
                          </span>
                          <span className="text-on-surface-variant">{sym.count} occurrences</span>
                        </div>
                        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`bg-gradient-to-r ${colors[idx % colors.length]} h-full rounded-full transition-all duration-1000`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
                  <Cloud className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm">No recurring symbols yet</p>
                  <p className="text-xs opacity-60">Decode dreams to discover your symbolic patterns</p>
                </div>
              )}
            </div>

            {/* Panel 2: Emotional Strata (Col-span 4 Donut Chart) */}
            <div className="glass-panel bg-white/75 rounded-3xl p-stack-lg lg:col-span-4 flex flex-col items-center justify-center text-center min-h-[300px] border border-white/80 shadow-[0_4px_24px_rgba(30,27,75,0.06)]">
              <h3 className="font-headline-md text-headline-md text-on-background w-full text-left mb-6">Emotional Strata</h3>
              
              {sortedMoods.length > 0 ? (
                <>
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Conic Gradient Donut Ring */}
                    <div 
                      className="absolute inset-0 rounded-full shadow-inner"
                      style={{ background: donutGradient }}
                    />
                    {/* Inner Cut-Out Hole */}
                    <div className="absolute w-24 h-24 bg-surface-bright rounded-full flex flex-col items-center justify-center z-10 shadow-sm border border-white/80">
                      <span className="font-headline-md text-headline-md text-primary leading-none font-bold">
                        {totalDonut > 0 ? Math.round((sortedMoods[0].count / totalDonut) * 100) : 0}%
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant mt-1 font-semibold">
                        {sortedMoods[0].name.charAt(0).toUpperCase() + sortedMoods[0].name.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-6 w-full font-label-md text-label-md">
                    {donutSegments.map((seg, idx) => (
                      <div key={seg.name} className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: donutColors[idx] }}></div>
                        {seg.name.charAt(0).toUpperCase() + seg.name.slice(1)}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                  <Droplets className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No mood data yet</p>
                  <p className="text-xs opacity-60">Decode dreams to see emotional patterns</p>
                </div>
              )}
            </div>

            {/* Panel 3: Top Symbols Mini Cards (Col-span 12) */}
            {topSymbols.length > 0 ? (
              <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-stack-sm mt-2">
                {topSymbols.slice(0, 4).map((sym, idx) => {
                  const symbolIcons = [Shield, InfinityIcon, Moon, CircleDot];
                  const SymIcon = symbolIcons[idx % symbolIcons.length];
                  const bgColors = ['bg-primary-fixed', 'bg-secondary-fixed', 'bg-surface-container-high', 'bg-tertiary-fixed'];
                  const textColors = ['text-primary', 'text-secondary', 'text-on-surface', 'text-tertiary'];
                  const pct = maxSymbolCount > 0 ? Math.round((sym.count / maxSymbolCount) * 100) : 0;
                  return (
                    <div key={sym.keyword} className="bg-white/60 border border-white/80 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/90 transition-colors shadow-sm">
                      <div className={`w-9 h-9 rounded-full ${bgColors[idx % bgColors.length]} flex items-center justify-center ${textColors[idx % textColors.length]}`}>
                        <SymIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-background font-semibold">{sym.keyword}</span>
                        <span className={`font-body-md text-[11px] ${textColors[idx % textColors.length]} font-medium`}>{sym.count} occurrences ({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="lg:col-span-12 bg-white/60 border border-white/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-2">
                <Key className="w-8 h-8 text-on-surface-variant opacity-30 mb-2" />
                <p className="text-sm text-on-surface-variant">No recurring symbols detected yet</p>
                <p className="text-xs text-on-surface-variant opacity-60">Your dream archetypes will appear here as you log more dreams</p>
              </div>
            )}

          </section>

          {/* Dream Narrative Spotlight Section */}
          {spotlight ? (
            <section className="glass-panel bg-white/75 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-[0_8px_32px_rgba(30,27,75,0.08)] mt-8 border border-white/80">
              {spotlight.artUrl && (
                <div className="relative h-64 md:h-auto min-h-[340px]">
                  <img 
                    src={spotlight.artUrl} 
                    alt="Spotlight Dream Art" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(30,27,75,0.2)] pointer-events-none"></div>
                </div>
              )}

              <div className={`p-8 md:p-12 flex flex-col justify-center gap-6 ${!spotlight.artUrl ? 'md:col-span-2' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-surface-container text-on-surface-variant font-label-md text-[10px] uppercase tracking-widest rounded-full border border-outline-variant/30 font-semibold">
                    Pivotal Vision
                  </span>
                  <span className="font-label-md text-xs text-outline">
                    {new Date(spotlight.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background leading-tight">
                  {spotlight.customTags?.[0] || 'Dream Spotlight'}
                </h2>

                <div className="space-y-4">
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed italic">
                    "{spotlight.dreamText}"
                  </p>

                  {spotlight.interpretation && (
                    <div className="p-4 bg-primary/5 border-l-2 border-primary rounded-r-xl">
                      <h4 className="font-label-md text-label-md text-primary mb-1 uppercase tracking-wider font-bold">AI Synthesis</h4>
                      <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">
                        {spotlight.interpretation}
                      </p>
                    </div>
                  )}
                </div>

                <Link 
                  href="/dream"
                  className="self-start mt-2 px-6 py-2.5 rounded-full border border-primary text-primary font-button text-button hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>Decode New Dream</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          ) : (
            <section className="glass-panel bg-white/75 rounded-3xl p-12 mt-8 border border-white/80 shadow-[0_8px_32px_rgba(30,27,75,0.08)] flex flex-col items-center text-center">
              <Sparkles className="w-10 h-10 text-primary opacity-30 mb-4" />
              <h3 className="font-headline-md text-headline-md text-on-background mb-2">No Spotlight Dream Yet</h3>
              <p className="text-sm text-on-surface-variant mb-6 max-w-md">Your most vivid dream with AI-generated art will be featured here once you start decoding dreams.</p>
              <Link 
                href="/dream"
                className="aurora-btn px-6 py-2.5 rounded-full font-button text-button text-white shadow-md hover:scale-95 transition-transform flex items-center gap-2"
              >
                <span>Decode Your First Dream</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          )}

        </div>

        {/* Locked Premium Banner Overlay for Free Users */}
        {isFree && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 mt-32">
            <div className="glass-panel bg-white/95 border border-primary/20 rounded-3xl p-8 md:p-10 max-w-md w-full text-center shadow-[0_12px_48px_rgba(99,14,212,0.15)] animate-fadeIn flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-primary animate-pulse" />
              </div>

              <h2 className="text-2xl font-serif text-on-surface mb-2 font-bold flex items-center gap-1.5 justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
                Unlock Oracle Insights
              </h2>
              
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Track your recurring Jungian archetypes, symbolic frequencies, emotional undercurrents, and export styled monthly PDF dream recaps.
              </p>

              <Link
                href="/pricing"
                className="aurora-btn w-full text-white py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-primary/20 hover:opacity-95"
              >
                Upgrade to Oracle Tier
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
