'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoginModal } from '@/components/auth/LoginModal';
import { 
  Sparkles, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2, 
  ChevronDown, 
  Star, 
  Edit3, 
  ExternalLink,
  X,
  Loader2,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface GalleryDreamItem {
  id: string;
  dreamText: string;
  interpretation: string | null;
  artUrl: string | null;
  moodTags: string[];
  customTags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: {
    id?: string;
    username: string;
    displayName?: string | null;
  };
  isLiked?: boolean;
}

const CURATED_SAMPLE_DREAMS: GalleryDreamItem[] = [
  {
    id: 'sample-1',
    dreamText: 'Ancient archways touching the sky, I felt a deep sense of forgetting and remembering simultaneously...',
    interpretation: 'This dream resonates with the archetype of the Ruins, symbolizing transitions from old thought patterns to awakening consciousness.',
    artUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    moodTags: ['#Nostalgia', '#Grandeur'],
    customTags: ['The Ruins'],
    likeCount: 2420,
    commentCount: 112,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user: { username: 'echo_wanderer' }
  },
  {
    id: 'sample-2',
    dreamText: 'Floating in a sea of violet ink, there was no up or down, just a profound sense of quiet weightlessness.',
    interpretation: 'A manifestation of the Void archetype, reflecting deep psychological release and inner tranquility.',
    artUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop',
    moodTags: ['#Peace', '#Abstract'],
    customTags: ['The Void'],
    likeCount: 1840,
    commentCount: 45,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    user: { username: 'silent_mind' }
  },
  {
    id: 'sample-3',
    dreamText: 'I followed a figure made of mist through a forest of glass trees. They never spoke, but I understood everything.',
    interpretation: 'Encounter with the Anima/Animus guide archetype, navigating internal wisdom and subconscious intuition.',
    artUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    moodTags: ['#Guidance', '#Mystery'],
    customTags: ['The Anima'],
    likeCount: 3100,
    commentCount: 208,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    user: { username: 'forest_walker' }
  },
  {
    id: 'sample-4',
    dreamText: 'Looking into the floating mirror, I did not see myself, but a dark ocean that felt terrifyingly familiar.',
    interpretation: 'The Shadow archetype confronting deep emotional undercurrents waiting to be acknowledged and integrated.',
    artUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    moodTags: ['#Reflection', '#Fear'],
    customTags: ['The Shadow'],
    likeCount: 1530,
    commentCount: 89,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    user: { username: 'deep_diver' }
  },
  {
    id: 'sample-5',
    dreamText: 'Climbing stairs made of crystal that sang with every step, reaching for a light I could not look at directly.',
    interpretation: 'The Ascension archetype signifying personal evolution, spiritual awakening, and higher aspirations.',
    artUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1000&auto=format&fit=crop',
    moodTags: ['#Journey', '#Light'],
    customTags: ['The Ascent'],
    likeCount: 950,
    commentCount: 34,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    user: { username: 'stair_climber' }
  },
  {
    id: 'sample-6',
    dreamText: 'Time was literally dripping from the trees, and the forest creatures were catching the seconds in jars.',
    interpretation: 'The Trickster archetype playing with perception of time and subconscious urgency.',
    artUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
    moodTags: ['#Surreal', '#Time'],
    customTags: ['The Trickster'],
    likeCount: 4200,
    commentCount: 312,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    user: { username: 'time_weaver' }
  }
];

const DEFAULT_SPOTLIGHT: GalleryDreamItem = {
  id: 'spotlight-hero',
  dreamText: 'I was walking on a path made entirely of soft, pink clouds. Ahead, a massive wooden door stood freely, slightly ajar, radiating a warm, golden light that felt like home...',
  interpretation: 'This dream strongly resonates with the archetype of the Threshold Guardian. The golden light suggests a positive transition or a profound realization waiting in your waking life. The clouds indicate a state of mental elevation.',
  artUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
  moodTags: ['#The Threshold', '#Jungian'],
  customTags: ['Threshold'],
  likeCount: 5280,
  commentCount: 420,
  createdAt: new Date(Date.now() - 172800000).toISOString(),
  user: { username: 'luna_dreamer' }
};

const POPULAR_TAGS = ['#All', '#Lucid', '#Flying', '#Water', '#Maze', '#Threshold', '#Nostalgia'];

export default function GalleryPage() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('#All');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Data state
  const [dreams, setDreams] = useState<GalleryDreamItem[]>([]);
  const [spotlightDream, setSpotlightDream] = useState<GalleryDreamItem>(DEFAULT_SPOTLIGHT);
  const [isLoading, setIsLoading] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});

  // Modal / Detail preview state
  const [selectedDreamModal, setSelectedDreamModal] = useState<GalleryDreamItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('sort', sortBy);
      if (searchQuery.trim()) {
        params.set('symbol', searchQuery.trim());
      } else if (selectedTag && selectedTag !== '#All') {
        params.set('symbol', selectedTag.replace('#', ''));
      }

      const res = await fetch(`/api/gallery?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const dbDreams: GalleryDreamItem[] = data.dreams || [];
        
        if (dbDreams.length > 0) {
          // Set spotlight to highest liked dream
          const sorted = [...dbDreams].sort((a, b) => b.likeCount - a.likeCount);
          setSpotlightDream(sorted[0]);
          setDreams(sorted);
        } else {
          // If search/filter applied and no results in DB, filter samples
          let filteredSamples = CURATED_SAMPLE_DREAMS;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filteredSamples = CURATED_SAMPLE_DREAMS.filter(d => 
              d.dreamText.toLowerCase().includes(q) || 
              d.moodTags.some(t => t.toLowerCase().includes(q)) ||
              d.customTags.some(t => t.toLowerCase().includes(q))
            );
          } else if (selectedTag && selectedTag !== '#All') {
            const tagClean = selectedTag.replace('#', '').toLowerCase();
            filteredSamples = CURATED_SAMPLE_DREAMS.filter(d => 
              d.moodTags.some(t => t.toLowerCase().includes(tagClean)) ||
              d.customTags.some(t => t.toLowerCase().includes(tagClean))
            );
          }
          setDreams(filteredSamples);
          setSpotlightDream(DEFAULT_SPOTLIGHT);
        }
      }
    } catch (err) {
      console.error('Gallery fetch error:', err);
      setDreams(CURATED_SAMPLE_DREAMS);
      setSpotlightDream(DEFAULT_SPOTLIGHT);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, selectedTag, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGallery();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchGallery]);

  const handleToggleLike = async (dreamId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const currentLiked = likedMap[dreamId] ?? false;
    const currentLikes = likeCountMap[dreamId] ?? (dreams.find(d => d.id === dreamId)?.likeCount || 0);

    // Optimistic update
    setLikedMap(prev => ({ ...prev, [dreamId]: !currentLiked }));
    setLikeCountMap(prev => ({
      ...prev,
      [dreamId]: currentLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1
    }));

    try {
      const res = await fetch(`/api/dreams/${dreamId}/like`, { method: 'POST' });
      if (!res.ok) {
        // Revert on error
        setLikedMap(prev => ({ ...prev, [dreamId]: currentLiked }));
        setLikeCountMap(prev => ({ ...prev, [dreamId]: currentLikes }));
      }
    } catch (err) {
      // Revert on error
      setLikedMap(prev => ({ ...prev, [dreamId]: currentLiked }));
      setLikeCountMap(prev => ({ ...prev, [dreamId]: currentLikes }));
    }
  };

  const handleShare = (dream: GalleryDreamItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Dreamola Collective Subconscious',
        text: `"${dream.dreamText.substring(0, 100)}..."`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Dream link copied to clipboard!');
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 glass-panel bg-white/95 text-primary border border-primary/20 px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span className="font-label-md text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Ambient Atmospheric Glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-fixed-dim/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary-fixed-dim/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-tertiary-fixed-dim/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto flex flex-col gap-stack-lg">
        
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center gap-stack-md mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20 text-label-md font-label-md text-primary">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>14,820 Dreams Shared Across 112 Countries</span>
          </div>

          <h1 className="font-display-lg text-display-lg text-on-surface max-w-3xl mx-auto leading-tight">
            The Collective <span className="text-aurora">Subconscious</span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-2">
            Explore a beautifully curated gallery of AI-interpreted dreams from around the world. Discover shared archetypes and surreal landscapes.
          </p>

          {/* Search & Filter Bar */}
          <div className="w-full max-w-2xl mt-6">
            <form 
              onSubmit={(e) => { e.preventDefault(); fetchGallery(); }}
              className="glass-panel rounded-full p-2 flex items-center gap-2 relative shadow-lg"
            >
              <Search className="w-5 h-5 text-outline-variant ml-4 absolute left-3 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archetypes, emotions, or symbols..."
                className="w-full bg-transparent border-none focus:ring-0 text-body-md pl-12 pr-4 text-on-surface placeholder:text-outline-variant outline-none"
              />
              <button 
                type="submit"
                className="aurora-btn rounded-full px-6 py-2.5 font-button text-button text-white whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
              >
                Explore
              </button>
            </form>
          </div>

          {/* Tag Filter Chips & Sort Dropdown */}
          <div className="flex flex-wrap justify-center items-center gap-stack-sm mt-4">
            {POPULAR_TAGS.map((tag) => {
              const isSelected = selectedTag === tag && !searchQuery;
              return (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedTag(tag);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-1.5 rounded-full text-label-md font-label-md transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-white shadow-sm border border-primary' 
                      : 'glass-panel text-on-surface-variant hover:text-primary hover:border-primary/30'
                  }`}
                >
                  {tag}
                </button>
              );
            })}

            <div className="h-6 w-px bg-outline-variant/30 mx-2 self-center hidden sm:block"></div>

            {/* Sort Toggle */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="px-4 py-1.5 rounded-full bg-surface-container text-label-md font-label-md text-primary flex items-center gap-1 border border-primary/20 cursor-pointer shadow-sm"
              >
                <span>{sortBy === 'popular' ? 'Most Resonant' : 'Newest Visions'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-40 glass-panel bg-white/95 rounded-2xl p-1.5 shadow-xl z-30 border border-outline-variant/20 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => { setSortBy('popular'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      sortBy === 'popular' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Most Resonant
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSortBy('recent'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      sortBy === 'recent' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Newest Visions
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Spotlight Dream Feature Card */}
        {spotlightDream && (
          <section className="mt-12 glass-panel rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative group overflow-hidden">
            <div className="w-full md:w-1/2 aspect-square rounded-[1.5rem] overflow-hidden portal-image relative group/img cursor-pointer"
                 onClick={() => setSelectedDreamModal(spotlightDream)}>
              <img 
                src={spotlightDream.artUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop'} 
                alt="Spotlight Dream Art" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white text-xs font-semibold flex items-center gap-1">
                  <Maximize2 className="w-4 h-4" /> Click to Inspect Vision
                </span>
              </div>
              <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/30 text-white font-label-md text-xs flex items-center gap-1.5 shadow-md">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Spotlight
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-stack-md pr-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-secondary-container/30 text-secondary rounded-full font-label-md text-[11px] uppercase tracking-wider border border-secondary/20">
                  {spotlightDream.customTags[0] || 'The Threshold'}
                </span>
                <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full font-label-md text-[11px] uppercase tracking-wider border border-tertiary/20">
                  Jungian
                </span>
              </div>

              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {spotlightDream.customTags[0] || 'The Golden Gateway in the Clouds'}
              </h2>

              <p className="font-headline-md text-headline-md italic text-on-surface-variant/90 font-light leading-relaxed border-l-2 border-primary/40 pl-4 my-2">
                "{spotlightDream.dreamText}"
              </p>

              <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                <strong>AI Insight: </strong>
                {spotlightDream.interpretation || 'This dream strongly resonates with the archetype of transformation, pointing to subconscious clarity and elevated awareness.'}
              </p>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-bold flex items-center justify-center text-sm shadow-sm border border-white">
                    {spotlightDream.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">@{spotlightDream.user.username}</p>
                    <p className="font-body-md text-[12px] text-on-surface-variant">Shared with the Collective</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <button 
                    type="button"
                    onClick={(e) => handleToggleLike(spotlightDream.id, e)}
                    className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center transition-all cursor-pointer ${
                      likedMap[spotlightDream.id] ? 'text-pink-600 bg-pink-50' : 'text-on-surface-variant hover:text-pink-600 hover:bg-pink-50/50'
                    }`}
                    title="Like Dream"
                  >
                    <Heart className={`w-5 h-5 ${likedMap[spotlightDream.id] ? 'fill-pink-600' : ''}`} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleShare(spotlightDream, e)}
                    className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    title="Share Dream"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Symmetrical 3-Column Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 items-start">
          {isLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-label-md text-sm">Synchronizing collective visions...</p>
            </div>
          ) : dreams.length === 0 ? (
            <div className="col-span-full py-16 text-center text-on-surface-variant glass-panel rounded-[2rem] p-12">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
              <h3 className="font-headline-md text-lg text-on-surface">No dreams found</h3>
              <p className="text-xs text-on-surface-variant mt-1">Try another symbol tag or search query.</p>
            </div>
          ) : (
            dreams.map((dream) => {
              const isLiked = likedMap[dream.id] ?? dream.isLiked ?? false;
              const likes = likeCountMap[dream.id] ?? dream.likeCount;

              return (
                <article 
                  key={dream.id}
                  onClick={() => setSelectedDreamModal(dream)}
                  className="glass-panel rounded-[1.5rem] p-4 flex flex-col gap-4 gallery-card cursor-pointer group"
                >
                  {/* Fixed 1:1 Aspect Ratio Image Frame */}
                  <div className="w-full aspect-square rounded-[1rem] overflow-hidden portal-image relative bg-surface-container-high">
                    <img 
                      src={dream.artUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop'} 
                      alt="Dream Art" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/30 text-white font-label-md text-[10px] uppercase font-semibold">
                      {dream.customTags[0] || dream.moodTags[0] || 'Vison'}
                    </div>
                  </div>

                  {/* Standardized Text Content */}
                  <div className="flex-grow flex flex-col gap-2 px-1">
                    <p className="font-headline-md text-[17px] italic text-on-surface-variant leading-snug line-clamp-2">
                      "{dream.dreamText}"
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {dream.moodTags.slice(0, 2).map((mood, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-surface-container rounded-md font-label-md text-[10px] text-on-surface-variant font-medium">
                          {mood.replace('#', '')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pinned Card Footer */}
                  <div className="flex items-center justify-between mt-auto px-1 pt-3 border-t border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {dream.user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-label-md text-[11px] text-on-surface font-semibold truncate max-w-[100px]">
                        @{dream.user.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-on-surface-variant font-label-md text-[11px]">
                      <button 
                        type="button"
                        onClick={(e) => handleToggleLike(dream.id, e)}
                        className={`flex items-center gap-1 hover:text-pink-600 transition-colors cursor-pointer ${
                          isLiked ? 'text-pink-600 font-bold' : ''
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                        <span>{likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{dream.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-16 mb-8 text-center">
          <div className="glass-panel rounded-[2rem] p-12 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-tertiary/5"></div>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                Have a dream lingering in your mind?
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
                Turn your subconscious fragments into visual art and psychological insights. Join the collective gallery.
              </p>
              <Link 
                href="/dream"
                className="aurora-btn rounded-full px-8 py-4 font-button text-button text-[16px] text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2 mt-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>Transcribe Your Dream</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Dream Detail Modal */}
      {selectedDreamModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedDreamModal(null)}
        >
          <div 
            className="glass-panel bg-white/95 rounded-[2.5rem] max-w-2xl w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto border border-white relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setSelectedDreamModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-background cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            {selectedDreamModal.artUrl && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-inner">
                <img 
                  src={selectedDreamModal.artUrl} 
                  alt="Dream artwork" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {selectedDreamModal.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-sm">@{selectedDreamModal.user.username}</span>
                  <span className="text-xs text-on-surface-variant ml-2">• {new Date(selectedDreamModal.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="font-headline-md text-lg italic text-on-surface border-l-2 border-primary/40 pl-3 my-2">
                "{selectedDreamModal.dreamText}"
              </p>

              {selectedDreamModal.interpretation && (
                <div className="p-4 bg-surface-container rounded-2xl text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-background text-sm block mb-1">Subconscious Interpretation:</strong>
                  {selectedDreamModal.interpretation}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
              <div className="flex gap-2">
                {selectedDreamModal.moodTags.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 bg-surface-container rounded-full text-xs text-on-surface-variant font-medium">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleToggleLike(selectedDreamModal.id)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    likedMap[selectedDreamModal.id] 
                      ? 'bg-pink-50 border-pink-200 text-pink-600' 
                      : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedMap[selectedDreamModal.id] ? 'fill-pink-600' : ''}`} />
                  <span>{likeCountMap[selectedDreamModal.id] ?? selectedDreamModal.likeCount}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleShare(selectedDreamModal)}
                  className="p-2 rounded-full border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
