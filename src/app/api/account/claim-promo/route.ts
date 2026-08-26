import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.plan === 'mid' || user.plan === 'premium') {
      return NextResponse.json({ 
        message: 'You already have Lucid or Oracle access!',
        plan: user.plan 
      });
    }

    // Upgrade user to Lucid tier ('mid') for 1 month
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: 'mid' }
    });

    return NextResponse.json({
      success: true,
      plan: updatedUser.plan,
      message: '🎉 Congratulations! 1 Month FREE Lucid Plan activated.'
    });
  } catch (error: any) {
    console.error('Error claiming promo plan:', error);
    return NextResponse.json({ error: 'Failed to claim promotional plan' }, { status: 500 });
  }
}
