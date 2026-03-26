import { NextRequest, NextResponse } from "next/server";
import { auth, isAdminEmail } from "@/lib/auth";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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
  stripe?: {
    secretKey: string;
    webhookSecret: string;
  };
}

async function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
}

async function checkAdminAccess(): Promise<boolean> {
  const session = await auth();
  return isAdminEmail(session?.user?.email);
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

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

    // Merge with new config (only update non-empty values)
    const newConfig: ApiConfig = {
      ...existingConfig,
    };

    if (body.openai) newConfig.openai = body.openai;
    if (body.assemblyai) newConfig.assemblyai = body.assemblyai;
    if (body.cloudflare) {
      newConfig.cloudflare = {
        ...existingConfig.cloudflare,
        ...body.cloudflare,
      };
    }
    if (body.stripe) {
      newConfig.stripe = {
        secretKey: body.stripe.secretKey || existingConfig.stripe?.secretKey || "",
        webhookSecret: body.stripe.webhookSecret || existingConfig.stripe?.webhookSecret || "",
      };
    }

    // Save config
    await writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin settings save error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

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
        stripe: process.env.STRIPE_SECRET_KEY
          ? {
              secretKey: process.env.STRIPE_SECRET_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
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
      stripe: config.stripe
        ? {
            secretKey: config.stripe.secretKey ? "configured" : null,
            webhookSecret: config.stripe.webhookSecret ? "configured" : null,
          }
        : null,
    });
  } catch {
    return NextResponse.json({
      openai: null,
      assemblyai: null,
      cloudflare: null,
      stripe: null,
    });
  }
}
