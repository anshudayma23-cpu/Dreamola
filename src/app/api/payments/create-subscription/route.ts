import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const subscriptionSchema = z.object({
  planType: z.enum(['mid', 'premium']),
  billingCycle: z.enum(['monthly', 'annually']).optional().default('monthly'),
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

    const { planType, billingCycle } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TRi2WFb7BzJb2g';

    // Get plan ID from environment variables
    const planId = planType === 'mid' 
      ? process.env.RAZORPAY_PLAN_LUCID_ID 
      : process.env.RAZORPAY_PLAN_ORACLE_ID;

    // 1. If Razorpay Plan ID exists, create a Subscription
    if (planId) {
      console.log(`[Subscription] Creating Razorpay subscription for user ${user.id} (${planType})`);
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 1200,
        notes: {
          userId: user.id,
          planType: planType
        }
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        keyId,
        amount: planType === 'mid' ? (billingCycle === 'annually' ? 28800 : 2900) : (billingCycle === 'annually' ? 46800 : 4900),
        name: user.displayName || user.username,
        email: user.email,
      });
    }

    // 2. Fallback: Create a Razorpay Order directly (Works seamlessly with any API keys without dashboard plan setup)
    console.log(`[Subscription] Creating Razorpay order fallback for user ${user.id} (${planType}, ${billingCycle})`);
    
    // Calculate amount in paise (₹29/mo or ₹288/yr for Lucid; ₹49/mo or ₹468/yr for Oracle)
    const amountInRupees = planType === 'mid' 
      ? (billingCycle === 'annually' ? 288 : 29)
      : (billingCycle === 'annually' ? 468 : 49);
    const amountInPaise = amountInRupees * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        planType: planType,
        billingCycle: billingCycle
      }
    });

    return NextResponse.json({
      orderId: order.id,
      keyId,
      amount: amountInPaise,
      currency: 'INR',
      name: user.displayName || user.username,
      email: user.email,
    });
  } catch (err: any) {
    console.error('[Subscription] Error creating payment:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
