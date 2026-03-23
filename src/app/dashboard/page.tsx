"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

// Mock data for demo
const mockProjects = [
  {
    id: "1",
    title: "Marketing Podcast Episode 42",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 3600,
    status: "COMPLETED" as const,
    clipCount: 8,
    createdAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    title: "Product Demo Video",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 1800,
    status: "ANALYZING" as const,
    clipCount: 0,
    progress: 65,
    createdAt: new Date("2024-03-21"),
  },
  {
    id: "3",
    title: "Interview with CEO",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 5400,
    status: "TRANSCRIBING" as const,
    clipCount: 0,
    progress: 30,
    createdAt: new Date("2024-03-22"),
  },
  {
    id: "4",
    title: "Tech Tutorial Series Ep 1",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 2700,
    status: "COMPLETED" as const,
    clipCount: 5,
    createdAt: new Date("2024-03-19"),
  },
];

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

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects] = useState(mockProjects);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalProjects: projects.length,
    totalClips: projects.reduce((acc, p) => acc + p.clipCount, 0),
    processing: projects.filter((p) => !["COMPLETED", "FAILED"].includes(p.status)).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
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
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
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
          <Card className="bg-slate-800/30 border-slate-700 border-dashed hover:border-purple-500/50 transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[280px]">
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
      </main>
    </div>
  );
}
