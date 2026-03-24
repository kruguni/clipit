"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/user-menu";
import {
  Upload,
  Sparkles,
  Scissors,
  Captions,
  TrendingUp,
  Play,
  Check,
  ArrowRight,
  Video,
  Mic,
  Zap,
  Loader2,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setError(null);
  };

  const handleGenerateClips = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get presigned upload URL
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadedFile.name,
          contentType: uploadedFile.type || "video/mp4",
          fileSize: uploadedFile.size,
        }),
      });

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json();
        throw new Error(err.error || "Failed to get upload URL");
      }

      const { projectId, uploadUrl, storageKey } = await uploadResponse.json();
      setUploadProgress(10);

      // Step 2: Upload file directly to R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = 10 + Math.round((e.loaded / e.total) * 70);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", uploadedFile.type);
        xhr.send(uploadedFile);
      });

      setUploadProgress(85);

      // Step 3: Start processing
      const title = uploadedFile.name.replace(/\.[^/.]+$/, "");
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title, storageKey }),
      });

      if (!processResponse.ok) {
        const err = await processResponse.json();
        throw new Error(err.error || "Failed to start processing");
      }

      const processData = await processResponse.json();

      // Store project data in localStorage
      const projectData = {
        id: projectId,
        title,
        storageKey,
        transcriptionId: processData.transcriptionId,
        status: "transcribing",
        createdAt: new Date().toISOString(),
      };
      const existingProjects = JSON.parse(localStorage.getItem("clipit_projects") || "[]");
      existingProjects.unshift(projectData);
      localStorage.setItem("clipit_projects", JSON.stringify(existingProjects));

      setUploadProgress(100);
      setIsUploading(false);

      // Redirect to project page
      router.push(`/project/${projectId}`);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Detection",
      description: "Our AI finds the most engaging moments in your content automatically",
    },
    {
      icon: Scissors,
      title: "Smart Clipping",
      description: "Generate perfect 60-second clips optimized for social media",
    },
    {
      icon: Captions,
      title: "Auto Captions",
      description: "Animated word-by-word captions in multiple styles",
    },
    {
      icon: TrendingUp,
      title: "Virality Score",
      description: "See which clips have the highest potential to go viral",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Video",
      description: "Drop your video or podcast file. We support MP4, MOV, and more.",
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our AI transcribes and identifies the best clip-worthy moments.",
    },
    {
      number: "03",
      title: "Review & Edit",
      description: "Preview clips, adjust timing, and choose your caption style.",
    },
    {
      number: "04",
      title: "Export & Share",
      description: "Download HD clips ready for TikTok, YouTube Shorts, and more.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ClipIT</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                by Know IT All
              </Badge>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30">
            AI-Powered Video Clipping
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Turn Long Videos into
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Viral Short Clips
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Upload your video or podcast. Our AI finds the best moments, adds captions,
            and creates scroll-stopping 60-second clips in minutes.
          </p>

          {/* Upload Area */}
          <div className="max-w-2xl mx-auto">
            <Card
              className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragging
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-600 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800/80"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="p-8 sm:p-12">
                {!uploadedFile ? (
                  <label className="flex flex-col items-center gap-4 cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white mb-1">
                        Drop your video here
                      </p>
                      <p className="text-sm text-gray-400">
                        or click to browse. Supports MP4, MOV, WebM up to 2 hours
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Video className="w-4 h-4" />
                        <span className="text-sm">Videos</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mic className="w-4 h-4" />
                        <span className="text-sm">Podcasts</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      {isUploading ? (
                        <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
                      ) : (
                        <Check className="w-8 h-8 text-green-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-white mb-1">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {(isUploading || isProcessing) && (
                      <div className="w-full max-w-xs">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-gray-400 mt-2 text-center flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {uploadProgress < 80 ? "Uploading" : uploadProgress < 100 ? "Processing" : "Redirecting"}... {uploadProgress}%
                        </p>
                      </div>
                    )}
                    {!isUploading && !isProcessing && (
                      <Button
                        onClick={handleGenerateClips}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white mt-4"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Clips
                      </Button>
                    )}
                    {error && (
                      <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>5 free clips per month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Create
              <br />
              Viral Short-Form Content
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI-powered platform handles the heavy lifting so you can focus on creating.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              From Upload to Viral in 4 Steps
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our streamlined process makes creating short-form content effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-purple-500/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 w-8 h-8 text-purple-500/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Create Your First Clip?
                </h2>
                <p className="text-purple-100 mb-8 max-w-xl mx-auto">
                  Join thousands of creators using ClipIT to turn their long-form content
                  into viral short clips.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Clipping for Free
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ClipIT</span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Know IT All Services. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
