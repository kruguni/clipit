import { AssemblyAI, TranscriptWord } from "assemblyai";

let assemblyClient: AssemblyAI | null = null;

export function initAssemblyAI(apiKey: string): AssemblyAI {
  assemblyClient = new AssemblyAI({ apiKey });
  return assemblyClient;
}

export function getAssemblyAI(): AssemblyAI | null {
  return assemblyClient;
}

export async function testAssemblyAIConnection(apiKey: string): Promise<boolean> {
  try {
    const client = new AssemblyAI({ apiKey });
    // Test by checking API - list recent transcripts
    await client.transcripts.list({ limit: 1 });
    return true;
  } catch {
    return false;
  }
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence: number;
  words: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface TranscriptionResult {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  text: string;
  segments: TranscriptSegment[];
  duration: number;
  speakers: string[];
  error?: string;
}

export async function startTranscription(
  audioUrl: string,
  apiKey: string,
  webhookUrl?: string
): Promise<{ id: string; status: string }> {
  const client = new AssemblyAI({ apiKey });

  const transcript = await client.transcripts.submit({
    audio_url: audioUrl,
    speech_model: "universal-2" as any,
    speaker_labels: true,
    auto_highlights: true,
    webhook_url: webhookUrl,
  });

  return {
    id: transcript.id,
    status: transcript.status,
  };
}

export async function getTranscriptionStatus(
  transcriptId: string,
  apiKey: string
): Promise<TranscriptionResult> {
  const client = new AssemblyAI({ apiKey });

  const transcript = await client.transcripts.get(transcriptId);

  if (transcript.status === "error") {
    return {
      id: transcript.id,
      status: "error",
      text: "",
      segments: [],
      duration: 0,
      speakers: [],
      error: transcript.error || "Unknown error",
    };
  }

  if (transcript.status !== "completed") {
    return {
      id: transcript.id,
      status: transcript.status,
      text: "",
      segments: [],
      duration: 0,
      speakers: [],
    };
  }

  // Process completed transcript
  const segments: TranscriptSegment[] = [];
  const speakers = new Set<string>();

  if (transcript.utterances) {
    for (const utterance of transcript.utterances) {
      const speaker = utterance.speaker || "Speaker";
      speakers.add(speaker);

      segments.push({
        start: utterance.start / 1000, // Convert ms to seconds
        end: utterance.end / 1000,
        text: utterance.text,
        speaker,
        confidence: utterance.confidence,
        words: (utterance.words || []).map((word: TranscriptWord) => ({
          text: word.text,
          start: word.start / 1000,
          end: word.end / 1000,
          confidence: word.confidence,
        })),
      });
    }
  } else if (transcript.words) {
    // Fallback to word-level if no utterances
    let currentSegment: TranscriptSegment | null = null;
    const segmentGapThreshold = 1.5; // seconds

    for (const word of transcript.words) {
      const wordData = {
        text: word.text,
        start: word.start / 1000,
        end: word.end / 1000,
        confidence: word.confidence,
      };

      if (
        !currentSegment ||
        wordData.start - currentSegment.end > segmentGapThreshold
      ) {
        if (currentSegment) {
          segments.push(currentSegment);
        }
        currentSegment = {
          start: wordData.start,
          end: wordData.end,
          text: word.text,
          confidence: word.confidence,
          words: [wordData],
        };
      } else {
        currentSegment.end = wordData.end;
        currentSegment.text += " " + word.text;
        currentSegment.words.push(wordData);
      }
    }

    if (currentSegment) {
      segments.push(currentSegment);
    }
  }

  return {
    id: transcript.id,
    status: "completed",
    text: transcript.text || "",
    segments,
    duration: (transcript.audio_duration || 0),
    speakers: Array.from(speakers),
  };
}

export async function transcribeVideo(
  audioUrl: string,
  apiKey: string
): Promise<TranscriptionResult> {
  const client = new AssemblyAI({ apiKey });

  const transcript = await client.transcripts.transcribe({
    audio_url: audioUrl,
    speech_model: "universal-2" as any,
    speaker_labels: true,
    auto_highlights: true,
  });

  return getTranscriptionStatus(transcript.id, apiKey);
}
