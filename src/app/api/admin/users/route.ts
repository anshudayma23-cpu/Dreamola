import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';
  const plan = searchParams.get('plan') || '';

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { email: { contains: search, mode: 'insensitive' } },
                  { username: { contains: search, mode: 'insensitive' } },
                ]
              }
            : {},
          plan ? { plan: plan as any } : {}
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        plan: true,
        isAdmin: true,
        role: true,
        interpretationsUsedToday: true,
        literalArtUsedToday: true,
        feelingArtUsedToday: true,
        createdAt: true,
        _count: {
          select: {
            dreams: true,
            comments: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
