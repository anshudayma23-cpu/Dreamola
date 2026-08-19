import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    console.log('[Razorpay Webhook] Received webhook event');

    // Verify signature
    const isValid = verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      console.warn('[Razorpay Webhook] Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventName, payload } = event;
    const subscriptionEntity = payload?.subscription?.entity;

    if (!subscriptionEntity) {
      console.warn('[Razorpay Webhook] No subscription entity in payload');
      return NextResponse.json({ received: true }); // Always return 200 to acknowledge
    }

    const subscriptionId = subscriptionEntity.id;
    const notes = subscriptionEntity.notes || {};
    const userId = notes.userId;
    let planType = notes.planType; // 'mid' | 'premium'

    // Fallback: If notes are missing, deduce planType from plan_id
    if (!planType) {
      const planId = subscriptionEntity.plan_id;
      if (planId === process.env.RAZORPAY_PLAN_LUCID_ID) {
        planType = 'mid';
      } else if (planId === process.env.RAZORPAY_PLAN_ORACLE_ID) {
        planType = 'premium';
      }
    }

    console.log(`[Razorpay Webhook] Event: ${eventName}, SubId: ${subscriptionId}, UserId: ${userId}, Plan: ${planType}`);

    switch (eventName) {
      case 'subscription.activated':
      case 'subscription.authenticated':
        if (!userId || !planType) {
          console.error('[Razorpay Webhook] Missing userId or planType on activation');
          break;
        }
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: planType,
            razorpaySubscriptionId: subscriptionId
          }
        });
        console.log(`[Razorpay Webhook] Activated plan '${planType}' for user ${userId}`);
        break;

      case 'subscription.cancelled':
      case 'subscription.halted':
        // Find user by subscription ID and downgrade to free
        const userToDowngrade = await prisma.user.findFirst({
          where: { razorpaySubscriptionId: subscriptionId }
        });

        if (userToDowngrade) {
          await prisma.user.update({
            where: { id: userToDowngrade.id },
            data: {
              plan: 'free',
              razorpaySubscriptionId: null
            }
          });
          console.log(`[Razorpay Webhook] Downgraded user ${userToDowngrade.id} to free plan`);
        } else {
          console.warn(`[Razorpay Webhook] Subscription ${subscriptionId} cancelled but no matching user found`);
        }
        break;

      default:
        console.log(`[Razorpay Webhook] Unhandled event: ${eventName}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Error processing webhook:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
