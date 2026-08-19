import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dream = await prisma.dream.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true }
        }
      }
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    return NextResponse.json({ dream });
  } catch (error) {
    console.error('Error fetching dream:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dream = await prisma.dream.findUnique({ where: { id } });
    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const userData = user as any;
    const isAdmin = Boolean(userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase() === 'anshudayma23@gmail.com');

    // Only dream owner or admin can update
    if (dream.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.dream.update({
      where: { id },
      data: {
        ...(typeof body.isPublic === 'boolean' && { isPublic: body.isPublic }),
        ...(typeof body.dreamText === 'string' && { dreamText: body.dreamText }),
        ...(typeof body.artUrl === 'string' && { artUrl: body.artUrl }),
        ...(typeof body.interpretation === 'string' && { interpretation: body.interpretation }),
        ...(Array.isArray(body.customTags) && { customTags: body.customTags }),
        ...(Array.isArray(body.moodTags) && { moodTags: body.moodTags }),
      }
    });

    return NextResponse.json({ dream: updated });
  } catch (error) {
    console.error('Error updating dream:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dream = await prisma.dream.findUnique({ where: { id } });
    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const userData = user as any;
    const isAdmin = Boolean(userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase() === 'anshudayma23@gmail.com');

    // Only owner or admin can delete
    if (dream.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete relations first (likes, comments, dream-symbols)
    await prisma.$transaction([
      prisma.like.deleteMany({ where: { dreamId: id } }),
      prisma.comment.deleteMany({ where: { dreamId: id } }),
      prisma.dreamSymbol.deleteMany({ where: { dreamId: id } }),
      prisma.report.deleteMany({ where: { dreamId: id } }),
      prisma.dream.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: 'Dream deleted successfully' });
  } catch (error) {
    console.error('Error deleting dream:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
