"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Play,
  Clock,
  Scissors,
  Video,
  Trash2,
  Download,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Filter,
  Upload,
  X,
  Loader2,
  CheckCircle,
  FileVideo,
} from "lucide-react";
import { UserMenu } from "@/components/user-menu";

// Projects will be loaded from database in production
type Project = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration: number;
  status: "UPLOADING" | "TRANSCRIBING" | "ANALYZING" | "DETECTING_FACES" | "RENDERING" | "COMPLETED" | "FAILED";
  clipCount: number;
  progress?: number;
  createdAt: Date;
};

const statusConfig = {
  UPLOADING: { label: "Uploading", color: "bg-blue-500", textColor: "text-blue-500" },
  TRANSCRIBING: { label: "Transcribing", color: "bg-yellow-500", textColor: "text-yellow-500" },
  ANALYZING: { label: "Analyzing", color: "bg-purple-500", textColor: "text-purple-500" },
  DETECTING_FACES: { label: "Face Detection", color: "bg-pink-500", textColor: "text-pink-500" },
  RENDERING: { label: "Rendering", color: "bg-orange-500", textColor: "text-orange-500" },
  COMPLETED: { label: "Completed", color: "bg-green-500", textColor: "text-green-500" },
  FAILED: { label: "Failed", color: "bg-red-500", textColor: "text-red-500" },
};

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects] = useState<Project[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalProjects: projects.length,
    totalClips: projects.reduce((acc, p) => acc + p.clipCount, 0),
    processing: projects.filter((p) => !["COMPLETED", "FAILED"].includes(p.status)).length,
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setProjectTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProjectTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Step 1: Get presigned upload URL
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type || "video/mp4",
          fileSize: selectedFile.size,
        }),
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error("Upload URL error:", error);
        setUploadError(error.error || "Failed to get upload URL");
        setUploadStatus("error");
        return;
      }

      const { projectId, uploadUrl, storageKey } = await uploadResponse.json();
      setUploadProgress(10);

      // Step 2: Upload file directly to R2 using presigned URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Progress from 10% to 80%
            const progress = 10 + Math.round((e.loaded / e.total) * 70);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`R2 upload failed (${xhr.status}): ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during R2 upload"));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", selectedFile.type);
        xhr.send(selectedFile);
      });

      setUploadProgress(85);

      // Step 3: Start processing
      const title = projectTitle || selectedFile.name.replace(/\.[^/.]+$/, "");
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          storageKey,
        }),
      });

      if (!processResponse.ok) {
        const error = await processResponse.json();
        console.error("Process error:", error);
        setUploadError(error.error || "Failed to start processing");
        setUploadStatus("error");
        return;
      }

      const processData = await processResponse.json();

      // Store project data in localStorage for the project page
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
      setUploadStatus("success");

      setTimeout(() => {
        setIsUploadOpen(false);
        router.push(`/project/${projectId}`);
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setUploadError(null);
    setProjectTitle("");
  };

  const openUploadModal = () => {
    resetUpload();
    setIsUploadOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
          </DialogHeader>

          {uploadStatus === "success" ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-lg font-medium">Upload Complete!</p>
              <p className="text-gray-400 mt-2">Redirecting to your project...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/10"
                    : selectedFile
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-600 hover:border-purple-500/50 hover:bg-slate-700/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileVideo className="w-12 h-12 text-green-400 mx-auto" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300">
                      Drag and drop your video here, or <span className="text-purple-400">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">MP4, MOV, WebM up to 2GB</p>
                  </>
                )}
              </div>

              {/* Project Title */}
              {selectedFile && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Project Title</label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              )}

              {/* Upload Progress */}
              {uploadStatus === "uploading" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uploading...</span>
                    <span className="text-purple-400">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Error Message */}
              {uploadStatus === "error" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {uploadError || "Upload failed. Please try again."}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                  disabled={uploadStatus === "uploading"}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadStatus === "uploading"}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {uploadStatus === "uploading" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Start Processing
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ClipIT</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                5 clips remaining
              </Badge>
              <Button
                onClick={openUploadModal}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                  <p className="text-sm text-gray-400">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalClips}</p>
                  <p className="text-sm text-gray-400">Clips Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.processing}</p>
                  <p className="text-sm text-gray-400">Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Button variant="outline" className="border-slate-700 text-gray-300 hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="bg-slate-800/30 border-slate-700 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Upload your first video to get started. Our AI will automatically find the best clips for you.
              </p>
              <Button
                onClick={openUploadModal}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Video
              </Button>
            </CardContent>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="p-0">
                  <div className="relative aspect-video bg-slate-700 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-500" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-1 text-xs text-white">
                      {formatDuration(project.duration)}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className={`${statusConfig[project.status].color} text-white border-0`}
                      >
                        {statusConfig[project.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{project.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.createdAt)}
                        </span>
                        {project.clipCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            {project.clipCount} clips
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white inline-flex items-center justify-center rounded-md hover:bg-slate-700"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-slate-800 border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {project.progress !== undefined && (
                    <div className="mt-4">
                      <Progress value={project.progress} className="h-1.5" />
                      <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* New Project Card */}
          <Card
            onClick={openUploadModal}
            className="bg-slate-800/30 border-slate-700 border-dashed hover:border-purple-500/50 transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[280px]"
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Plus className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-400 group-hover:text-white transition-colors">
                Create New Project
              </p>
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  );
}
