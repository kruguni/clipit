import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe secret key not configured");
  }
  return new Stripe(key);
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Plan minutes mapping
const PLAN_MINUTES: Record<string, number> = {
  free: 30,
  creator: 150,
  pro: 500,
  agency: 2000,
};

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;

          if (userId && planId) {
            console.log(`User ${userId} subscribed to ${planId} plan`);

            // TODO: Update user's subscription in database
            // await prisma.user.update({
            //   where: { id: userId },
            //   data: {
            //     plan: planId,
            //     minutesAllowed: PLAN_MINUTES[planId] || 30,
            //     minutesUsed: 0,
            //     subscriptionId: session.subscription as string,
            //     subscriptionStatus: 'active',
            //   },
            // });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const planId = subscription.metadata?.planId;

        console.log(`Subscription updated for user ${userId}: ${subscription.status}`);

        // TODO: Update subscription status in database
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: {
        //     subscriptionStatus: subscription.status,
        //     plan: planId,
        //   },
        // });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        console.log(`Subscription canceled for user ${userId}`);

        // TODO: Downgrade user to free plan
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: {
        //     plan: 'free',
        //     minutesAllowed: 30,
        //     subscriptionId: null,
        //     subscriptionStatus: 'canceled',
        //   },
        // });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;

        if (subscriptionId) {
          // Reset monthly minutes on successful payment
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;
          const planId = subscription.metadata?.planId;

          console.log(`Payment succeeded for user ${userId}, resetting minutes`);

          // TODO: Reset minutes for new billing period
          // await prisma.user.update({
          //   where: { id: userId },
          //   data: {
          //     minutesUsed: 0,
          //     minutesAllowed: PLAN_MINUTES[planId || 'free'] || 30,
          //   },
          // });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);

        // TODO: Send payment failure notification
        // TODO: Consider downgrading after multiple failures
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
