import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { z } from 'zod';

const createDreamSchema = z.object({
  dreamText: z.string().min(10),
  interpretation: z.string().optional(),
  artUrl: z.string().optional(),
  moodTags: z.array(z.string()).optional(),
  customTags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const userData = user as any;
    const isAdmin = Boolean(userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase() === 'anshudayma23@gmail.com');

    if (!user || (user.plan === 'free' && !isAdmin)) {
      return NextResponse.json({ error: 'Journal access is restricted to Lucid and Oracle plans.' }, { status: 403 });
    }

    const dreams = await prisma.dream.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ dreams });
  } catch (error) {
    console.error('Error fetching dreams:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const userData = user as any;
    const isAdmin = Boolean(userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase() === 'anshudayma23@gmail.com');

    if (!user || (user.plan === 'free' && !isAdmin)) {
      return NextResponse.json({ error: 'Journal access is restricted to Lucid and Oracle plans.' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createDreamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }

    const dream = await prisma.dream.create({
      data: {
        userId: session.user.id,
        dreamText: parsed.data.dreamText,
        interpretation: parsed.data.interpretation,
        artUrl: parsed.data.artUrl,
        moodTags: parsed.data.moodTags || [],
        customTags: parsed.data.customTags || [],
        isPublic: parsed.data.isPublic || false,
      }
    });

    return NextResponse.json({ dream });
  } catch (error) {
    console.error('Error creating dream:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
