import { NextRequest, NextResponse } from "next/server";
import { testOpenAIConnection } from "@/lib/ai/openai";
import { testAssemblyAIConnection } from "@/lib/ai/assemblyai";
import { testR2Connection } from "@/lib/storage/r2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, config } = body;

    let success = false;
    let error = "";

    switch (service) {
      case "openai":
        if (!config.apiKey) {
          return NextResponse.json({ success: false, error: "API key required" });
        }
        success = await testOpenAIConnection(config.apiKey);
        if (!success) error = "Invalid API key or connection failed";
        break;

      case "assemblyai":
        if (!config.apiKey) {
          return NextResponse.json({ success: false, error: "API key required" });
        }
        success = await testAssemblyAIConnection(config.apiKey);
        if (!success) error = "Invalid API key or connection failed";
        break;

      case "cloudflare":
        if (!config.accountId || !config.accessKey || !config.secretKey) {
          return NextResponse.json({ success: false, error: "All Cloudflare credentials required" });
        }
        success = await testR2Connection({
          accountId: config.accountId,
          accessKeyId: config.accessKey,
          secretAccessKey: config.secretKey,
          bucketName: config.bucket || "clipit-videos",
        });
        if (!success) error = "Invalid credentials or connection failed";
        break;

      default:
        return NextResponse.json({ success: false, error: "Unknown service" });
    }

    return NextResponse.json({ success, error: success ? undefined : error });
  } catch (err) {
    console.error("Settings test error:", err);
    return NextResponse.json(
      { success: false, error: "Connection test failed" },
      { status: 500 }
    );
  }
}
