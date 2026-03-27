"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Key,
  Check,
  X,
  Loader2,
  ExternalLink,
  Shield,
  Scissors,
  Cloud,
  Brain,
  Mic,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Webhook,
  CreditCard,
  Users,
  Copy,
  AlertTriangle,
  Activity,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

interface ApiConfig {
  key: string;
  isValid: boolean | null;
  isLoading: boolean;
  isConfigured: boolean;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [configs, setConfigs] = useState<Record<string, ApiConfig>>({
    openai: { key: "", isValid: null, isLoading: false, isConfigured: false },
    assemblyai: { key: "", isValid: null, isLoading: false, isConfigured: false },
    cloudflare_account_id: { key: "", isValid: null, isLoading: false, isConfigured: false },
    cloudflare_access_key: { key: "", isValid: null, isLoading: false, isConfigured: false },
    cloudflare_secret_key: { key: "", isValid: null, isLoading: false, isConfigured: false },
    cloudflare_bucket: { key: "clipit-knowitallservices", isValid: null, isLoading: false, isConfigured: false },
    stripe_secret_key: { key: "", isValid: null, isLoading: false, isConfigured: false },
    stripe_webhook_secret: { key: "", isValid: null, isLoading: false, isConfigured: false },
  });

  // Check admin access
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push("/dashboard");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [status, session, router]);

  // Load existing configuration on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setConfigs((prev) => ({
            ...prev,
            openai: {
              ...prev.openai,
              key: data.openai || "",
              isConfigured: !!data.openai
            },
            assemblyai: {
              ...prev.assemblyai,
              key: data.assemblyai || "",
              isConfigured: !!data.assemblyai
            },
            cloudflare_account_id: {
              ...prev.cloudflare_account_id,
              key: data.cloudflare?.accountId || "",
              isConfigured: !!data.cloudflare?.accountId
            },
            cloudflare_access_key: {
              ...prev.cloudflare_access_key,
              key: data.cloudflare?.accessKey || "",
              isConfigured: !!data.cloudflare?.accessKey
            },
            cloudflare_secret_key: {
              ...prev.cloudflare_secret_key,
              key: "",
              isConfigured: data.cloudflare?.secretKey === "configured"
            },
            cloudflare_bucket: {
              ...prev.cloudflare_bucket,
              key: data.cloudflare?.bucket || "clipit-knowitallservices",
              isConfigured: !!data.cloudflare?.bucket
            },
            stripe_secret_key: {
              ...prev.stripe_secret_key,
              key: "",
              isConfigured: data.stripe?.secretKey === "configured"
            },
            stripe_webhook_secret: {
              ...prev.stripe_webhook_secret,
              key: "",
              isConfigured: data.stripe?.webhookSecret === "configured"
            },
          }));
        }
      } catch (err) {
        console.error("Failed to load config:", err);
      } finally {
        setIsLoadingConfig(false);
      }
    }
    loadConfig();
  }, []);

  const updateConfig = (name: string, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [name]: { ...prev[name], key: value, isValid: null },
    }));
  };

  const toggleShowKey = (name: string) => {
    setShowKeys((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const testConnection = async (service: string) => {
    const configKey = service === "cloudflare" ? "cloudflare_account_id" : service;

    setConfigs((prev) => ({
      ...prev,
      [configKey]: { ...prev[configKey], isLoading: true },
    }));

    try {
      const response = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          config: service === "cloudflare"
            ? {
                accountId: configs.cloudflare_account_id.key,
                accessKey: configs.cloudflare_access_key.key,
                secretKey: configs.cloudflare_secret_key.key,
                bucket: configs.cloudflare_bucket.key,
              }
            : { apiKey: configs[service].key },
        }),
      });

      const data = await response.json();

      setConfigs((prev) => ({
        ...prev,
        [configKey]: { ...prev[configKey], isValid: data.success, isLoading: false },
      }));

      if (data.success) {
        toast.success(`${service} connection successful!`);
      } else {
        toast.error(`${service} connection failed: ${data.error}`);
      }
    } catch {
      setConfigs((prev) => ({
        ...prev,
        [configKey]: { ...prev[configKey], isValid: false, isLoading: false },
      }));
      toast.error(`Failed to test ${service} connection`);
    }
  };

  const saveAllSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openai: configs.openai.key,
          assemblyai: configs.assemblyai.key,
          cloudflare: {
            accountId: configs.cloudflare_account_id.key,
            accessKey: configs.cloudflare_access_key.key,
            secretKey: configs.cloudflare_secret_key.key,
            bucket: configs.cloudflare_bucket.key,
          },
          stripe: {
            secretKey: configs.stripe_secret_key.key,
            webhookSecret: configs.stripe_webhook_secret.key,
          },
        }),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/billing/webhook`
    : "https://clipit.knowitallservices.com/api/billing/webhook";

  const apiServices = [
    {
      id: "openai",
      name: "OpenAI",
      icon: Brain,
      description: "Powers highlight detection and virality scoring using GPT-4",
      docsUrl: "https://platform.openai.com/api-keys",
      fields: [
        { name: "openai", label: "API Key", placeholder: "sk-..." },
      ],
    },
    {
      id: "assemblyai",
      name: "AssemblyAI",
      icon: Mic,
      description: "Transcribes videos with word-level timestamps and speaker detection",
      docsUrl: "https://www.assemblyai.com/dashboard/signup",
      fields: [
        { name: "assemblyai", label: "API Key", placeholder: "Your AssemblyAI API key" },
      ],
    },
    {
      id: "cloudflare",
      name: "Cloudflare R2",
      icon: Cloud,
      description: "Stores uploaded videos and generated clips (S3-compatible)",
      docsUrl: "https://dash.cloudflare.com/?to=/:account/r2/api-tokens",
      fields: [
        { name: "cloudflare_account_id", label: "Account ID", placeholder: "Your Cloudflare Account ID" },
        { name: "cloudflare_access_key", label: "Access Key ID", placeholder: "R2 Access Key ID" },
        { name: "cloudflare_secret_key", label: "Secret Access Key", placeholder: "R2 Secret Access Key" },
        { name: "cloudflare_bucket", label: "Bucket Name", placeholder: "clipit-videos" },
      ],
    },
  ];

  if (status === "loading" || (status === "authenticated" && !session?.user?.isAdmin)) {
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                  Admin
                </Badge>
              </div>
            </div>
            <Button
              onClick={saveAllSettings}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Status Card */}
        <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Welcome, {session?.user?.name || session?.user?.email}
                </h2>
                <p className="text-gray-400 text-sm">
                  You have full admin access to manage API integrations, webhooks, and system settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="api" orientation="vertical" className="flex gap-6">
          <TabsList className="flex flex-col h-fit bg-slate-800/50 border border-slate-700 p-2 rounded-lg min-w-[200px]">
            <TabsTrigger value="api" className="w-full justify-start data-[state=active]:bg-emerald-500 px-4 py-3">
              <Key className="w-4 h-4 mr-3" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="w-full justify-start data-[state=active]:bg-emerald-500 px-4 py-3">
              <Webhook className="w-4 h-4 mr-3" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="stripe" className="w-full justify-start data-[state=active]:bg-emerald-500 px-4 py-3">
              <CreditCard className="w-4 h-4 mr-3" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="users" className="w-full justify-start data-[state=active]:bg-emerald-500 px-4 py-3">
              <Users className="w-4 h-4 mr-3" />
              Users
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-6">
            {isLoadingConfig && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="text-gray-400">Loading configuration...</span>
                </CardContent>
              </Card>
            )}

            {apiServices.map((service) => (
              <Card key={service.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <service.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{service.name}</h3>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </div>
                    </div>
                    <a
                      href={service.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                        Get API Key
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-400">{field.label}</label>
                        {configs[field.name]?.isConfigured && (
                          <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys[field.name] ? "text" : "password"}
                            value={configs[field.name]?.key || ""}
                            onChange={(e) => updateConfig(field.name, e.target.value)}
                            placeholder={configs[field.name]?.isConfigured ? "••••••••••••••••" : field.placeholder}
                            className="bg-slate-900/50 border-slate-700 text-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(field.name)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showKeys[field.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {configs[field.name]?.isValid !== null && (
                          <Badge className={configs[field.name].isValid ? "bg-green-500/20 text-green-400 border-0" : "bg-red-500/20 text-red-400 border-0"}>
                            {configs[field.name].isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-gray-300 hover:bg-slate-800"
                    onClick={() => testConnection(service.id)}
                    disabled={configs[service.fields[0].name]?.isLoading}
                  >
                    {configs[service.fields[0].name]?.isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-emerald-400" />
                  Stripe Webhook Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Webhook URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="bg-slate-900/50 border-slate-700 text-white font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-700 text-gray-300 hover:bg-slate-800"
                      onClick={() => copyToClipboard(webhookUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Add this URL to your Stripe dashboard under Developers &gt; Webhooks
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-gray-400">Required Events</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "checkout.session.completed",
                      "customer.subscription.updated",
                      "customer.subscription.deleted",
                      "invoice.payment_succeeded",
                      "invoice.payment_failed",
                    ].map((event) => (
                      <div
                        key={event}
                        className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-2"
                      >
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <code className="text-sm text-gray-300">{event}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Setup Instructions</h4>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Go to Stripe Dashboard &gt; Developers &gt; Webhooks</li>
                          <li>Click "Add endpoint"</li>
                          <li>Paste the webhook URL above</li>
                          <li>Select all the events listed above</li>
                          <li>Copy the signing secret and paste it below</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stripe Tab */}
          <TabsContent value="stripe" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Stripe Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">Secret Key</label>
                    {configs.stripe_secret_key?.isConfigured && (
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Configured
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showKeys.stripe_secret_key ? "text" : "password"}
                      value={configs.stripe_secret_key?.key || ""}
                      onChange={(e) => updateConfig("stripe_secret_key", e.target.value)}
                      placeholder={configs.stripe_secret_key?.isConfigured ? "••••••••••••••••" : "sk_live_... or sk_test_..."}
                      className="bg-slate-900/50 border-slate-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey("stripe_secret_key")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showKeys.stripe_secret_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">Webhook Signing Secret</label>
                    {configs.stripe_webhook_secret?.isConfigured && (
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Configured
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showKeys.stripe_webhook_secret ? "text" : "password"}
                      value={configs.stripe_webhook_secret?.key || ""}
                      onChange={(e) => updateConfig("stripe_webhook_secret", e.target.value)}
                      placeholder={configs.stripe_webhook_secret?.isConfigured ? "••••••••••••••••" : "whsec_..."}
                      className="bg-slate-900/50 border-slate-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey("stripe_webhook_secret")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showKeys.stripe_webhook_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="border-slate-700 text-gray-300 hover:bg-slate-800">
                      Open Stripe Dashboard
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  Subscription Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: "Free", price: "$0", minutes: "30 min", color: "slate" },
                    { name: "Creator", price: "$19", minutes: "150 min", color: "purple" },
                    { name: "Pro", price: "$39", minutes: "500 min", color: "pink" },
                    { name: "Agency", price: "$99", minutes: "2000 min", color: "amber" },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className={`p-4 rounded-lg border border-slate-700 bg-slate-900/50`}
                    >
                      <h4 className="font-semibold text-white">{plan.name}</h4>
                      <p className="text-2xl font-bold text-emerald-400">{plan.price}</p>
                      <p className="text-sm text-gray-400">{plan.minutes}/month</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  To modify plans, update the price IDs in your environment variables or create new prices in Stripe.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Admin Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "jaco@krugeruniverse.com",
                    "knowitallservices11@gmail.com",
                    "accounts@knowitallservices.com",
                  ].map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-white">{email}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                        Admin
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Admin emails are configured in <code className="text-emerald-400">src/lib/auth.ts</code>.
                  Admins have unlimited clips without watermarks.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
