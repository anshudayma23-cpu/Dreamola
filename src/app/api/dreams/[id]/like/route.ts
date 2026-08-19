import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const dream = await prisma.dream.findUnique({
      where: { id: id },
      select: { likeCount: true }
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    let isLiked = false;
    if (session?.user?.id) {
      const existing = await prisma.like.findUnique({
        where: {
          dreamId_userId: {
            dreamId: id,
            userId: session.user.id
          }
        }
      });
      isLiked = !!existing;
    }

    return NextResponse.json({
      likeCount: dream.likeCount,
      isLiked
    });
  } catch (error) {
    console.error('Fetch like error:', error);
    return NextResponse.json({ error: 'Failed to fetch like status' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const dreamId = id;

    const existingLike = await prisma.like.findUnique({
      where: {
        dreamId_userId: {
          dreamId,
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            dreamId_userId: {
              dreamId,
              userId
            }
          }
        }),
        prisma.dream.update({
          where: { id: dreamId },
          data: { likeCount: { decrement: 1 } }
        })
      ]);

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.$transaction([
        prisma.like.create({
          data: {
            dreamId,
            userId
          }
        }),
        prisma.dream.update({
          where: { id: dreamId },
          data: { likeCount: { increment: 1 } }
        })
      ]);

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
