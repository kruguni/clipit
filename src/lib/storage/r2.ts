import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

let r2Client: S3Client | null = null;
let r2Config: R2Config | null = null;

export function initR2(config: R2Config): S3Client {
  r2Config = config;
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return r2Client;
}

export function getR2(): { client: S3Client; config: R2Config } | null {
  if (!r2Client || !r2Config) return null;
  return { client: r2Client, config: r2Config };
}

export async function testR2Connection(config: R2Config): Promise<boolean> {
  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // Test by listing buckets
    await client.send(new ListBucketsCommand({}));
    return true;
  } catch (error) {
    console.error("R2 connection test failed:", error);
    return false;
  }
}

export async function getUploadUrl(
  config: R2Config,
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

export async function getDownloadUrl(
  config: R2Config,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteFile(config: R2Config, key: string): Promise<void> {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })
  );
}

export async function fileExists(config: R2Config, key: string): Promise<boolean> {
  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    await client.send(
      new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function generateVideoKey(projectId: string, filename: string): string {
  const extension = filename.split(".").pop() || "mp4";
  return `videos/${projectId}/original.${extension}`;
}

export function generateClipKey(projectId: string, clipId: string): string {
  return `clips/${projectId}/${clipId}.mp4`;
}

export function generateThumbnailKey(projectId: string, type: "video" | "clip", id?: string): string {
  if (type === "video") {
    return `thumbnails/${projectId}/video.jpg`;
  }
  return `thumbnails/${projectId}/clips/${id}.jpg`;
}
