"use client";

import { useState, useEffect, useRef, use } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence: number;
}

interface Clip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  transcript: string;
  viralityScore: number;
  hookScore: number;
  engagementScore: number;
  status: "pending" | "rendering" | "completed";
}

interface ProjectData {
  id: string;
  title: string;
  storageKey: string;
  transcriptionId: string;
  status: string;
  createdAt: string;
}

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

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState("clips");
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load project data from localStorage
  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("clipit_projects") || "[]");
    const projectData = storedProjects.find((p: ProjectData) => p.id === projectId);

    if (projectData) {
      setProject(projectData);
    } else {
      setError("Project not found");
      setStatus("error");
    }
  }, [projectId]);

  // Fetch video URL
  useEffect(() => {
    if (!project?.storageKey) return;

    async function fetchVideoUrl() {
      try {
        const response = await fetch(
          `/api/project/${projectId}?storageKey=${encodeURIComponent(project!.storageKey)}`
        );
        if (response.ok) {
          const data = await response.json();
          setVideoUrl(data.videoUrl);
        }
      } catch (err) {
        console.error("Failed to fetch video URL:", err);
      }
    }

    fetchVideoUrl();
  }, [project, projectId]);

  // Poll for transcription status
  useEffect(() => {
    if (!project?.transcriptionId) return;

    async function checkStatus() {
      try {
        const response = await fetch(
          `/api/process?transcriptionId=${project!.transcriptionId}&projectId=${projectId}`
        );
        const data = await response.json();

        setStatus(data.status);

        if (data.status === "completed") {
          // Update transcript and clips
          if (data.transcript?.segments) {
            setTranscript(data.transcript.segments);
            setDuration(data.transcript.duration || 0);
          }
          if (data.clips) {
            const formattedClips: Clip[] = data.clips.map((clip: any) => ({
              id: clip.id,
              title: clip.title || "Untitled Clip",
              startTime: clip.startTime,
              endTime: clip.endTime,
              transcript: clip.transcript || "",
              viralityScore: clip.viralityScore || 75,
              hookScore: clip.hookScore || 70,
              engagementScore: clip.engagementScore || 72,
              status: "completed",
            }));
            setClips(formattedClips);
            if (formattedClips.length > 0) {
              setSelectedClip(formattedClips[0]);
            }
          }

          // Update localStorage
          const storedProjects = JSON.parse(localStorage.getItem("clipit_projects") || "[]");
          const updatedProjects = storedProjects.map((p: ProjectData) =>
            p.id === projectId ? { ...p, status: "completed" } : p
          );
          localStorage.setItem("clipit_projects", JSON.stringify(updatedProjects));

          // Stop polling
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        } else if (data.status === "error") {
          setError(data.error || "Processing failed");
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }
      } catch (err) {
        console.error("Failed to check status:", err);
      }
    }

    // Check immediately
    checkStatus();

    // Poll every 5 seconds while processing
    pollIntervalRef.current = setInterval(checkStatus, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [project, projectId]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Loading state
  if (status === "loading" && !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error" || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Error</p>
          <p className="text-gray-400 mb-4">{error || "Something went wrong"}</p>
          <Link href="/dashboard">
            <Button className="bg-purple-500 hover:bg-purple-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = ["queued", "processing", "transcribing"].includes(status);

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
                {project?.title || "Untitled Project"}
              </h1>
              {isProcessing && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-700 text-gray-300 hover:bg-slate-800" disabled={isProcessing}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" disabled={isProcessing || clips.length === 0}>
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
                {videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                )}

                {videoUrl && (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    {!isPlaying && (
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                    )}
                  </div>
                )}

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <Progress value={duration > 0 ? (currentTime / duration) * 100 : 0} className="h-1 flex-1" />
                    <span className="text-xs text-white/80">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:text-white h-8 w-8 p-0"
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:text-white h-8 w-8 p-0"
                        onClick={toggleMute}
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

            {/* Processing Status */}
            {isProcessing && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {status === "queued" && "Queued for processing..."}
                        {status === "processing" && "Processing your video..."}
                        {status === "transcribing" && "Transcribing audio..."}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        This may take a few minutes depending on the video length.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            {!isProcessing && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800/50 border border-slate-700">
                  <TabsTrigger value="clips" className="data-[state=active]:bg-purple-500">
                    <Scissors className="w-4 h-4 mr-2" />
                    Clips ({clips.length})
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="data-[state=active]:bg-purple-500">
                    <Captions className="w-4 h-4 mr-2" />
                    Transcript
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="clips" className="mt-4">
                  {clips.length === 0 ? (
                    <Card className="bg-slate-800/30 border-slate-700 border-dashed">
                      <CardContent className="py-12 text-center">
                        <Scissors className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No clips generated yet.</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Clips will appear here once processing is complete.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {clips.map((clip) => (
                        <Card
                          key={clip.id}
                          className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all duration-300 hover:border-purple-500/50 ${
                            selectedClip?.id === clip.id ? "border-purple-500 ring-1 ring-purple-500/50" : ""
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
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-medium text-white text-sm truncate">
                                    {clip.title}
                                  </h3>
                                  <Badge className="bg-green-500/20 text-green-400 border-0 flex-shrink-0">
                                    <Check className="w-3 h-3 mr-1" />
                                    Ready
                                  </Badge>
                                </div>

                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                                </p>

                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                  {clip.transcript}
                                </p>

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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="transcript" className="mt-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 space-y-4">
                      {transcript.length === 0 ? (
                        <div className="py-8 text-center">
                          <Captions className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">No transcript available yet.</p>
                        </div>
                      ) : (
                        transcript.map((segment, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = segment.start;
                              }
                            }}
                          >
                            <span className="text-xs text-purple-400 font-mono w-16 flex-shrink-0">
                              {formatTime(segment.start)}
                            </span>
                            <div>
                              {segment.speaker && (
                                <p className="text-xs text-gray-500 mb-1">{segment.speaker}</p>
                              )}
                              <p className="text-sm text-gray-300">{segment.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Sidebar - Selected Clip Details */}
          <div className="space-y-6">
            {selectedClip ? (
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
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {isProcessing ? "Clips will appear after processing" : "Select a clip to view details"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Caption Style */}
            {selectedClip && (
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
