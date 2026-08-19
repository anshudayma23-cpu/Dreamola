import { BookIcon, LockIcon, SparklesIcon } from 'lucide-react';

export function Benefits() {
  const benefits = [
    {
      title: 'A Private Sanctuary',
      desc: 'Keep your dreams locked away securely, or choose to share them anonymously with the community.',
      icon: LockIcon
    },
    {
      title: 'Track Your Subconscious',
      desc: 'Your personal Dream Journal helps you spot recurring symbols and themes over time.',
      icon: BookIcon
    },
    {
      title: 'Beautiful Imagery',
      desc: 'Visualizing your dreams makes them easier to remember and helps you process the underlying emotions.',
      icon: SparklesIcon
    }
  ];

  return (
    <section className="py-24 px-4 bg-black/40 border-y border-white/5">
      <div className="max-w-4xl mx-auto space-y-16">
        {benefits.map((benefit, i) => (
          <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <benefit.icon className="w-10 h-10 text-white/80" />
            </div>
            <div className={`text-center md:text-left ${i % 2 !== 0 ? 'md:text-right' : ''}`}>
              <h3 className="text-2xl font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-purple-200/60 leading-relaxed text-lg">{benefit.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
