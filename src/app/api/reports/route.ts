import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { z } from 'zod';

const reportSchema = z.object({
  dreamId: z.string().optional().nullable(),
  commentId: z.string().optional().nullable(),
  reason: z.string().min(3).max(500),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }

    const { dreamId, commentId, reason } = parsed.data;

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        dreamId: dreamId || null,
        commentId: commentId || null,
        reason,
        status: 'pending',
      }
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
