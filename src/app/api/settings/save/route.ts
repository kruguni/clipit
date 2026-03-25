import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// In production, use a proper secrets manager or encrypted database
// This is a simple file-based solution for development
const CONFIG_DIR = join(process.cwd(), ".config");
const CONFIG_FILE = join(CONFIG_DIR, "api-keys.json");

interface ApiConfig {
  openai?: string;
  assemblyai?: string;
  cloudflare?: {
    accountId: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
}

async function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ApiConfig = await request.json();

    await ensureConfigDir();

    // Load existing config
    let existingConfig: ApiConfig = {};
    try {
      const data = await readFile(CONFIG_FILE, "utf-8");
      existingConfig = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }

    // Merge with new config
    const newConfig: ApiConfig = {
      ...existingConfig,
      ...(body.openai && { openai: body.openai }),
      ...(body.assemblyai && { assemblyai: body.assemblyai }),
      ...(body.cloudflare && { cloudflare: body.cloudflare }),
    };

    // Save config
    await writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));

    // Update .gitignore to exclude config directory
    const gitignorePath = join(process.cwd(), ".gitignore");
    try {
      const gitignore = await readFile(gitignorePath, "utf-8");
      if (!gitignore.includes(".config")) {
        await writeFile(gitignorePath, gitignore + "\n# API Keys\n.config/\n");
      }
    } catch {
      // .gitignore doesn't exist
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settings save error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureConfigDir();

    let config: ApiConfig = {};

    // Try to load from config file first
    try {
      const data = await readFile(CONFIG_FILE, "utf-8");
      config = JSON.parse(data);
    } catch {
      // Config file doesn't exist - check environment variables
      config = {
        openai: process.env.OPENAI_API_KEY,
        assemblyai: process.env.ASSEMBLYAI_API_KEY,
        cloudflare: process.env.CLOUDFLARE_ACCOUNT_ID
          ? {
              accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
              accessKey: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
              secretKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
              bucket: process.env.CLOUDFLARE_BUCKET || "clipit-knowitallservices",
            }
          : undefined,
      };
    }

    // Return masked keys for security
    return NextResponse.json({
      openai: config.openai ? `sk-...${config.openai.slice(-4)}` : null,
      assemblyai: config.assemblyai ? `...${config.assemblyai.slice(-4)}` : null,
      cloudflare: config.cloudflare
        ? {
            accountId: config.cloudflare.accountId ? `...${config.cloudflare.accountId.slice(-4)}` : null,
            accessKey: config.cloudflare.accessKey ? `...${config.cloudflare.accessKey.slice(-4)}` : null,
            secretKey: config.cloudflare.secretKey ? "configured" : null,
            bucket: config.cloudflare.bucket,
          }
        : null,
    });
  } catch {
    return NextResponse.json({
      openai: null,
      assemblyai: null,
      cloudflare: null,
    });
  }
}
