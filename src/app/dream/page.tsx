'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginModal } from '@/components/auth/LoginModal';
import { 
  Sparkles, 
  Eye, 
  Waves, 
  Wand2, 
  Plus, 
  Key, 
  Droplet, 
  Sun, 
  Download, 
  Maximize2, 
  Bookmark, 
  Globe, 
  Share2, 
  RotateCcw, 
  Loader2,
  Code2,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DEFAULT_MOODS = [
  { label: '#Lucid', icon: Eye },
  { label: '#Floating', icon: Waves },
  { label: '#Mystical', icon: Wand2 },
  { label: '#Anxious', icon: null },
  { label: '#Nostalgic', icon: null },
  { label: '#Nightmare', icon: null },
  { label: '#Oceanic', icon: null },
];

export default function DreamPage() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Form states
  const [dreamText, setDreamText] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['#Floating']);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [depthMode, setDepthMode] = useState<'deep' | 'surface'>('deep');
  const [artStyleMode, setArtStyleMode] = useState<'surreal' | 'literal'>('surreal');

  // Generation & Result states
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [matchedSymbols, setMatchedSymbols] = useState<string[]>([]);
  const [disclaimer, setDisclaimer] = useState('');
  
  const [storyArtUrl, setStoryArtUrl] = useState('');
  const [subconsciousArtUrl, setSubconsciousArtUrl] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingSubconscious, setIsGeneratingSubconscious] = useState(false);
  const [isStoryArtLoaded, setIsStoryArtLoaded] = useState(false);
  const [isSubconsciousArtLoaded, setIsSubconsciousArtLoaded] = useState(false);
  
  const [isAnalyzingArt, setIsAnalyzingArt] = useState(false);
  const [artAnalysis, setArtAnalysis] = useState('');
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [savedDreamId, setSavedDreamId] = useState<string | null>(null);

  useEffect(() => {
    setIsStoryArtLoaded(false);
  }, [storyArtUrl]);

  useEffect(() => {
    setIsSubconsciousArtLoaded(false);
  }, [subconsciousArtUrl]);

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const formatted = customTagInput.trim().startsWith('#') 
        ? customTagInput.trim() 
        : `#${customTagInput.trim()}`;
      if (!customTags.includes(formatted)) {
        setCustomTags([...customTags, formatted]);
      }
      setCustomTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleInterpret = async () => {
    if (!dreamText.trim() || dreamText.length < 5) {
      setError('Please describe your dream in at least a few words.');
      return;
    }

    setIsInterpreting(true);
    setError('');
    setIsSaved(false);
    setShareSuccess(false);
    setSavedDreamId(null);
    setStoryArtUrl('');
    setSubconsciousArtUrl('');
    setArtAnalysis('');

    try {
      const res = await fetch('/api/dreams/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dreamText, 
          moodTags: selectedMoods, 
          customTags,
          depthMode
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to interpret dream');
      
      setInterpretation(data.interpretation);
      setMatchedSymbols(data.matchedSymbols || []);
      setDisclaimer(data.disclaimer || '');

      // Auto-save to journal for logged-in users
      if (isAuthenticated) {
        try {
          const saveRes = await fetch('/api/dreams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dreamText,
              interpretation: data.interpretation,
              moodTags: selectedMoods,
              customTags,
              isPublic: false,
            })
          });
          if (saveRes.ok) {
            const saveData = await saveRes.json();
            setSavedDreamId(saveData.dream?.id || null);
            setIsSaved(true);
          }
        } catch (saveErr) {
          console.error('Auto-save failed:', saveErr);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while decoding your dream.');
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleGenerateArt = async (type: 'literal' | 'feeling') => {
    if (!dreamText.trim() || dreamText.length < 5) {
      setError('Please enter a dream transcription first before generating artwork.');
      return;
    }

    if (type === 'literal') {
      setIsGeneratingStory(true);
      setIsStoryArtLoaded(false);
    } else {
      setIsGeneratingSubconscious(true);
      setIsSubconsciousArtLoaded(false);
    }
    setError('');

    try {
      const res = await fetch('/api/dreams/generate-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dreamText, 
          interpretation: interpretation || undefined,
          type,
          styleMode: artStyleMode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 && !isAuthenticated) {
          setShowLoginModal(true);
        }
        throw new Error(data.error || 'Failed to generate dream visualization');
      }
      
      if (type === 'literal') {
        setStoryArtUrl(data.url);
      } else {
        setSubconsciousArtUrl(data.url);
      }

      // Auto-update the saved dream with the art URL
      if (savedDreamId && data.url) {
        try {
          await fetch(`/api/dreams/${savedDreamId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artUrl: data.url })
          });
        } catch (patchErr) {
          console.error('Failed to update dream art:', patchErr);
        }
      }
    } catch (err: any) {
      console.error('Art generation error:', err);
      setError(err.message || 'Failed to generate art');
    } finally {
      if (type === 'literal') setIsGeneratingStory(false);
      else setIsGeneratingSubconscious(false);
    }
  };

  const handleDecodeArt = async () => {
    if (!subconsciousArtUrl) return;
    setIsAnalyzingArt(true);
    setError('');
    try {
      const res = await fetch('/api/dreams/decode-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artUrl: subconsciousArtUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to decode art symbols');
      setArtAnalysis(data.analysis);
      setIsAnalysisExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to decode subconscious art symbols.');
    } finally {
      setIsAnalyzingArt(false);
    }
  };

  const handleSaveToJournal = async () => {
    if (!isAuthenticated) {
      setPendingAction('save');
      setShowLoginModal(true);
      return;
    }
    if (!dreamText.trim()) return;

    try {
      const res = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamText,
          interpretation: interpretation || undefined,
          artUrl: storyArtUrl || subconsciousArtUrl || undefined,
          moodTags: selectedMoods,
          customTags,
          isPublic: false,
        })
      });

      if (res.ok) {
        setIsSaved(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save dream to journal');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save dream');
    }
  };

  const handleShareToGallery = async () => {
    if (!isAuthenticated) {
      setPendingAction('share');
      setShowLoginModal(true);
      return;
    }
    if (!dreamText.trim()) return;

    try {
      const res = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamText,
          interpretation: interpretation || undefined,
          artUrl: storyArtUrl || subconsciousArtUrl || undefined,
          moodTags: selectedMoods,
          customTags,
          isPublic: true,
        })
      });

      if (res.ok) {
        setShareSuccess(true);
        setIsSaved(true); // Also mark as saved since it's now in DB
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to share dream');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to share dream');
    }
  };

  const handleReset = () => {
    setDreamText('');
    setInterpretation('');
    setStoryArtUrl('');
    setSubconsciousArtUrl('');
    setArtAnalysis('');
    setError('');
    setIsSaved(false);
    setShareSuccess(false);
    setSavedDreamId(null);
  };

  return (
    <div className="text-on-background min-h-screen flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-container pt-20">
      
      {/* Main Canvas Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col gap-10">
        
        {/* Page Header */}
        <header className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="font-display-lg text-display-lg text-on-background">
            The Dream Canvas <br/>
            <span className="text-gradient">Subconscious to Art</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Transcribe your nightly vision to uncover hidden archetypes and manifest visual realities.
          </p>
        </header>

        {/* Error notification banner */}
        {error && (
          <div className="max-w-3xl mx-auto w-full p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dream Input Studio Section */}
        <section className="glass-card rounded-[3rem] p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden">
          <div className="absolute inset-0 rounded-[3rem] border border-white/40 pointer-events-none"></div>
          
          {/* Text Input Area */}
          <div className="flex flex-col gap-3">
            <label className="font-label-md text-label-md text-primary uppercase tracking-wider" htmlFor="dream-input">
              Dream Transcription
            </label>
            <textarea 
              id="dream-input"
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isInterpreting && dreamText.trim().length >= 5) {
                    handleInterpret();
                  }
                }
              }}
              placeholder="I was standing before a giant wooden door in a sea of clouds..." 
              rows={5}
              disabled={isInterpreting}
              className="w-full bg-surface/50 border-0 rounded-2xl p-6 font-body-lg text-body-lg text-on-background focus:ring-2 focus:ring-primary-container placeholder-on-surface-variant/50 resize-none transition-all outline-none"
            />
          </div>

          {/* Mood & Themes Chips */}
          <div className="flex flex-col gap-stack-md">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">Mood & Themes</span>
            <div className="flex flex-wrap gap-3 items-center">
              {DEFAULT_MOODS.map(({ label, icon: Icon }) => {
                const isSelected = selectedMoods.includes(label);
                return (
                  <button 
                    key={label}
                    type="button"
                    onClick={() => toggleMood(label)}
                    className={`px-4 py-2 rounded-full border font-label-md text-label-md flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-primary-fixed-dim/40 bg-primary-container/20 text-primary shadow-sm' 
                        : 'border-primary-fixed-dim/30 bg-surface-container-lowest/50 text-on-background hover:bg-primary-container/20'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 text-primary" />}
                    {label}
                  </button>
                );
              })}

              {/* Custom Tags */}
              {customTags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-label-md text-label-md flex items-center gap-2"
                >
                  {tag}
                  <button 
                    type="button"
                    onClick={() => setCustomTags(tags => tags.filter(t => t !== tag))} 
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              {/* Add Custom Tag Button/Input */}
              {isAddingTag ? (
                <div className="flex items-center gap-1 bg-surface-container-lowest/80 border border-outline-variant/30 rounded-full px-3 py-1">
                  <input
                    type="text"
                    placeholder="tag name..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    autoFocus
                    className="bg-transparent font-label-md text-sm text-on-background outline-none w-24"
                  />
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTag(false)}
                    className="text-on-surface-variant hover:text-on-background"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="px-4 py-2 rounded-full border border-outline-variant/30 text-on-surface-variant border-dashed hover:bg-surface-container transition-colors flex items-center gap-1 font-label-md text-label-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
          </div>

          {/* Controls & Submission */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-outline-variant/10">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Depth Toggle */}
              <div className="bg-surface-container-low rounded-full p-1 flex items-center shadow-inner">
                <div className="relative group">
                  <button 
                    type="button"
                    onClick={() => setDepthMode('deep')}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      depthMode === 'deep' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-background'
                    }`}
                  >
                    Deep Dive
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-outline-variant/20 text-on-surface px-4 py-2 rounded-2xl font-label-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                    Find hidden archetypes
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-t border-l border-outline-variant/20 rotate-45"></div>
                  </div>
                </div>
                
                <div className="relative group">
                  <button 
                    type="button"
                    onClick={() => setDepthMode('surface')}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      depthMode === 'surface' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-background'
                    }`}
                  >
                    Surface
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-outline-variant/20 text-on-surface px-4 py-2 rounded-2xl font-label-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                    Literal dream summary
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-t border-l border-outline-variant/20 rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Art Style Toggle */}
              <div className="bg-surface-container-low rounded-full p-1 flex items-center shadow-inner">
                <div className="relative group">
                  <button 
                    type="button"
                    onClick={() => setArtStyleMode('surreal')}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      artStyleMode === 'surreal' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-background'
                    }`}
                  >
                    Surreal Art
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-outline-variant/20 text-on-surface px-4 py-2 rounded-2xl font-label-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                    Abstract emotional painting
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-t border-l border-outline-variant/20 rotate-45"></div>
                  </div>
                </div>

                <div className="relative group">
                  <button 
                    type="button"
                    onClick={() => setArtStyleMode('literal')}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      artStyleMode === 'literal' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-background'
                    }`}
                  >
                    Literal
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-outline-variant/20 text-on-surface px-4 py-2 rounded-2xl font-label-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                    Photorealistic scene render
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-t border-l border-outline-variant/20 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <button 
              type="button"
              onClick={handleInterpret}
              disabled={isInterpreting || dreamText.length < 5}
              className="aurora-btn w-full md:w-auto px-8 py-4 rounded-full text-on-primary font-button text-button flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInterpreting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Decoding Subconscious...</span>
                </>
              ) : (
                <>
                  <span>Decode Dream & Manifest Art</span>
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Decoded Interpretation Section */}
        {interpretation && (
          <section className="glass-card rounded-[2rem] p-8 flex flex-col gap-6 relative animate-fadeIn">
            {/* Resonance Badge */}
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>98% Archetypal Resonance</span>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-background border-b border-outline-variant/10 pb-4">
              Subconscious Unveiled
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: Jungian Archetype */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <Key className="w-5 h-5 text-primary" />
                  <h3 className="font-label-md text-label-md uppercase tracking-wide">Jungian Archetype</h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {matchedSymbols.length > 0 ? (
                    <>
                      The presence of <strong className="text-on-background">{matchedSymbols.join(', ')}</strong> signifies a threshold between conscious choice and hidden potential.
                    </>
                  ) : (
                    "This narrative reflects an encounter with the threshold archetype, representing transition and unexplored inner depths."
                  )}
                </p>
              </div>

              {/* Pillar 2: Emotional Undercurrent */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-secondary">
                  <Droplet className="w-5 h-5 text-secondary" />
                  <h3 className="font-label-md text-label-md uppercase tracking-wide">Emotional Undercurrent</h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {interpretation.length > 120 
                    ? interpretation.substring(0, 180) + '...' 
                    : interpretation}
                </p>
              </div>

              {/* Pillar 3: Awakening Reflection */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-tertiary">
                  <Sun className="w-5 h-5 text-tertiary" />
                  <h3 className="font-label-md text-label-md uppercase tracking-wide">Awakening Reflection</h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  You are being invited to step into a new phase of understanding. What opportunity or feeling are you currently hesitating to open the door to?
                </p>
              </div>
            </div>

            {disclaimer && (
              <p className="text-xs text-on-surface-variant/60 italic pt-2 border-t border-outline-variant/10">
                {disclaimer}
              </p>
            )}
          </section>
        )}

        {/* Dual Art Engine Visualizer Cards - items-start prevents empty blank stretch */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Card 1: Literal Dream Scene */}
          <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col group">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-white/40">
              <h3 className="font-headline-md text-headline-md text-on-background text-lg">Literal Dream Scene</h3>
              <div className="flex gap-2">
                {storyArtUrl && (
                  <>
                    <a 
                      href={storyArtUrl} 
                      download="dream-literal.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-surface-container p-2 rounded-full text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors" 
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <a 
                      href={storyArtUrl} 
                      target="_blank"
                      rel="noreferrer"
                      className="bg-surface-container p-2 rounded-full text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors" 
                      title="Full View"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="relative w-full aspect-square md:aspect-video lg:aspect-square p-4 bg-surface-container-low/50 flex items-center justify-center">
              {isGeneratingStory ? (
                <div className="w-full h-full rounded-xl border border-outline-variant/20 bg-white/40 flex flex-col items-center justify-center relative overflow-hidden">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-primary font-label-md text-label-md animate-pulse">
                    Rendering literal scene...
                  </p>
                </div>
              ) : storyArtUrl ? (
                <div className="w-full h-full rounded-xl overflow-hidden shadow-inner relative animate-fadeIn">
                  <img 
                    src={storyArtUrl} 
                    alt="Literal dream visual scene" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl transition-all duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 z-20">
                    <span className="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-label-md flex items-center gap-1.5 shadow-sm">
                      <Code2 className="w-3.5 h-3.5 text-purple-300" /> Prompt Extract
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Visualize the literal narrative with high-definition fine art aesthetics.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateArt('literal')}
                    className="btn-aurora px-6 py-2.5 rounded-full font-button text-sm cursor-pointer"
                  >
                    Paint Literal Scene
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Subconscious Emotion */}
          <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-white/40">
              <h3 className="font-headline-md text-headline-md text-on-background text-lg">Subconscious Emotion</h3>
              <div className="flex items-center gap-2">
                {subconsciousArtUrl && !artAnalysis && !isAnalyzingArt && (
                  <button 
                    type="button"
                    onClick={handleDecodeArt}
                    className="text-secondary font-label-md text-label-md hover:underline flex items-center gap-1 cursor-pointer mr-1"
                  >
                    <Sparkles className="w-4 h-4" /> Decode Art Symbols
                  </button>
                )}
                {subconsciousArtUrl && (
                  <>
                    <a 
                      href={subconsciousArtUrl} 
                      download="dream-subconscious.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-surface-container p-2 rounded-full text-secondary hover:bg-secondary-container hover:text-on-secondary-container transition-colors" 
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <a 
                      href={subconsciousArtUrl} 
                      target="_blank"
                      rel="noreferrer"
                      className="bg-surface-container p-2 rounded-full text-secondary hover:bg-secondary-container hover:text-on-secondary-container transition-colors" 
                      title="Full View"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="relative w-full aspect-square md:aspect-video lg:aspect-square p-4 bg-surface-container-low/50 flex items-center justify-center">
              {isGeneratingSubconscious ? (
                <div className="w-full h-full rounded-xl border border-outline-variant/20 bg-white/40 flex flex-col items-center justify-center relative overflow-hidden">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin mb-3" />
                  <p className="text-secondary font-label-md text-label-md animate-pulse">
                    Generating subconscious emotion...
                  </p>
                </div>
              ) : subconsciousArtUrl ? (
                <div className="w-full h-full rounded-xl overflow-hidden shadow-inner relative animate-fadeIn">
                  <img 
                    src={subconsciousArtUrl} 
                    alt="Subconscious abstract painting" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl transition-all duration-700 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Manifest the subconscious psychological energy as surreal watercolor art.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateArt('feeling')}
                    className="btn-aurora px-6 py-2.5 rounded-full font-button text-sm cursor-pointer"
                  >
                    Paint Subconscious Art
                  </button>
                </div>
              )}
            </div>

            {/* Decoded Art Symbols Breakdown */}
            {isAnalyzingArt && (
              <div className="p-4 mx-4 my-4 bg-surface-container rounded-2xl flex items-center justify-center gap-2 text-primary font-label-md text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Decoding visual symbols with Gemini...</span>
              </div>
            )}

            {artAnalysis && (
              <div className="p-5 mx-4 my-4 bg-surface-container rounded-2xl border border-outline-variant/20 flex flex-col gap-2.5 animate-fadeIn">
                <div 
                  onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                  className="flex items-center justify-between cursor-pointer select-none text-primary"
                >
                  <div className="flex items-center gap-2 font-label-md text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Visual Symbols Decoded:</span>
                  </div>
                  <button type="button" className="text-primary hover:opacity-80">
                    {isAnalysisExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isAnalysisExpanded && (
                  <div className="text-xs text-on-surface-variant space-y-2 leading-relaxed pt-1 border-t border-outline-variant/10">
                    {artAnalysis.split('\n')
                      .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
                      .map((line, idx) => {
                        const cleanLine = line.replace(/^[\*\-]\s*/, '').replace(/\*\*/g, '');
                        const colonIndex = cleanLine.indexOf(':');
                        if (colonIndex > -1) {
                          const title = cleanLine.substring(0, colonIndex);
                          const desc = cleanLine.substring(colonIndex + 1);
                          return (
                            <p key={idx}>
                              <strong className="text-on-background font-semibold">{title}:</strong>{desc}
                            </p>
                          );
                        }
                        return <p key={idx}>{cleanLine}</p>;
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Floating Vault Action Bar */}
      {interpretation && (
        <aside 
          aria-label="Dream actions"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-xl border border-outline-variant/20 shadow-[0_8px_32px_rgba(30,27,75,0.1)] rounded-full px-3 py-2 flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
        >
          <button 
            type="button"
            onClick={handleSaveToJournal}
            disabled={isSaved}
            className={`px-4 py-2.5 rounded-full font-label-md text-label-md flex items-center gap-2 transition-colors cursor-pointer ${
              isSaved 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface-variant hover:bg-primary-container/20 hover:text-primary'
            }`}
          >
            <Bookmark className="w-4 h-4" /> 
            <span>{isSaved ? 'Saved to Journal' : 'Save to Private Journal'}</span>
          </button>

          <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>

          <button 
            type="button"
            onClick={handleShareToGallery}
            className={`px-4 py-2.5 rounded-full font-label-md text-label-md flex items-center gap-2 transition-colors cursor-pointer ${
              shareSuccess 
                ? 'bg-secondary-container text-on-secondary-container' 
                : 'text-on-surface-variant hover:bg-primary-container/20 hover:text-primary'
            }`}
          >
            <Globe className="w-4 h-4" /> 
            <span>{shareSuccess ? 'Shared Anonymously!' : 'Share Anonymously'}</span>
          </button>

          <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>

          <button 
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My Dream Interpretation', text: dreamText });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Dream link copied to clipboard!');
              }
            }}
            className="px-4 py-2.5 rounded-full text-on-surface-variant hover:bg-primary-container/20 hover:text-primary font-label-md text-label-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> 
            <span>Export Dream Card</span>
          </button>

          <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>

          <button 
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> 
            <span>New Dream</span>
          </button>
        </aside>
      )}

      {/* Spacing for floating bar */}
      <div className="h-28"></div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          setPendingAction(null);
        }} 
      />
    </div>
  );
}
