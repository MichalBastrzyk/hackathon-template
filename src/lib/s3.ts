import { cache } from "react";

import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { env } from "@/env";

const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
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

export interface PresignedUploadResult {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  fields: Record<string, string>;
}

interface PresignedUploadOptions {
  contentType: string;
  maxFileSize: number;
}

const OBJECT_KEY_PREFIX = "uploads";
const OBJECT_KEY_REGEX = /(?:^|\/)([0-9a-fA-F-]+)_(\d+)x(\d+)\.([a-z0-9]+)$/;
const PRESIGNED_TTL_SECONDS = 60;

export function parseDimensionsFromKey(key: string): ImageDimensions | null {
  const match = key.match(OBJECT_KEY_REGEX);
  if (!match) {
    return null;
  }

  const width = Number.parseInt(match[2], 10);
  const height = Number.parseInt(match[3], 10);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return { width, height };
}

export function buildObjectKey(
  fileName: string,
  dimensions: ImageDimensions | null,
): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  const ext = lastDotIndex > 0 ? fileName.slice(lastDotIndex + 1) : "";
  const extension = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const id = crypto.randomUUID();
  const width = dimensions?.width ?? 0;
  const height = dimensions?.height ?? 0;

  return `${OBJECT_KEY_PREFIX}/${id}_${width}x${height}.${extension}`;
}

export async function createPresignedUpload(
  key: string,
  options: PresignedUploadOptions,
): Promise<PresignedUploadResult> {
  const { contentType, maxFileSize } = options;

  const presignedPost = await createPresignedPost(s3Client, {
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    Fields: {
      "Content-Type": contentType,
    },
    Conditions: [
      ["content-length-range", 0, maxFileSize],
      ["eq", "$Content-Type", contentType],
    ],
    Expires: PRESIGNED_TTL_SECONDS,
  });

  const publicUrl = env.S3_PUBLIC_URL ?? env.S3_ENDPOINT;
  return {
    key,
    uploadUrl: presignedPost.url,
    fields: presignedPost.fields,
    publicUrl: `${publicUrl}/${env.S3_BUCKET_NAME}/${key}`,
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
export const listObjects = cache(async (): Promise<S3Object[]> => {
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
});
