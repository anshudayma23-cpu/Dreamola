import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
  }

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalDreams,
      totalArtworks,
      pendingReports,
      freeUsers,
      midUsers,
      premiumUsers,
      dailyActiveUsers,
      monthlyActiveUsers,
      recentDreams
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dream.count(),
      prisma.dream.count({ where: { artUrl: { not: null } } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { plan: 'free' } }),
      prisma.user.count({ where: { plan: 'mid' } }),
      prisma.user.count({ where: { plan: 'premium' } }),
      prisma.user.count({
        where: {
          OR: [
            { interpretationsUsedToday: { gt: 0 } },
            { literalArtUsedToday: { gt: 0 } },
            { feelingArtUsedToday: { gt: 0 } },
            { createdAt: { gte: oneDayAgo } },
            { updatedAt: { gte: oneDayAgo } },
            { dreams: { some: { createdAt: { gte: oneDayAgo } } } },
            { comments: { some: { createdAt: { gte: oneDayAgo } } } },
            { likes: { some: { createdAt: { gte: oneDayAgo } } } }
          ]
        }
      }),
      prisma.user.count({
        where: {
          OR: [
            { createdAt: { gte: thirtyDaysAgo } },
            { updatedAt: { gte: thirtyDaysAgo } },
            { dreams: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { comments: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { likes: { some: { createdAt: { gte: thirtyDaysAgo } } } }
          ]
        }
      }),
      prisma.dream.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true }
          }
        }
      })
    ]);

    const finalDAU = totalUsers === 0 ? 0 : Math.min(totalUsers, Math.max(1, dailyActiveUsers));
    const finalMAU = totalUsers === 0 ? 0 : Math.min(totalUsers, Math.max(finalDAU, monthlyActiveUsers));

    return NextResponse.json({
      totalUsers,
      totalDreams,
      totalArtworks,
      pendingReports,
      dailyActiveUsers: finalDAU,
      monthlyActiveUsers: finalMAU,
      planBreakdown: {
        free: freeUsers,
        mid: midUsers,
        premium: premiumUsers,
      },
      recentDreams
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
