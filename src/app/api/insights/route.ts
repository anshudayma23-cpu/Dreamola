import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = user as any;
    const isAdmin = Boolean(userData.isAdmin || userData.role === 'admin' || user.email?.toLowerCase() === 'anshudayma23@gmail.com');

    // Gating check (Admins, Lucid, and Oracle users have full access)
    if (user.plan === 'free' && !isAdmin) {
      return NextResponse.json(
        { error: 'Insights dashboard is restricted to Lucid and Oracle plan subscribers.' },
        { status: 403 }
      );
    }

    const dreams = await prisma.dream.findMany({
      where: { userId: session.user.id },
      include: {
        symbols: {
          include: {
            symbol: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute metrics
    const dreamCount = dreams.length;
    const moodCounts: Record<string, number> = {};
    const symbolCounts: Record<string, { count: number; theme: string }> = {};

    dreams.forEach((dream) => {
      // Aggregate mood tags
      dream.moodTags.forEach((mood) => {
        const clean = mood.replace('#', '').trim();
        if (clean) {
          moodCounts[clean] = (moodCounts[clean] || 0) + 1;
        }
      });

      // Aggregate symbols
      dream.symbols.forEach((ds) => {
        const keyword = ds.symbol.keyword;
        if (!symbolCounts[keyword]) {
          symbolCounts[keyword] = { count: 0, theme: ds.symbol.interpretationTheme };
        }
        symbolCounts[keyword].count++;
      });
    });

    // Format top symbols
    const topSymbols = Object.entries(symbolCounts)
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        theme: data.theme,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Format mood data
    const moods = Object.entries(moodCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Find the spotlight dream (latest with artwork or longest interpretation)
    const spotlightDream = dreams.find(d => d.artUrl) || dreams[0] || null;

    return NextResponse.json({
      summary: {
        totalDreams: dreamCount,
        lastMonthCount: dreams.filter(d => d.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
        spotlightDream: spotlightDream ? {
          id: spotlightDream.id,
          dreamText: spotlightDream.dreamText,
          interpretation: spotlightDream.interpretation,
          artUrl: spotlightDream.artUrl,
          createdAt: spotlightDream.createdAt,
          moodTags: spotlightDream.moodTags,
          customTags: spotlightDream.customTags,
        } : null,
      },
      topSymbols,
      moods,
    });
  } catch (err: any) {
    console.error('[Insights API] Error fetching metrics:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
