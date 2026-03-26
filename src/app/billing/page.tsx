"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Scissors,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  Building2,
  AlertCircle,
  X,
  Shield,
  Infinity,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  minutes: number;
  videos: string;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
  icon: React.ElementType;
  stripePriceId?: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    minutes: 30,
    videos: "2-3 videos",
    features: [
      "2-3 short videos per month",
      "Up to 30 minutes of processing",
      "720p export quality",
      "Basic caption styles",
      "Standard processing speed",
    ],
    notIncluded: [
      "ClipIT watermark on exports",
    ],
    icon: Sparkles,
  },
  {
    id: "creator",
    name: "Creator",
    price: 19,
    interval: "month",
    minutes: 150,
    videos: "10-15 videos",
    features: [
      "150 minutes of processing/month",
      "~10-15 videos worth",
      "1080p HD export quality",
      "All caption styles",
      "No watermark",
      "Priority processing",
      "Download in all formats",
    ],
    popular: true,
    icon: Zap,
    stripePriceId: "price_creator_monthly",
  },
  {
    id: "pro",
    name: "Pro",
    price: 39,
    interval: "month",
    minutes: 500,
    videos: "30-50 videos",
    features: [
      "500 minutes of processing/month",
      "~30-50 videos worth",
      "4K export quality",
      "All caption styles",
      "No watermark",
      "Fastest processing",
      "Custom branding",
      "Scheduled publishing",
      "Analytics dashboard",
      "Priority support",
    ],
    icon: Crown,
    stripePriceId: "price_pro_monthly",
  },
  {
    id: "agency",
    name: "Agency",
    price: 99,
    interval: "month",
    minutes: 2000,
    videos: "Unlimited",
    features: [
      "2000+ minutes of processing",
      "Unlimited team members",
      "4K export quality",
      "White-label option",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom branding per client",
      "Bulk processing",
    ],
    icon: Building2,
    stripePriceId: "price_agency_monthly",
  },
];

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [minutesUsed, setMinutesUsed] = useState(12);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    // TODO: Fetch actual subscription data from API
  }, [status, router]);

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") return;

    setLoading(planId);
    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval: billingInterval,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("manage");
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    // 20% discount for yearly
    return Math.round(monthlyPrice * 12 * 0.8);
  };

  const currentPlanData = plans.find(p => p.id === currentPlan);
  const minutesTotal = currentPlanData?.minutes || 30;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ClipIT</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Banner */}
        {session?.user?.isAdmin && (
          <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Admin Access
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      Unlimited
                    </span>
                  </h3>
                  <p className="text-gray-400 text-sm">
                    You have unlimited clips, no watermarks, and full access to all features.
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Infinity className="w-5 h-5" />
                    <span className="font-semibold">Unlimited</span>
                  </div>
                  <p className="text-xs text-gray-500">minutes/month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {session?.user?.isAdmin ? "Plan Overview" : "Choose Your Plan"}
          </h1>
          <p className="text-gray-400">
            {session?.user?.isAdmin
              ? "As an admin, you have unlimited access to all features"
              : "Start free, upgrade when you need more"}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === "month"
                  ? "bg-purple-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === "year"
                  ? "bg-purple-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-green-400">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Current Plan Usage */}
        {currentPlan !== "free" && (
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-gray-300 text-sm">Current Plan</p>
                  <p className="text-xl font-semibold text-white capitalize">{currentPlan}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Minutes Used This Month</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full w-32">
                      <div
                        className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${Math.min((minutesUsed / minutesTotal) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{minutesUsed} / {minutesTotal} min</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  onClick={handleManageSubscription}
                  disabled={loading === "manage"}
                >
                  {loading === "manage" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Manage Billing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            const displayPrice = billingInterval === "year" && plan.price > 0
              ? Math.round(getYearlyPrice(plan.price) / 12)
              : plan.price;
            const yearlyTotal = getYearlyPrice(plan.price);

            return (
              <Card
                key={plan.id}
                className={`relative bg-slate-800/50 border-slate-700 flex flex-col ${
                  plan.popular ? "ring-2 ring-purple-500" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      plan.popular
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : "bg-slate-700"
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        ${displayPrice}
                      </span>
                      <span className="text-gray-400">/mo</span>
                    </div>
                    {billingInterval === "year" && plan.price > 0 && (
                      <p className="text-sm text-gray-500">
                        ${yearlyTotal}/year (billed annually)
                      </p>
                    )}
                    <p className="text-sm text-purple-400 mt-1">
                      {plan.minutes} min/month · {plan.videos}
                    </p>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                    {plan.notIncluded?.map((feature, i) => (
                      <li key={`not-${i}`} className="flex items-start gap-2 text-sm text-gray-500">
                        <X className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full mt-auto ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : isCurrentPlan
                        ? "bg-slate-700 text-gray-400 cursor-default"
                        : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                    disabled={isCurrentPlan || loading === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : plan.price === 0 ? (
                      "Get Started Free"
                    ) : (
                      "Upgrade Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-1">What counts as processing minutes?</h4>
              <p className="text-gray-400 text-sm">
                Processing minutes are based on the length of your original video. A 10-minute video uses 10 minutes of your quota, regardless of how many clips you create from it.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Can I change plans anytime?</h4>
              <p className="text-gray-400 text-sm">
                Yes! Upgrade or downgrade at any time. When upgrading, you&apos;ll get immediate access to new features. Downgrades take effect at the next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Do unused minutes roll over?</h4>
              <p className="text-gray-400 text-sm">
                Minutes reset each billing cycle and don&apos;t roll over. We recommend the plan that fits your typical monthly usage.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">What payment methods do you accept?</h4>
              <p className="text-gray-400 text-sm">
                We accept all major credit cards, Apple Pay, and Google Pay through Stripe.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise CTA */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white text-lg">Need a custom plan?</h3>
                <p className="text-gray-400">
                  Contact us for custom pricing, volume discounts, or enterprise features.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
              >
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4" />
          Secure payments powered by Stripe. Cancel anytime.
        </div>
      </main>
    </div>
  );
}
