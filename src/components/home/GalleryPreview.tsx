export function GalleryPreview() {
  // Hardcoded for now. In Phase 4, we will fetch this from the DB.
  const dreams = [
    { img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', tags: ['Scary', '#falling'] },
    { img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop', tags: ['Calm', '#ocean'] },
    { img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=600&auto=format&fit=crop', tags: ['Lucid', '#flying'] },
    { img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop', tags: ['Confusing', '#doors'] },
    { img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop', tags: ['Exciting', '#space'] },
    { img: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=600&auto=format&fit=crop', tags: ['Sad', '#lost'] }
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-4 text-white">Dreams from the Community</h2>
        <p className="text-center text-purple-200/60 mb-16">A glimpse into the collective subconscious.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {dreams.map((dream, i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <img src={dream.img} alt="Dream art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="flex gap-2">
                  {dream.tags.map(tag => (
                    <span key={tag} className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-white">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
