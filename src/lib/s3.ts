import {
  type PutObjectCommandInput,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
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

/**
 * Uploads a file to S3 with optional metadata
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  dimensions: ImageDimensions | null = null,
): Promise<UploadResult> {
  // Sanitize filename to prevent directory traversal
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${Date.now()}-${sanitizedFileName}`;

  const metadata: Record<string, string> = {};
  if (dimensions) {
    metadata.width = dimensions.width.toString();
    metadata.height = dimensions.height.toString();
  }

  const uploadParams: PutObjectCommandInput = {
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: metadata,
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
 * Retrieves image dimensions from S3 object metadata
 */
export async function getImageDimensions(
  key: string,
): Promise<ImageDimensions | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (response.Metadata?.width && response.Metadata.height) {
      return {
        width: Number.parseInt(response.Metadata.width, 10),
        height: Number.parseInt(response.Metadata.height, 10),
      };
    }

    return null;
  } catch {
    return null;
  }
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
