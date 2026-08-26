'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit3, Brain, Palette, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [dreamPrompt, setDreamPrompt] = useState('');

  const handleInterpret = (e: React.FormEvent) => {
    e.preventDefault();
    if (dreamPrompt.trim()) {
      router.push(`/dream?prompt=${encodeURIComponent(dreamPrompt)}`);
    } else {
      router.push('/dream');
    }
  };

  const handleSymbolClick = (symbol: string) => {
    setDreamPrompt(prev => prev ? `${prev} with ${symbol.toLowerCase()}` : `I was walking through a ${symbol.toLowerCase()}...`);
  };

  return (
    <main className="pt-6 md:pt-8 pb-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto space-y-24">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-stack-lg items-center">
        <div className="space-y-stack-lg">
          <h1 className="font-display-lg text-display-lg text-on-surface">
            Turn Nightly Dreams into <span className="text-gradient">Living Art</span> &amp; Hidden Meanings
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
            Describe your dream. Our AI will visualize its essence and decode the subconscious symbols hidden within.
          </p>

          <form onSubmit={handleInterpret} className="glass-panel rounded-full p-2 flex items-center gap-2 max-w-lg">
            <span className="text-[#7b7487] ml-4">
              <Edit3 className="w-5 h-5" />
            </span>
            <input 
              type="text"
              value={dreamPrompt}
              onChange={(e) => setDreamPrompt(e.target.value)}
              placeholder="I was walking through a forest of glass trees..."
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-body-md placeholder:text-outline-variant py-2 font-normal text-[#181445]"
            />
            <button 
              type="submit"
              className="btn-aurora text-white font-button text-button px-6 py-3 rounded-full whitespace-nowrap hover:scale-95 transition-transform cursor-pointer"
            >
              Interpret Free
            </button>
          </form>

          <div className="flex flex-wrap gap-stack-xs">
            <button 
              type="button" 
              onClick={() => handleSymbolClick('Flying')} 
              className="px-3.5 py-1 bg-white/50 border border-outline-variant/30 rounded-full font-label-md text-label-md text-secondary hover:bg-white transition-colors cursor-pointer"
            >
              #Flying
            </button>
            <button 
              type="button" 
              onClick={() => handleSymbolClick('Ocean')} 
              className="px-3.5 py-1 bg-white/50 border border-outline-variant/30 rounded-full font-label-md text-label-md text-tertiary hover:bg-white transition-colors cursor-pointer"
            >
              #Ocean
            </button>
            <button 
              type="button" 
              onClick={() => handleSymbolClick('Mirror')} 
              className="px-3.5 py-1 bg-white/50 border border-outline-variant/30 rounded-full font-label-md text-label-md text-primary hover:bg-white transition-colors cursor-pointer"
            >
              #Mirror
            </button>
            <button 
              type="button" 
              onClick={() => handleSymbolClick('Falling')} 
              className="px-3.5 py-1 bg-white/50 border border-outline-variant/30 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-white transition-colors cursor-pointer"
            >
              #Falling
            </button>
            <button 
              type="button" 
              onClick={() => handleSymbolClick('Doors')} 
              className="px-3.5 py-1 bg-white/50 border border-outline-variant/30 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-white transition-colors cursor-pointer"
            >
              #Doors
            </button>
          </div>
        </div>

        <Link href="/dream" className="relative w-full aspect-[4/3] glass-panel border-0 rounded-[24px] overflow-hidden shadow-xl flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-500">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdlPjL4jTAi2ny6qqEGEopSRyX8AMW1jSPbftp46kx4aEZK3IQwH7m9s4GG2sQ3NtngNydEb1JUP2XLkPg3fWpgZ2ebpF-mP4JLwTgshEbifh-NACR0r4lZ_Z0eJQClW6VOanBnhqWUUmfeTGw6Mmk6ML8uReBnL5EfUm-L1ebMEixy3KgLgz5EwxbYFGlJ5kNfAbIBFZsP4s8CLcTdVhaz3qIZtDiK4XcUIo4w3di3JF4MbbPxsdi"
            alt="A soft surrealist fine-art oil painting of a glowing wooden doorway standing alone in an infinite, quiet sea of clouds under a soft crescent moon."
            className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-label-md text-label-md border border-white/30">
              Dream Extract: Clarity
            </span>
            <div className="flex gap-2">
              <span className="bg-black/20 backdrop-blur-md text-white px-3 py-1 rounded-full font-label-md text-[12px] border border-white/20">
                Literal Scene
              </span>
              <span className="bg-black/20 backdrop-blur-md text-white px-3 py-1 rounded-full font-label-md text-[12px] border border-white/20">
                Emotion
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Live Stats */}
      <section className="flex flex-wrap justify-center gap-stack-md py-6">
        <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <span className="font-label-md text-label-md text-on-surface-variant">42,000+ Symbols Decoded</span>
        </div>
        <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-label-md text-label-md text-on-surface-variant">150k+ Dreams Visualized</span>
        </div>
        <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-2">
          <span className="text-xl">🌙</span>
          <span className="font-label-md text-label-md text-on-surface-variant">99% Clarity Rating</span>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="grid md:grid-cols-3 gap-stack-md">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Subconscious Decoder</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Advanced NLP extracts core themes and emotions from your narrative.
          </p>
          <div className="mt-auto pt-4 flex gap-2">
            <span className="bg-surface-container px-2 py-1 rounded-full font-label-md text-[10px] text-primary">Jungian</span>
            <span className="bg-surface-container px-2 py-1 rounded-full font-label-md text-[10px] text-primary">Freudian</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Dual Art Engine</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Generates both literal scenes and abstract emotional landscapes.
          </p>
          <div className="mt-auto pt-4 flex gap-2">
            <span className="bg-surface-container px-2 py-1 rounded-full font-label-md text-[10px] text-secondary">Surrealism</span>
            <span className="bg-surface-container px-2 py-1 rounded-full font-label-md text-[10px] text-secondary">Ethereal</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Private Vault</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your dreams are deeply personal. Keep them secure or share anonymously.
          </p>
          <div className="mt-auto pt-4 flex gap-2">
            <span className="bg-surface-container px-2 py-1 rounded-full font-label-md text-[10px] text-tertiary">E2E Encrypted</span>
          </div>
        </div>
      </section>

      {/* Community Gallery */}
      <section className="space-y-stack-md">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Ethereal Gallery</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Recent anonymous dream visualizations.</p>
          </div>
          <Link href="/gallery" className="btn-glass px-4 py-2 rounded-full font-button text-button text-on-surface flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm">
          <Link href="/gallery" className="flex flex-col gap-3 group cursor-pointer">
            <div className="glass-panel border-0 rounded-[24px] overflow-hidden aspect-[3/4] relative shadow-md">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG3J_HaKHTNdL1HnzGRVLdN7nri9iZn9sfZwbyxV65b5wFfRcmgu4NoL5A19cdSEXey6B9xB7cduKWO7AlCVBSdbUmhyoLrJ17tyDaz-MBbJNg-Fu5JEPf2v9bQqYV-JcS2MHrXic15wmGL_W-LJilogFw0kj_2loIdiTAxMHi316Z9DglxBL6hcIRyzbsDf7ooI8yjJ9Mebtvg2JEBteciMCqBEOelAR_WjitJPBPoQLAFttj80vV" 
                alt="Levitating Ruins"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-1 px-2">
              <span className="font-label-md text-on-surface">Levitating Ruins</span>
              <span className="bg-surface-container w-fit px-2 py-1 rounded-md text-primary font-label-md text-[10px]">Literal Dream Scene</span>
            </div>
          </Link>

          <Link href="/gallery" className="flex flex-col gap-3 group cursor-pointer">
            <div className="glass-panel border-0 rounded-[24px] overflow-hidden aspect-[3/4] relative shadow-md">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPPMKB8li5V38om-LXJMEgjoDW-ClkKRVnSKEAdoJqxHFPejwPmyLoLaEkeY6qugJxXZyqDaTryrz9lxJT19wL-_ZFzTuTdnlGl9oUuKDT9F45zMvLNf2p7sBb5jLknkit6jI4GB7f7O72I0yTRXWgAULKwlieOv2216R4Nd2j08ZefmqB_8VjUGbrbdcDKBitb6dFrt0R_q6XRPdsaUMOz2p4hund-WnVH1H1UBuJ-ymaxK_SS3fn" 
                alt="Lilac Fog"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-1 px-2">
              <span className="font-label-md text-on-surface">Lilac Fog</span>
              <span className="bg-surface-container w-fit px-2 py-1 rounded-md text-secondary font-label-md text-[10px]">Subconscious Emotion</span>
            </div>
          </Link>

          <Link href="/gallery" className="flex flex-col gap-3 group cursor-pointer">
            <div className="glass-panel border-0 rounded-[24px] overflow-hidden aspect-[3/4] relative shadow-md">
              <img 
                src="/images/ethereal_figure.jpg" 
                alt="Ethereal Figure"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-1 px-2">
              <span className="font-label-md text-on-surface">Ethereal Figure</span>
              <span className="bg-surface-container w-fit px-2 py-1 rounded-md text-tertiary font-label-md text-[10px]">Subconscious Emotion</span>
            </div>
          </Link>

          <Link href="/gallery" className="flex flex-col gap-3 group cursor-pointer">
            <div className="glass-panel border-0 rounded-[24px] overflow-hidden aspect-[3/4] relative shadow-md">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFzUA0-ABGMooUoDOkrT0qOOgYwxmjKYedqhljMYk-Pfq9fx0Uc972X-MGqPkzUME6Z7XojZK-DsOgkBF95VKv016dPOICl74iA9yev0ekUxT_YhBWrFw-Tzjd5--tY6y2KTgziAQaoeRznnPXcViKK5HsD6BmNMNwUzAmnipwab-yMiyfHGtcdVp9jcxgWvduH5s8isYAZF4_T_9TWs6ULiOx7nPEzvBDaE9VwdnhcLWHVsC5GtnK" 
                alt="Cloud Mirror"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-1 px-2">
              <span className="font-label-md text-on-surface">Cloud Mirror</span>
              <span className="bg-surface-container w-fit px-2 py-1 rounded-md text-primary font-label-md text-[10px]">Literal Dream Scene</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
