import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      
      <h1 className="text-5xl md:text-7xl font-serif text-white font-bold mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(138,43,226,0.3)]">
        Turn your dreams into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 glow-text">art.</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-purple-200/80 mb-10 max-w-2xl font-light">
        Discover the hidden meanings behind your dreams and generate breathtaking AI illustrations of your subconscious mind.
      </p>
      
      <Link href="/dream" className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105">
        Interpret a Dream — Free
      </Link>
    </section>
  );
}
