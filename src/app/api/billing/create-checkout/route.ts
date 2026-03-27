import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe secret key not configured");
  }
  return new Stripe(key);
}

// Stripe Price IDs - set these in your Stripe dashboard
const PRICE_IDS: Record<string, Record<string, string>> = {
  creator: {
    month: process.env.STRIPE_PRICE_CREATOR_MONTHLY || "",
    year: process.env.STRIPE_PRICE_CREATOR_YEARLY || "",
  },
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    year: process.env.STRIPE_PRICE_PRO_YEARLY || "",
  },
  agency: {
    month: process.env.STRIPE_PRICE_AGENCY_MONTHLY || "",
    year: process.env.STRIPE_PRICE_AGENCY_YEARLY || "",
  },
};

// Plan details for dynamic pricing (if price IDs not set)
const PLAN_PRICES: Record<string, { month: number; year: number; name: string; minutes: number }> = {
  creator: { month: 1900, year: 18240, name: "Creator", minutes: 150 },
  pro: { month: 3900, year: 37440, name: "Pro", minutes: 500 },
  agency: { month: 9900, year: 95040, name: "Agency", minutes: 2000 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, interval = "month" } = await request.json();

    if (!planId || !PLAN_PRICES[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planDetails = PLAN_PRICES[planId];
    const priceId = PRICE_IDS[planId]?.[interval];

    const stripe = getStripe();

    // Find or create customer
    let customer: Stripe.Customer | undefined;
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id || "",
        },
      });
    }

    // Create checkout session
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/billing?success=true&plan=${planId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: {
        userId: session.user.id || session.user.email,
        planId,
        interval,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id || session.user.email,
          planId,
        },
      },
      allow_promotion_codes: true,
    };

    // Use price ID if available, otherwise create ad-hoc price
    if (priceId) {
      checkoutParams.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else {
      // Create ad-hoc price for testing
      checkoutParams.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ClipIT ${planDetails.name} Plan`,
              description: `${planDetails.minutes} minutes of video processing per month`,
            },
            unit_amount: interval === "year" ? planDetails.year : planDetails.month,
            recurring: {
              interval: interval as "month" | "year",
            },
          },
          quantity: 1,
        },
      ];
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
