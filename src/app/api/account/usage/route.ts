import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { PLAN_LIMITS } from '../../../../lib/constants';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const limits = PLAN_LIMITS[user.plan];

  return NextResponse.json({
    plan: user.plan,
    interpretationsUsed: user.interpretationsUsedToday,
    interpretationsMax: limits.meanings,
    literalArtUsed: user.literalArtUsedToday,
    literalArtMax: limits.literalArt,
    feelingArtUsed: user.feelingArtUsedToday,
    feelingArtMax: limits.feelingArt,
    resetsAt: user.limitsResetAt,
  });
}
