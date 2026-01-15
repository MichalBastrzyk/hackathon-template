import {
  ListObjectsV2Command,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

import { env } from "@/env";

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for MinIO and some S3-compatible services
});

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface UploadResult {
  key: string;
  url: string;
  dimensions: ImageDimensions | null;
}

const OBJECT_KEY_PREFIX = "uploads";
const OBJECT_KEY_REGEX = /(?:^|\/)([0-9a-fA-F-]+)_(\d+)x(\d+)\.([a-z0-9]+)$/;

/**
 * Extracts image dimensions from a buffer using sharp
 */
export async function extractImageDimensions(
  buffer: Buffer,
): Promise<ImageDimensions | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.height) {
      return {
        width: metadata.width,
        height: metadata.height,
      };
    }
    return null;
  } catch {
    // Not an image or failed to extract metadata
    return null;
  }
}

export function parseDimensionsFromKey(key: string): ImageDimensions | null {
  const match = key.match(OBJECT_KEY_REGEX);
  if (!match) {
    return null;
  }

  const width = Number.parseInt(match[2], 10);
  const height = Number.parseInt(match[3], 10);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  return { width, height };
}

function sanitizeExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  const ext = lastDotIndex > 0 ? fileName.slice(lastDotIndex + 1) : "";
  return ext.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildObjectKey(
  fileName: string,
  dimensions: ImageDimensions | null,
): string {
  const extension = sanitizeExtension(fileName) || "bin";
  const id = crypto.randomUUID();
  const width = dimensions?.width ?? 0;
  const height = dimensions?.height ?? 0;

  return `${OBJECT_KEY_PREFIX}/${id}_${width}x${height}.${extension}`;
}

/**
 * Uploads a file to S3 with optional metadata
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  dimensions: ImageDimensions | null = null,
): Promise<UploadResult> {
  const key = buildObjectKey(fileName, dimensions);

  const uploadParams: PutObjectCommandInput = {
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  // Construct public URL
  const publicUrl = env.S3_PUBLIC_URL ?? env.S3_ENDPOINT;
  const url = `${publicUrl}/${env.S3_BUCKET_NAME}/${key}`;

  return {
    key,
    url,
    dimensions,
  };
}

/**
 * Gets the public URL for an S3 object
 */
export function getPublicUrl(key: string): string {
  const publicUrl = env.S3_PUBLIC_URL ?? env.S3_ENDPOINT;
  return `${publicUrl}/${env.S3_BUCKET_NAME}/${key}`;
}

export interface S3Object {
  key: string;
  url: string;
  lastModified: Date | undefined;
  size: number | undefined;
}

/**
 * Lists all objects in the S3 bucket
 */
export async function listObjects(): Promise<S3Object[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: env.S3_BUCKET_NAME,
    });

    const response = await s3Client.send(command);

    return (
      response.Contents?.map((obj) => ({
        key: obj.Key ?? "",
        url: getPublicUrl(obj.Key ?? ""),
        lastModified: obj.LastModified,
        size: obj.Size,
      })) ?? []
    );
  } catch {
    return [];
  }
}
