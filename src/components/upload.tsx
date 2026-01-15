"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import { useDirectUpload } from "@/hooks/use-direct-upload";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface UploadedFile {
  url: string;
  key: string;
  width: number | null;
  height: number | null;
}

interface UploadComponentProps {
  onUploadComplete?: (file: UploadedFile) => void;
}

export function UploadComponent({ onUploadComplete }: UploadComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploads, uploadFiles } = useDirectUpload({
    onUploadComplete: (file) => {
      const uploadedFile: UploadedFile = {
        url: file.url,
        key: file.key,
        width: file.width,
        height: file.height,
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);
      onUploadComplete?.(uploadedFile);
    },
    onUploadError: (file) => {
      setUploadedFiles((prev) =>
        prev.filter((uploaded) => uploaded.key !== file.key),
      );
    },
  });

  const isUploading = useMemo(
    () => uploads.some((upload) => upload.status === "uploading"),
    [uploads],
  );

  const error = useMemo(() => {
    const failed = uploads.find((upload) => upload.status === "error");
    return failed?.error ?? null;
  }, [uploads]);

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      // Show preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }

    await uploadFiles(files);

    // Clear preview after upload
    setPreview(null);
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-6">
          <button
            type="button"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-50 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-45 rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>Upload icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 10MB
                </div>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 dark:bg-black/80">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Uploading...
                  </div>
                </div>
              </div>
            )}
          </button>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Uploaded Files</h3>
          <div className="grid gap-2">
            {uploadedFiles.map((file) => (
              <Card key={file.key}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {file.key}
                      </div>
                      {file.width && file.height && (
                        <div className="text-xs text-gray-500">
                          {file.width} × {file.height}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, "_blank")}
                      className="ml-auto"
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
