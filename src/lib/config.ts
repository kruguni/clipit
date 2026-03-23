import { readFile } from "fs/promises";
import { join } from "path";

const CONFIG_FILE = join(process.cwd(), ".config", "api-keys.json");

export interface AppConfig {
  openai?: string;
  assemblyai?: string;
  cloudflare?: {
    accountId: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
}

let cachedConfig: AppConfig | null = null;
let lastLoadTime = 0;
const CACHE_TTL = 60000; // 1 minute

export async function getConfig(): Promise<AppConfig> {
  const now = Date.now();

  // Return cached config if still valid
  if (cachedConfig && now - lastLoadTime < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const data = await readFile(CONFIG_FILE, "utf-8");
    cachedConfig = JSON.parse(data);
    lastLoadTime = now;
    return cachedConfig!;
  } catch {
    // Config file doesn't exist yet - check environment variables
    return {
      openai: process.env.OPENAI_API_KEY,
      assemblyai: process.env.ASSEMBLYAI_API_KEY,
      cloudflare: process.env.CLOUDFLARE_ACCOUNT_ID
        ? {
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
            accessKey: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
            secretKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
            bucket: process.env.CLOUDFLARE_BUCKET || "clipit-videos",
          }
        : undefined,
    };
  }
}

export function clearConfigCache(): void {
  cachedConfig = null;
  lastLoadTime = 0;
}
