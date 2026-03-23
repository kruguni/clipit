"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Play,
  Pause,
  Download,
  Share2,
  Scissors,
  Clock,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Check,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Captions,
  Video,
} from "lucide-react";

// Mock clip data
const mockClips = [
  {
    id: "1",
    title: "The Secret to Viral Content",
    startTime: 120.5,
    endTime: 180.5,
    transcript: "The secret to viral content is understanding your audience deeply...",
    viralityScore: 92,
    hookScore: 88,
    engagementScore: 85,
    status: "COMPLETED" as const,
    thumbnailUrl: "/api/placeholder/320/568",
  },
  {
    id: "2",
    title: "3 Marketing Mistakes to Avoid",
    startTime: 450.0,
    endTime: 510.0,
    transcript: "There are three marketing mistakes that I see people making over and over...",
    viralityScore: 87,
    hookScore: 91,
    engagementScore: 82,
    status: "COMPLETED" as const,
    thumbnailUrl: "/api/placeholder/320/568",
  },
  {
    id: "3",
    title: "Why Consistency Matters",
    startTime: 890.2,
    endTime: 950.2,
    transcript: "Consistency is the number one thing that separates successful creators...",
    viralityScore: 78,
    hookScore: 75,
    engagementScore: 80,
    status: "RENDERING" as const,
    progress: 65,
    thumbnailUrl: "/api/placeholder/320/568",
  },
  {
    id: "4",
    title: "Building Your Personal Brand",
    startTime: 1200.0,
    endTime: 1260.0,
    transcript: "Your personal brand is what people say about you when you're not in the room...",
    viralityScore: 85,
    hookScore: 82,
    engagementScore: 88,
    status: "COMPLETED" as const,
    thumbnailUrl: "/api/placeholder/320/568",
  },
];

const mockTranscript = [
  { start: 0, end: 5, text: "Welcome back to another episode of the marketing podcast.", speaker: "Speaker 1" },
  { start: 5, end: 12, text: "Today we're going to be talking about creating viral content.", speaker: "Speaker 1" },
  { start: 12, end: 18, text: "This is something that a lot of people get wrong.", speaker: "Speaker 1" },
  { start: 18, end: 25, text: "They focus too much on the quantity instead of the quality.", speaker: "Speaker 1" },
  { start: 25, end: 32, text: "Let me share with you the secret to viral content.", speaker: "Speaker 1" },
  { start: 32, end: 40, text: "It's all about understanding your audience deeply.", speaker: "Speaker 1" },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  return "text-orange-400";
}

export default function ProjectPage() {
  const [selectedClip, setSelectedClip] = useState(mockClips[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState("clips");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <h1 className="text-lg font-semibold text-white truncate max-w-md">
                Marketing Podcast Episode 42
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-700 text-gray-300 hover:bg-slate-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <div className="aspect-video bg-slate-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <Progress value={30} className="h-1 flex-1" />
                    <span className="text-xs text-white/80">{formatTime(currentTime)} / 60:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:text-white h-8 w-8 p-0"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:text-white h-8 w-8 p-0"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-white/80 hover:text-white h-8 w-8 p-0">
                        <Captions className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white/80 hover:text-white h-8 w-8 p-0">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white/80 hover:text-white h-8 w-8 p-0">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="clips" className="data-[state=active]:bg-purple-500">
                  <Scissors className="w-4 h-4 mr-2" />
                  Clips ({mockClips.length})
                </TabsTrigger>
                <TabsTrigger value="transcript" className="data-[state=active]:bg-purple-500">
                  <Captions className="w-4 h-4 mr-2" />
                  Transcript
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clips" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {mockClips.map((clip) => (
                    <Card
                      key={clip.id}
                      className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all duration-300 hover:border-purple-500/50 ${
                        selectedClip.id === clip.id ? "border-purple-500 ring-1 ring-purple-500/50" : ""
                      }`}
                      onClick={() => setSelectedClip(clip)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-20 h-36 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Video className="w-6 h-6 text-gray-500" />
                            </div>
                            {clip.status === "RENDERING" && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <RefreshCw className="w-5 h-5 text-white animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-medium text-white text-sm truncate">
                                {clip.title}
                              </h3>
                              {clip.status === "COMPLETED" && (
                                <Badge className="bg-green-500/20 text-green-400 border-0 flex-shrink-0">
                                  <Check className="w-3 h-3 mr-1" />
                                  Ready
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                            </p>

                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {clip.transcript}
                            </p>

                            {clip.status === "RENDERING" && clip.progress !== undefined && (
                              <div className="mt-3">
                                <Progress value={clip.progress} className="h-1" />
                                <p className="text-xs text-gray-500 mt-1">{clip.progress}% rendered</p>
                              </div>
                            )}

                            {clip.status === "COMPLETED" && (
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-purple-400" />
                                  <span className={`text-xs font-medium ${getScoreColor(clip.viralityScore)}`}>
                                    {clip.viralityScore}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-pink-400" />
                                  <span className={`text-xs font-medium ${getScoreColor(clip.hookScore)}`}>
                                    {clip.hookScore}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="transcript" className="mt-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 space-y-4">
                    {mockTranscript.map((segment, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-purple-400 font-mono w-16 flex-shrink-0">
                          {formatTime(segment.start)}
                        </span>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{segment.speaker}</p>
                          <p className="text-sm text-gray-300">{segment.text}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Selected Clip Details */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Selected Clip</h2>

                {/* Preview */}
                <div className="aspect-[9/16] bg-slate-900 rounded-lg overflow-hidden relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-500" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-white mb-2">{selectedClip.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{selectedClip.transcript}</p>

                {/* Scores */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Virality Score
                    </span>
                    <span className={`font-semibold ${getScoreColor(selectedClip.viralityScore)}`}>
                      {selectedClip.viralityScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      Hook Strength
                    </span>
                    <span className={`font-semibold ${getScoreColor(selectedClip.hookScore)}`}>
                      {selectedClip.hookScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-400" />
                      Engagement
                    </span>
                    <span className={`font-semibold ${getScoreColor(selectedClip.engagementScore)}`}>
                      {selectedClip.engagementScore}/100
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download Clip
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-slate-700 text-gray-300 hover:bg-slate-800">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" className="border-slate-700 text-gray-300 hover:bg-slate-800">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Caption Style */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Caption Style</h2>
                <div className="grid grid-cols-2 gap-2">
                  {["Modern", "Bold", "Classic", "Minimal"].map((style) => (
                    <Button
                      key={style}
                      variant="outline"
                      className={`border-slate-700 text-gray-300 hover:bg-slate-800 ${
                        style === "Modern" ? "border-purple-500 bg-purple-500/10" : ""
                      }`}
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
