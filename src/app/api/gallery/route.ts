import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'recent';
    const symbol = searchParams.get('symbol') || '';
    const mood = searchParams.get('mood') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
    };

    if (symbol) {
      where.OR = [
        { customTags: { has: symbol } },
        { moodTags: { has: symbol } },
        { dreamText: { contains: symbol, mode: 'insensitive' } },
        {
          symbols: {
            some: {
              symbol: {
                keyword: { equals: symbol, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    if (mood) {
      where.moodTags = { has: mood };
    }

    const orderBy: any = sort === 'popular'
      ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }];

    const [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          }
        }
      }),
      prisma.dream.count({ where })
    ]);

    return NextResponse.json({
      dreams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery dreams' }, { status: 500 });
  }
}
