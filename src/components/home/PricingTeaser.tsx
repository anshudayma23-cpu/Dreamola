import Link from 'next/link';

export function PricingTeaser() {
  return (
    <section className="py-32 px-4 text-center">
      <div className="max-w-2xl mx-auto bg-gradient-to-b from-indigo-900/20 to-purple-900/10 border border-purple-500/20 rounded-3xl p-12 backdrop-blur-sm shadow-[0_0_50px_rgba(138,43,226,0.1)]">
        <h2 className="text-3xl font-serif text-white mb-4">Start your journey today</h2>
        <p className="text-purple-200/70 mb-8">
          Get 5 free interpretations and 3 free art generations every single day. Upgrade anytime for unlimited access and deep psychological insights.
        </p>
        <Link href="/dream" className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-xl">
          Try for free
        </Link>
      </div>
    </section>
  );
}
