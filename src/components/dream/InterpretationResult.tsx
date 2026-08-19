export function InterpretationResult({ interpretation, disclaimer }: { interpretation: string, disclaimer: string }) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-[0_0_30px_rgba(138,43,226,0.15)]">
      <h2 className="text-sm tracking-widest uppercase text-purple-300 mb-4 font-semibold">The Meaning</h2>
      <p className="text-lg md:text-xl text-purple-50 leading-relaxed font-serif">
        {interpretation}
      </p>
      <div className="mt-6 pt-6 border-t border-purple-500/20">
        <p className="text-xs text-purple-300/60 italic">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
