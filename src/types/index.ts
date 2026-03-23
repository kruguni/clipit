// Project and Clip types

export type ProjectStatus =
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "detecting_faces"
  | "rendering"
  | "completed"
  | "failed";

export type ClipStatus = "pending" | "rendering" | "completed" | "failed";

export type AspectRatio = "portrait" | "square" | "landscape";

export type CaptionStyle = "modern" | "classic" | "bold" | "minimal" | "karaoke";

export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence: number;
  words: TranscriptWord[];
}

export interface Transcript {
  text: string;
  segments: TranscriptSegment[];
  duration: number;
  speakers: string[];
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  startTime: number;
  endTime: number;
  transcript: string;
  viralityScore: number;
  hookScore: number;
  engagementScore: number;
  aspectRatio: AspectRatio;
  captionStyle: CaptionStyle;
  status: ClipStatus;
  outputUrl?: string;
  thumbnailUrl?: string;
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  status: ProjectStatus;
  transcript?: Transcript;
  transcriptionId?: string;
  clips: Clip[];
  createdAt: string;
  updatedAt?: string;
}

// API Response types

export interface UploadResponse {
  projectId: string;
  uploadUrl: string;
  storageKey: string;
  expiresIn: number;
}

export interface ProcessResponse {
  projectId: string;
  title: string;
  transcriptionId: string;
  status: ProjectStatus;
}

export interface ProcessStatusResponse {
  projectId: string;
  status: ProjectStatus;
  error?: string;
  transcript?: Transcript;
  clips?: Clip[];
}

export interface ClipDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

// Settings types

export interface CloudflareConfig {
  accountId: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export interface AppSettings {
  openai?: string;
  assemblyai?: string;
  cloudflare?: CloudflareConfig;
}
