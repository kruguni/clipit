import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { getDownloadUrl } from "@/lib/storage/r2";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const { searchParams } = new URL(request.url);
    const storageKey = searchParams.get("storageKey");

    if (!storageKey) {
      return NextResponse.json(
        { error: "storageKey is required" },
        { status: 400 }
      );
    }

    const config = await getConfig();

    if (!config.cloudflare) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 500 }
      );
    }

    // Get video URL
    const videoUrl = await getDownloadUrl(
      {
        accountId: config.cloudflare.accountId,
        accessKeyId: config.cloudflare.accessKey,
        secretAccessKey: config.cloudflare.secretKey,
        bucketName: config.cloudflare.bucket,
      },
      storageKey,
      3600 // 1 hour expiry
    );

    return NextResponse.json({
      projectId,
      videoUrl,
    });
  } catch (err) {
    console.error("Get project error:", err);
    return NextResponse.json(
      { error: "Failed to get project data" },
      { status: 500 }
    );
  }
}
