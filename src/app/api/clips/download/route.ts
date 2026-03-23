import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { getDownloadUrl, generateClipKey, fileExists } from "@/lib/storage/r2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clipId = searchParams.get("clipId");

    if (!projectId || !clipId) {
      return NextResponse.json(
        { error: "projectId and clipId are required" },
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

    const r2Config = {
      accountId: config.cloudflare.accountId,
      accessKeyId: config.cloudflare.accessKey,
      secretAccessKey: config.cloudflare.secretKey,
      bucketName: config.cloudflare.bucket,
    };

    const storageKey = generateClipKey(projectId, clipId);

    // Check if clip exists
    const exists = await fileExists(r2Config, storageKey);
    if (!exists) {
      return NextResponse.json(
        { error: "Clip not found or still rendering" },
        { status: 404 }
      );
    }

    // Generate download URL
    const downloadUrl = await getDownloadUrl(r2Config, storageKey, 3600);

    return NextResponse.json({
      downloadUrl,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error("Download URL error:", err);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
