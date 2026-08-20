'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { ArrowLeftIcon, Trash2Icon, GlobeIcon, LockIcon } from 'lucide-react';
import Link from 'next/link';

interface Dream {
  id: string;
  dreamText: string;
  interpretation: string | null;
  artUrl: string | null;
  moodTags: string[];
  customTags: string[];
  isPublic: boolean;
  createdAt: string;
}

export default function DreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`/api/dreams/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Dream not found');
          return res.json();
        })
        .then(data => {
          setDream(data.dream);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          router.push('/journal');
        });
    }
  }, [isAuthenticated, id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dream forever?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/dreams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/journal');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const togglePublic = async () => {
    if (!dream) return;
    setIsUpdatingPublic(true);
    try {
      const res = await fetch(`/api/dreams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !dream.isPublic })
      });
      if (res.ok) {
        const data = await res.json();
        setDream(data.dream);
      }
    } catch (err) {
      console.error(err);
    }
    setIsUpdatingPublic(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#09090e] text-white flex items-center justify-center">
        <div className="text-xl text-white/50 animate-pulse font-serif">Decoding memories...</div>
      </div>
    );
  }

  if (!dream) return null;

  return (
    <div className="min-h-screen bg-[#09090e] text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-8 pb-32 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/journal" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to journal
          </Link>
          <div className="flex gap-2">
            <button
              onClick={togglePublic}
              disabled={isUpdatingPublic}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border font-medium transition-colors ${
                dream.isPublic 
                  ? 'bg-purple-600/20 border-purple-500/30 text-purple-200 hover:bg-purple-600/30' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {dream.isPublic ? <GlobeIcon className="w-4 h-4" /> : <LockIcon className="w-4 h-4" />}
              {dream.isPublic ? 'Public' : 'Private'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors"
            >
              <Trash2Icon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {dream.artUrl && (
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
            <img src={dream.artUrl} alt="AI Generated Art" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mt-4">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-sm tracking-widest uppercase text-white/40 mb-4 font-semibold">The Dream</h2>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-serif whitespace-pre-line">
                {dream.dreamText}
              </p>
            </div>
            
            {dream.interpretation && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/10 border border-purple-500/20 rounded-3xl p-8">
                <h2 className="text-sm tracking-widest uppercase text-purple-300 mb-4 font-semibold">Psychological Reflection</h2>
                <p className="text-lg md:text-xl text-purple-50/90 leading-relaxed font-serif">
                  {dream.interpretation}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm text-white/40 mb-4 uppercase tracking-widest font-semibold">Metadata</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-white/40 block">Recorded on</span>
                  <span className="text-sm text-white/80">
                    {new Date(dream.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </span>
                </div>
                {dream.moodTags.length > 0 && (
                  <div>
                    <span className="text-xs text-white/40 block mb-2">Moods</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dream.moodTags.map(tag => (
                        <span key={tag} className="text-xs bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {dream.customTags.length > 0 && (
                  <div>
                    <span className="text-xs text-white/40 block mb-2">Custom Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dream.customTags.map(tag => (
                        <span key={tag} className="text-xs bg-white/5 text-white/60 px-2.5 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
