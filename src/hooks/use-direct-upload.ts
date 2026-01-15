"use client";

import { useCallback, useMemo, useState } from "react";

import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/config";
import { createUpload } from "@/server/actions/upload";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadResult {
  key: string;
  url: string;
  width: number | null;
  height: number | null;
  status: UploadStatus;
  progress: number;
  error: string | null;
}

interface UploadEntry {
  file: File;
  result: UploadResult;
}

interface UploadOptions {
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (result: UploadResult) => void;
}

async function extractImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image dimensions"));
    };

    img.src = objectUrl;
  });
}

async function safeExtractImageDimensions(file: File) {
  try {
    return await extractImageDimensions(file);
  } catch {
    return null;
  }
}

function validateClientFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type ${file.type} is not supported. Allowed types: ${ALLOWED_TYPES.join(", ")}`;
  }

  return null;
}

function createEmptyResult(file: File): UploadResult {
  return {
    key: file.name,
    url: "",
    width: null,
    height: null,
    status: "idle",
    progress: 0,
    error: null,
  };
}

async function uploadToPresignedUrl(
  file: File,
  uploadUrl: string,
  fields: Record<string, string>,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.send(formData);
  });
}

export function useDirectUpload(options: UploadOptions = {}) {
  const { onUploadComplete, onUploadError } = options;
  const [uploads, setUploads] = useState<UploadEntry[]>([]);

  const results = useMemo(
    () => uploads.map((entry) => entry.result),
    [uploads],
  );

  const reset = useCallback(() => setUploads([]), []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const nextEntries = files.map((file) => ({
        file,
        result: createEmptyResult(file),
      }));

      setUploads((prev) => [...prev, ...nextEntries]);

      for (const entry of nextEntries) {
        const { file } = entry;
        const validationError = validateClientFile(file);
        if (validationError) {
          setUploads((prev) =>
            prev.map((item) =>
              item.file === file
                ? {
                    ...item,
                    result: {
                      ...item.result,
                      status: "error",
                      error: validationError,
                    },
                  }
                : item,
            ),
          );
          continue;
        }

        setUploads((prev) =>
          prev.map((item) =>
            item.file === file
              ? {
                  ...item,
                  result: {
                    ...item.result,
                    status: "uploading",
                    error: null,
                  },
                }
              : item,
          ),
        );

        try {
          const dimensions = file.type.startsWith("image/")
            ? await safeExtractImageDimensions(file)
            : null;

          const resolvedDimensions = dimensions ?? { width: 0, height: 0 };

          const presignResponse = await createUpload({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            dimensions: resolvedDimensions,
          });

          if (!presignResponse.success || !presignResponse.data) {
            throw new Error(presignResponse.error ?? "Failed to create upload");
          }

          await uploadToPresignedUrl(
            file,
            presignResponse.data.uploadUrl,
            presignResponse.data.fields,
            (progress: number) => {
              setUploads((prev) =>
                prev.map((item) =>
                  item.file === file
                    ? {
                        ...item,
                        result: {
                          ...item.result,
                          progress,
                        },
                      }
                    : item,
                ),
              );
            },
          );

          const result: UploadResult = {
            key: presignResponse.data.key,
            url: presignResponse.data.publicUrl,
            width: dimensions?.width ?? null,
            height: dimensions?.height ?? null,
            status: "success",
            progress: 100,
            error: null,
          };

          setUploads((prev) =>
            prev.map((item) =>
              item.file === file
                ? {
                    ...item,
                    result,
                  }
                : item,
            ),
          );

          onUploadComplete?.(result);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          const result = {
            ...entry.result,
            status: "error",
            error: errorMessage,
          } satisfies UploadResult;

          setUploads((prev) =>
            prev.map((item) =>
              item.file === file
                ? {
                    ...item,
                    result,
                  }
                : item,
            ),
          );
          onUploadError?.(result);
        }
      }
    },
    [onUploadComplete, onUploadError],
  );

  return {
    uploads: results,
    uploadFiles,
    reset,
  };
}
