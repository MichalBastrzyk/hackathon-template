"use server";

import { extractImageDimensions, uploadToS3 } from "@/lib/s3";

export interface UploadResponse {
  success: boolean;
  data?: {
    key: string;
    url: string;
    width: number | null;
    height: number | null;
  };
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function uploadFile(
  formData: FormData,
): Promise<UploadResponse> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `File type ${file.type} is not supported. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract dimensions if it's an image
    const dimensions = await extractImageDimensions(buffer);

    // Upload to S3
    const result = await uploadToS3(buffer, file.name, file.type, dimensions);

    return {
      success: true,
      data: {
        key: result.key,
        url: result.url,
        width: result.dimensions?.width ?? null,
        height: result.dimensions?.height ?? null,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}
