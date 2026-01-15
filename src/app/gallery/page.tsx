"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadComponent } from "@/components/upload";
import { api } from "@/trpc/react";

interface ImageData {
  key: string;
  url: string;
  lastModified: Date | undefined;
  size: number | undefined;
  dimensions: { width: number; height: number } | null;
}

interface UploadedFile {
  url: string;
  key: string;
  width: number | null;
  height: number | null;
}

function ImageCard({
  image,
  isPriority,
}: {
  image: ImageData;
  isPriority: boolean;
}) {
  const isLocalUrl =
    image.url.startsWith("http://localhost") ||
    image.url.startsWith("http://127.0.0.1") ||
    image.url.startsWith("http://[::1]");

  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-900">
      <div className="relative aspect-video">
        <Image
          src={image.url}
          alt={image.key}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={isLocalUrl}
          priority={isPriority}
        />
      </div>
      <div className="p-3">
        <div className="font-medium text-gray-900 text-sm dark:text-gray-100">
          {image.key}
        </div>
        {image.dimensions && (
          <div className="mt-1 text-gray-500 text-xs">
            {image.dimensions.width} × {image.dimensions.height}
          </div>
        )}
        {image.size && (
          <div className="mt-1 text-gray-500 text-xs">
            {(image.size / 1024).toFixed(1)} KB
          </div>
        )}
      </div>
    </div>
  );
}

function ImageCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-900">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  );
}

export function GalleryContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.image.list.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    );

  const { data: totalCount } = api.image.count.useQuery();

  const allImages = data?.pages.flatMap((page) => page.images) ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleUploadComplete = useCallback(
    (_file: UploadedFile) => {
      setRefreshKey((prev: number) => prev + 1);
      void utils.image.list.invalidate();
      void utils.image.count.invalidate();
    },
    [utils],
  );

  return (
    <div className="space-y-8" key={refreshKey}>
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadComponent onUploadComplete={handleUploadComplete} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Image Gallery</CardTitle>
            {totalCount !== undefined && (
              <Badge variant="secondary">{totalCount} total</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && allImages.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ImageCardSkeleton />
              <ImageCardSkeleton />
              <ImageCardSkeleton />
              <ImageCardSkeleton />
              <ImageCardSkeleton />
              <ImageCardSkeleton />
            </div>
          ) : allImages.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No images uploaded yet. Upload some images to see them here!
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allImages.map((image, index) => (
                  <ImageCard
                    key={image.key}
                    image={image}
                    isPriority={index < 3}
                  />
                ))}
              </div>

              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage ? (
                  <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ImageCardSkeleton />
                    <ImageCardSkeleton />
                    <ImageCardSkeleton />
                  </div>
                ) : hasNextPage ? (
                  <span className="text-sm text-zinc-500">
                    Scroll for more...
                  </span>
                ) : allImages.length > 12 ? (
                  <span className="text-sm text-zinc-500">
                    All images loaded
                  </span>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h2 className="font-semibold text-xl">Image Gallery</h2>
          <Link
            href="/"
            className="text-blue-600 text-sm hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Home
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
        <GalleryContent />
      </main>
    </div>
  );
}
