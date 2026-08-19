import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const subscriptionSchema = z.object({
  planType: z.enum(['mid', 'premium']),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }

    const { planType } = parsed.data;

    // Get the corresponding plan ID from environment variables
    const planId = planType === 'mid' 
      ? process.env.RAZORPAY_PLAN_LUCID_ID 
      : process.env.RAZORPAY_PLAN_ORACLE_ID;

    if (!planId) {
      console.error(`[Subscription] Razorpay plan ID not configured for: ${planType}`);
      return NextResponse.json({ error: 'Subscription plan not configured' }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`[Subscription] Creating Razorpay subscription for user ${user.id} (${planType})`);
    
    // Create subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 1200, // 100 years of billing cycles (indefinite)
      notes: {
        userId: user.id,
        planType: planType
      }
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: planType === 'mid' ? 499 : 999, // Amount in cents/paise for display in metadata if needed
      name: user.displayName || user.username,
      email: user.email,
    });
  } catch (err: any) {
    console.error('[Subscription] Error creating subscription:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
