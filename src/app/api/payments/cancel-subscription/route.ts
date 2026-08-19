import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
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

    if (user.email === 'anshudayma23@gmail.com') {
      return NextResponse.json({ error: 'Admin account cannot be downgraded.' }, { status: 403 });
    }

    if (!user.razorpaySubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    console.log(`[Subscription] Cancelling subscription ${user.razorpaySubscriptionId} for user ${user.id}`);

    // Cancel in Razorpay
    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);

    // Downgrade database record immediately
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'free',
        razorpaySubscriptionId: null
      }
    });

    return NextResponse.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (err: any) {
    console.error('[Subscription] Error cancelling subscription:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
