import { Edit3Icon, Wand2Icon, GlobeIcon } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      title: '1. Describe it',
      desc: 'Type out everything you remember from your dream. The more detail, the better.',
      icon: Edit3Icon
    },
    {
      title: '2. Reveal meaning',
      desc: 'Our engine identifies key symbols and provides a gentle, psychological interpretation.',
      icon: Wand2Icon
    },
    {
      title: '3. Generate art',
      desc: 'With one click, create a stunning, surreal illustration of your subconscious vision.',
      icon: GlobeIcon
    }
  ];

  return (
    <section className="py-24 px-4 bg-black/40 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-16 text-white">How Dreamola Works</h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(138,43,226,0.15)]">
                <step.icon className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-purple-200/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
