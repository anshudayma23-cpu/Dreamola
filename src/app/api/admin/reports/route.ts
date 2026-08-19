import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { username: true, email: true }
        },
        dream: {
          select: {
            id: true,
            dreamText: true,
            interpretation: true,
            artUrl: true,
            userId: true,
            user: {
              select: { username: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Admin fetch reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
