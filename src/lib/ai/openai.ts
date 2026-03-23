import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function initOpenAI(apiKey: string): OpenAI {
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

export function getOpenAI(): OpenAI | null {
  return openaiClient;
}

export async function testOpenAIConnection(apiKey: string): Promise<boolean> {
  try {
    const client = new OpenAI({ apiKey });
    await client.models.list();
    return true;
  } catch {
    return false;
  }
}

export interface ClipSuggestion {
  startTime: number;
  endTime: number;
  title: string;
  transcript: string;
  viralityScore: number;
  hookScore: number;
  engagementScore: number;
  reason: string;
}

export async function detectHighlights(
  transcript: Array<{ start: number; end: number; text: string; speaker?: string }>,
  apiKey: string
): Promise<ClipSuggestion[]> {
  const client = new OpenAI({ apiKey });

  const transcriptText = transcript
    .map((seg) => `[${formatTime(seg.start)}] ${seg.speaker ? `${seg.speaker}: ` : ""}${seg.text}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are an expert content strategist specializing in viral short-form video content for TikTok, YouTube Shorts, and Instagram Reels.

Your task is to analyze a video transcript and identify the TOP 5-8 most clip-worthy moments that would work as standalone 30-60 second clips.

For each clip, evaluate:
1. **Hook Strength (0-100)**: How attention-grabbing is the opening? Does it make viewers want to keep watching?
2. **Virality Potential (0-100)**: Would people share this? Is it relatable, surprising, educational, or emotionally resonant?
3. **Engagement Score (0-100)**: Will it drive comments, saves, and rewatches?

Look for:
- Strong opening hooks ("The secret is...", "Nobody talks about...", "Here's what I learned...")
- Emotional peaks (excitement, surprise, humor, inspiration)
- Quotable moments and hot takes
- Actionable tips and insights
- Storytelling moments with clear payoffs
- Controversial or thought-provoking statements

Return your response as a JSON array of clip suggestions.`,
      },
      {
        role: "user",
        content: `Analyze this transcript and identify the best clips:

${transcriptText}

Return a JSON array with this structure:
[
  {
    "startTime": <start time in seconds>,
    "endTime": <end time in seconds>,
    "title": "<catchy title for the clip>",
    "transcript": "<the text content of this clip segment>",
    "viralityScore": <0-100>,
    "hookScore": <0-100>,
    "engagementScore": <0-100>,
    "reason": "<why this would make a great clip>"
  }
]

Return ONLY the JSON array, no other text.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content || "[]";

  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    console.error("Failed to parse OpenAI response:", content);
    return [];
  }
}

export async function generateClipTitle(
  transcript: string,
  apiKey: string
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "Generate a catchy, engaging title for a short-form video clip. Keep it under 60 characters. Make it attention-grabbing and suitable for TikTok/YouTube Shorts.",
      },
      {
        role: "user",
        content: `Generate a title for this clip:\n\n${transcript}`,
      },
    ],
    temperature: 0.8,
    max_tokens: 100,
  });

  return response.choices[0]?.message?.content?.trim() || "Untitled Clip";
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
