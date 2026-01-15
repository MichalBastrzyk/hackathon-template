"use server";

import {
  buildObjectKey,
  createPresignedUpload,
  type ImageDimensions,
} from "@/lib/s3";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/config";

interface UploadResponse {
  success: boolean;
  data?: {
    key: string;
    uploadUrl: string;
    publicUrl: string;
    width: number | null;
    height: number | null;
    fields: Record<string, string>;
  };
  error?: string;
}

export async function createUpload(fileInfo: {
  fileName: string;
  fileType: string;
  fileSize: number;
  dimensions: ImageDimensions | null;
}): Promise<UploadResponse> {
  try {
    if (!ALLOWED_TYPES.includes(fileInfo.fileType)) {
      return {
        success: false,
        error: `File type ${fileInfo.fileType} is not supported. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
      };
    }

    if (fileInfo.fileSize > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      };
    }

    const key = buildObjectKey(fileInfo.fileName, fileInfo.dimensions);
    const presigned = await createPresignedUpload(key, {
      contentType: fileInfo.fileType,
      maxFileSize: MAX_FILE_SIZE,
    });

    return {
      success: true,
      data: {
        key: presigned.key,
        uploadUrl: presigned.uploadUrl,
        publicUrl: presigned.publicUrl,
        width: fileInfo.dimensions?.width ?? null,
        height: fileInfo.dimensions?.height ?? null,
        fields: presigned.fields,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create upload",
    };
  }
}
