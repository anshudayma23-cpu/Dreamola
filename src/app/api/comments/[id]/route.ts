import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: id },
      include: { dream: { select: { userId: true, id: true } } }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Permission check: author of comment OR author of dream
    const isAuthor = comment.userId === session.user.id;
    const isDreamOwner = comment.dream.userId === session.user.id;

    if (!isAuthor && !isDreamOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.comment.delete({
        where: { id: id }
      }),
      prisma.dream.update({
        where: { id: comment.dream.id },
        data: { commentCount: { decrement: 1 } }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
