import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_subscription_id, 
      razorpay_signature,
      planType 
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_signature || !planType) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '9XRrdUY23X5iYYVRO9IERduw';

    // Verify signature
    let generatedSignature = '';
    if (razorpay_subscription_id) {
      // Signature verification for Subscriptions: payment_id + subscription_id
      generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest('hex');
    } else if (razorpay_order_id) {
      // Signature verification for Orders: order_id + payment_id
      generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    }

    if (generatedSignature && generatedSignature !== razorpay_signature) {
      console.error('[Razorpay Verify] Signature verification mismatch');
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Upgrade user plan in Database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: planType as 'mid' | 'premium',
        razorpaySubscriptionId: razorpay_subscription_id || razorpay_order_id || razorpay_payment_id
      }
    });

    console.log(`[Razorpay Verify] Successfully upgraded user ${session.user.id} to plan: ${planType}`);

    return NextResponse.json({
      success: true,
      plan: updatedUser.plan,
      message: `Successfully upgraded to ${planType === 'mid' ? 'Lucid' : 'Oracle'} tier!`
    });
  } catch (err: any) {
    console.error('[Razorpay Verify] Error verifying payment:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
