import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { getTranscriptionStatus } from "@/lib/ai/assemblyai";
import { detectHighlights } from "@/lib/ai/openai";

// AssemblyAI webhook handler
// This is called when transcription is complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript_id, status } = body;

    console.log(`AssemblyAI webhook received: ${transcript_id} - ${status}`);

    if (status !== "completed") {
      // Handle error or other status
      console.log(`Transcription ${transcript_id} status: ${status}`);
      return NextResponse.json({ received: true });
    }

    const config = await getConfig();

    if (!config.assemblyai) {
      console.error("AssemblyAI not configured");
      return NextResponse.json({ received: true });
    }

    // Get full transcription result
    const result = await getTranscriptionStatus(transcript_id, config.assemblyai);

    if (result.status !== "completed") {
      console.error(`Unexpected status for ${transcript_id}: ${result.status}`);
      return NextResponse.json({ received: true });
    }

    // Analyze for highlights if OpenAI is configured
    let clips: Awaited<ReturnType<typeof detectHighlights>> = [];
    if (config.openai && result.segments.length > 0) {
      try {
        clips = await detectHighlights(result.segments, config.openai);
        console.log(`Generated ${clips.length} clip suggestions for ${transcript_id}`);
      } catch (err) {
        console.error("Highlight detection failed:", err);
      }
    }

    // In production, you would:
    // 1. Find the project by transcription ID
    // 2. Update the project with transcript and clips
    // 3. Trigger clip rendering jobs
    // 4. Send notification to user

    console.log(`Processed transcription ${transcript_id}:`, {
      duration: result.duration,
      speakers: result.speakers.length,
      segments: result.segments.length,
      suggestedClips: clips.length,
    });

    return NextResponse.json({
      received: true,
      processed: true,
      clipsGenerated: clips.length,
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Return 200 to prevent retries for processing errors
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}

// Verify webhook is reachable
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "assemblyai-webhook",
    timestamp: new Date().toISOString(),
  });
}
