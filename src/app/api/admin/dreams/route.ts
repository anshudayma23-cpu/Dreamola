import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  try {
    const dreams = await prisma.dream.findMany({
      where: search
        ? {
            OR: [
              { dreamText: { contains: search, mode: 'insensitive' } },
              { interpretation: { contains: search, mode: 'insensitive' } },
              { user: { username: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ]
          }
        : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            plan: true,
            isAdmin: true,
          }
        }
      },
      take: 100
    });

    return NextResponse.json({ dreams });
  } catch (error: any) {
    console.error('Admin fetch dreams error:', error);
    return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
  }
}
