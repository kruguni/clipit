import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { getDownloadUrl } from "@/lib/storage/r2";
import { startTranscription, getTranscriptionStatus } from "@/lib/ai/assemblyai";
import { detectHighlights } from "@/lib/ai/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, storageKey, title } = body;

    if (!projectId || !storageKey) {
      return NextResponse.json(
        { error: "projectId and storageKey are required" },
        { status: 400 }
      );
    }

    const config = await getConfig();

    // Validate required services are configured
    if (!config.cloudflare) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 500 }
      );
    }
    if (!config.assemblyai) {
      return NextResponse.json(
        { error: "AssemblyAI not configured" },
        { status: 500 }
      );
    }

    // Get a public URL for the video
    const videoUrl = await getDownloadUrl(
      {
        accountId: config.cloudflare.accountId,
        accessKeyId: config.cloudflare.accessKey,
        secretAccessKey: config.cloudflare.secretKey,
        bucketName: config.cloudflare.bucket,
      },
      storageKey,
      7200 // 2 hour expiry for processing
    );

    // Start transcription
    const transcription = await startTranscription(
      videoUrl,
      config.assemblyai
    );

    // Return immediately - transcription happens async
    return NextResponse.json({
      projectId,
      title: title || "Untitled Project",
      transcriptionId: transcription.id,
      status: "transcribing",
    });
  } catch (err) {
    console.error("Process start error:", err);
    return NextResponse.json(
      { error: "Failed to start processing" },
      { status: 500 }
    );
  }
}

// GET - Check processing status and get results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const transcriptionId = searchParams.get("transcriptionId");

    if (!transcriptionId) {
      return NextResponse.json(
        { error: "transcriptionId is required" },
        { status: 400 }
      );
    }

    const config = await getConfig();

    if (!config.assemblyai) {
      return NextResponse.json(
        { error: "AssemblyAI not configured" },
        { status: 500 }
      );
    }

    // Get transcription status
    const result = await getTranscriptionStatus(transcriptionId, config.assemblyai);

    if (result.status !== "completed") {
      return NextResponse.json({
        projectId,
        status: result.status,
        error: result.error,
      });
    }

    // Transcription complete - now analyze for highlights
    let clips: Awaited<ReturnType<typeof detectHighlights>> = [];

    if (config.openai && result.segments.length > 0) {
      try {
        clips = await detectHighlights(result.segments, config.openai);
      } catch (err) {
        console.error("Highlight detection error:", err);
        // Continue without clips - user can manually select later
      }
    }

    return NextResponse.json({
      projectId,
      status: "completed",
      transcript: {
        text: result.text,
        segments: result.segments,
        duration: result.duration,
        speakers: result.speakers,
      },
      clips: clips.map((clip, index) => ({
        id: `clip-${index + 1}`,
        ...clip,
        status: "pending",
      })),
    });
  } catch (err) {
    console.error("Process status error:", err);
    return NextResponse.json(
      { error: "Failed to get processing status" },
      { status: 500 }
    );
  }
}
