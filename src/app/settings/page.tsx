"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";

interface ApiConfig {
  key: string;
  isValid: boolean | null;
  isLoading: boolean;
}

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [configs, setConfigs] = useState<Record<string, ApiConfig>>({
    openai: { key: "", isValid: null, isLoading: false },
    assemblyai: { key: "", isValid: null, isLoading: false },
    cloudflare_account_id: { key: "", isValid: null, isLoading: false },
    cloudflare_access_key: { key: "", isValid: null, isLoading: false },
    cloudflare_secret_key: { key: "", isValid: null, isLoading: false },
    cloudflare_bucket: { key: "clipit-knowitallservices", isValid: null, isLoading: false },
  });

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
    // Determine the config key to update for loading state
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
      const response = await fetch("/api/settings/save", {
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

  const apiServices = [
    {
      id: "openai",
      name: "OpenAI",
      icon: Brain,
      description: "Powers highlight detection and virality scoring using GPT-4",
      docsUrl: "https://platform.openai.com/api-keys",
      fields: [
        {
          name: "openai",
          label: "API Key",
          placeholder: "sk-...",
        },
      ],
    },
    {
      id: "assemblyai",
      name: "AssemblyAI",
      icon: Mic,
      description: "Transcribes videos with word-level timestamps and speaker detection",
      docsUrl: "https://www.assemblyai.com/dashboard/signup",
      fields: [
        {
          name: "assemblyai",
          label: "API Key",
          placeholder: "Your AssemblyAI API key",
        },
      ],
    },
    {
      id: "cloudflare",
      name: "Cloudflare R2",
      icon: Cloud,
      description: "Stores uploaded videos and generated clips (S3-compatible)",
      docsUrl: "https://dash.cloudflare.com/?to=/:account/r2/api-tokens",
      fields: [
        {
          name: "cloudflare_account_id",
          label: "Account ID",
          placeholder: "Your Cloudflare Account ID",
        },
        {
          name: "cloudflare_access_key",
          label: "Access Key ID",
          placeholder: "R2 Access Key ID",
        },
        {
          name: "cloudflare_secret_key",
          label: "Secret Access Key",
          placeholder: "R2 Secret Access Key",
        },
        {
          name: "cloudflare_bucket",
          label: "Bucket Name",
          placeholder: "clipit-videos",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-lg font-semibold text-white">Settings</h1>
              </div>
            </div>
            <Button
              onClick={saveAllSettings}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="integrations">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="integrations" className="data-[state=active]:bg-purple-500">
              <Key className="w-4 h-4 mr-2" />
              API Integrations
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-500">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-6">
            {/* Info Banner */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white mb-1">API Keys Required</h3>
                    <p className="text-sm text-gray-400">
                      ClipIT uses external AI services to process your videos. Enter your API keys below
                      to enable transcription, highlight detection, and video storage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Service Cards */}
            {apiServices.map((service) => (
              <Card key={service.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <service.icon className="w-5 h-5 text-purple-400" />
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
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                        Get API Key
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm text-gray-400">{field.label}</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys[field.name] ? "text" : "password"}
                            value={configs[field.name]?.key || ""}
                            onChange={(e) => updateConfig(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="bg-slate-900/50 border-slate-700 text-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(field.name)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showKeys[field.name] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {configs[field.name]?.isValid !== null && (
                          <Badge
                            className={
                              configs[field.name].isValid
                                ? "bg-green-500/20 text-green-400 border-0"
                                : "bg-red-500/20 text-red-400 border-0"
                            }
                          >
                            {configs[field.name].isValid ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
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

          <TabsContent value="security">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Your API Keys are Secure</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        API keys are stored encrypted on the server
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        Keys are never exposed to the browser after saving
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        All API calls are made server-side
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        HTTPS encryption for all data transfers
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
