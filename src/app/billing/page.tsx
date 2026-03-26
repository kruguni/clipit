"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Scissors,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  AlertCircle,
  Plus,
  Minus,
  Gift,
} from "lucide-react";

interface CreditPackage {
  id: string;
  clips: number;
  price: number;
  pricePerClip: number;
  savings?: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  {
    id: "starter",
    clips: 10,
    price: 20,
    pricePerClip: 2.00,
  },
  {
    id: "creator",
    clips: 25,
    price: 45,
    pricePerClip: 1.80,
    savings: 10,
    popular: true,
  },
  {
    id: "pro",
    clips: 50,
    price: 80,
    pricePerClip: 1.60,
    savings: 20,
  },
  {
    id: "agency",
    clips: 100,
    price: 150,
    pricePerClip: 1.50,
    savings: 25,
  },
];

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [clipBalance, setClipBalance] = useState(5); // Free clips
  const [customClips, setCustomClips] = useState(10);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    // TODO: Fetch actual clip balance from API
  }, [status, router]);

  const handlePurchase = async (packageId: string, clips: number, price: number) => {
    setLoading(packageId);
    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, clips, price }),
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

  const handleCustomPurchase = () => {
    const price = customClips * 2;
    handlePurchase("custom", customClips, price);
  };

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Buy Clip Credits
          </h1>
          <p className="text-gray-400 mt-1">Purchase clips and create viral content</p>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-gray-300 text-sm">Your Clip Balance</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-white">{clipBalance}</span>
                  <span className="text-gray-400">clips remaining</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                <Gift className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">5 free clips included</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Simple Pay-Per-Clip Pricing</h2>
          <p className="text-gray-400">
            <span className="text-2xl font-bold text-purple-400">$2</span> per clip · Buy more, save more
          </p>
        </div>

        {/* Credit Packages */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors ${
                pkg.popular ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
              )}
              {pkg.savings && (
                <div className="absolute top-3 right-3">
                  <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded">
                    Save {pkg.savings}%
                  </span>
                </div>
              )}
              <CardContent className="p-6 pt-8">
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-white">{pkg.clips}</p>
                  <p className="text-gray-400">clips</p>
                </div>

                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-white">${pkg.price}</p>
                  <p className="text-sm text-gray-400">${pkg.pricePerClip.toFixed(2)} per clip</p>
                </div>

                <Button
                  className={`w-full ${
                    pkg.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                  disabled={loading === pkg.id}
                  onClick={() => handlePurchase(pkg.id, pkg.clips, pkg.price)}
                >
                  {loading === pkg.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Amount */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Custom Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => setCustomClips(Math.max(1, customClips - 5))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    value={customClips}
                    onChange={(e) => setCustomClips(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center bg-slate-900/50 border-slate-700 text-white text-lg font-bold"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => setCustomClips(customClips + 5)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-gray-400">clips</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">${(customClips * 2).toFixed(2)}</p>
                  <p className="text-sm text-gray-400">$2.00 per clip</p>
                </div>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={loading === "custom"}
                  onClick={handleCustomPurchase}
                >
                  {loading === "custom" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Included */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">What&apos;s Included With Every Clip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "AI-powered highlight detection",
                "Auto-generated captions",
                "1080p HD export quality",
                "Multiple aspect ratios (9:16, 1:1, 16:9)",
                "Caption customization",
                "Virality score analysis",
                "No watermark",
                "Unlimited storage (30 days)",
                "Download in MP4 format",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Info Notice */}
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Secure Payments via Stripe</h3>
                <p className="text-sm text-gray-400">
                  All payments are processed securely through Stripe. We accept all major credit cards,
                  Apple Pay, and Google Pay. Clip credits never expire.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
