import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { getUploadUrl, generateVideoKey } from "@/lib/storage/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, contentType, fileSize } = body;

    // Validate input
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    // Check file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2GB" },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "audio/mpeg", "audio/wav"];
    if (!allowedTypes.some((type) => contentType.startsWith(type.split("/")[0]))) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a video or audio file" },
        { status: 400 }
      );
    }

    // Get config
    const config = await getConfig();
    if (!config.cloudflare) {
      return NextResponse.json(
        { error: "Storage not configured. Please set up Cloudflare R2 in Settings" },
        { status: 500 }
      );
    }

    // Generate project ID and storage key
    const projectId = uuidv4();
    const storageKey = generateVideoKey(projectId, filename);

    // Get presigned upload URL
    const uploadUrl = await getUploadUrl(
      {
        accountId: config.cloudflare.accountId,
        accessKeyId: config.cloudflare.accessKey,
        secretAccessKey: config.cloudflare.secretKey,
        bucketName: config.cloudflare.bucket,
      },
      storageKey,
      contentType,
      3600 // 1 hour expiry
    );

    return NextResponse.json({
      projectId,
      uploadUrl,
      storageKey,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error("Upload URL generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
