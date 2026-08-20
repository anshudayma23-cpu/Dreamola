import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { UserIcon, ArrowLeftIcon, SparklesIcon, Share2Icon, FlagIcon } from 'lucide-react';
import { LikeButton } from '@/components/community/LikeButton';
import { CommentThread } from '@/components/community/CommentThread';
import { FollowButton } from '@/components/community/FollowButton';
import { VideoBadge } from '@/components/dream/VideoBadge';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dream = await prisma.dream.findUnique({
    where: { id },
    include: { user: { select: { username: true } } }
  });

  if (!dream || !dream.isPublic) {
    return {
      title: 'Dream Not Found — Dreamola',
      robots: { index: false }
    };
  }

  const snippet = dream.interpretation
    ? dream.interpretation.slice(0, 150) + '...'
    : dream.dreamText.slice(0, 150) + '...';

  const title = `Dream by @${dream.user.username} — Dreamola`;

  return {
    title,
    description: snippet,
    openGraph: {
      title,
      description: snippet,
      images: dream.artUrl ? [{ url: dream.artUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: snippet,
      images: dream.artUrl ? [dream.artUrl] : [],
    }
  };
}

export default async function PublicDreamDetailPage({ params }: Props) {
  const { id } = await params;
  const dream = await prisma.dream.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          createdAt: true,
        }
      },
      symbols: {
        include: {
          symbol: true
        }
      }
    }
  });

  if (!dream || !dream.isPublic) {
    notFound();
  }

  // Related dreams
  const relatedDreams = await prisma.dream.findMany({
    where: {
      isPublic: true,
      id: { not: dream.id },
      OR: [
        { moodTags: { hasSome: dream.moodTags } },
        { customTags: { hasSome: dream.customTags } },
      ]
    },
    take: 3,
    select: {
      id: true,
      dreamText: true,
      artUrl: true,
      likeCount: true,
    }
  });

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Dream shared by @${dream.user.username}`,
    description: dream.interpretation || dream.dreamText,
    image: dream.artUrl || undefined,
    datePublished: dream.createdAt.toISOString(),
    author: {
      '@type': 'Person',
      name: dream.user.displayName || dream.user.username,
      url: `/u/${dream.user.username}`,
    },
  };

  return (
    <div className="min-h-screen bg-[#09090e] text-white p-4 md:p-8 flex justify-center">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-4xl flex flex-col gap-8 pb-32 mt-8">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/gallery"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to gallery
          </Link>

          <div className="flex items-center gap-3">
            <LikeButton dreamId={dream.id} initialCount={dream.likeCount} />
          </div>
        </div>

        {/* Art display */}
        {dream.artUrl && (
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(138,43,226,0.15)] bg-black/60 relative">
            <img
              src={dream.artUrl}
              alt="AI Dream Illustration"
              className="w-full h-full object-cover"
            />
            {/* Disabled Generate Video overlay */}
            <div className="absolute bottom-4 right-4">
              <VideoBadge />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Dream text */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-xs uppercase tracking-widest text-purple-300 font-semibold mb-4">
                The Narrative
              </h2>
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-serif whitespace-pre-line">
                "{dream.dreamText}"
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10">
                {dream.moodTags.map((mood: string) => (
                  <Link
                    key={mood}
                    href={`/gallery?mood=${mood}`}
                    className="text-xs bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-full hover:bg-purple-500/30 transition-colors"
                  >
                    {mood}
                  </Link>
                ))}
                {dream.customTags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/gallery?symbol=${tag}`}
                    className="text-xs bg-white/5 text-white/70 hover:text-white px-3 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Interpretation */}
            {dream.interpretation && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/10 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(138,43,226,0.08)]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-300 font-semibold mb-4">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Psychological Reflection
                </div>
                <p className="text-lg md:text-xl text-purple-100/90 leading-relaxed font-serif">
                  {dream.interpretation}
                </p>
              </div>
            )}

            {/* Comments Thread */}
            <CommentThread dreamId={dream.id} dreamOwnerId={dream.userId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <span className="text-xs uppercase tracking-widest text-white/40 block mb-4 font-semibold">
                Dreamer
              </span>
              <div className="flex items-center justify-between gap-4 mb-4">
                <Link
                  href={`/u/${dream.user.username}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm">
                      {dream.user.displayName || `@${dream.user.username}`}
                    </h4>
                    <p className="text-xs text-white/40">@{dream.user.username}</p>
                  </div>
                </Link>
              </div>

              {dream.user.bio && (
                <p className="text-xs text-white/60 mb-4 font-light leading-relaxed">
                  {dream.user.bio}
                </p>
              )}

              <FollowButton username={dream.user.username} />
            </div>

            {/* Related dreams */}
            {relatedDreams.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">
                  Related Visions
                </h4>
                <div className="space-y-4">
                  {relatedDreams.map((rel: any) => (
                    <Link
                      key={rel.id}
                      href={`/dream/${rel.id}`}
                      className="block group p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                      <p className="text-xs text-white/80 line-clamp-2 font-serif group-hover:text-purple-200 mb-2">
                        "{rel.dreamText}"
                      </p>
                      <span className="text-[10px] text-white/40">
                        {rel.likeCount} likes
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
