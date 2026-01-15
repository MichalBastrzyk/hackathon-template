import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadComponent } from "@/components/upload";
import { listObjects, parseDimensionsFromKey } from "@/lib/s3";

async function GalleryContent() {
  const objects = await listObjects();

  const imageObjects = objects.filter((obj) => {
    const ext = obj.key.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? "");
  });

  const imagesWithDimensions = imageObjects.map((obj) => ({
    ...obj,
    dimensions: parseDimensionsFromKey(obj.key),
  }));

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadComponent />
        </CardContent>
      </Card>

      {/* Gallery Section */}
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery ({imageObjects.length} images)</CardTitle>
        </CardHeader>
        <CardContent>
          {imageObjects.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No images uploaded yet. Upload some images to see them here!
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imagesWithDimensions.map((obj) => {
                const { dimensions } = obj;

                const isLocalUrl =
                  obj.url.startsWith("http://localhost") ||
                  obj.url.startsWith("http://127.0.0.1") ||
                  obj.url.startsWith("http://[::1]");

                return (
                  <div
                    key={obj.key}
                    className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-900"
                  >
                    {dimensions ? (
                      <div className="relative aspect-video">
                        <Image
                          src={obj.url}
                          alt={obj.key}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={isLocalUrl}
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={obj.url}
                          alt={obj.key}
                          fill
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="font-medium text-gray-900 text-sm dark:text-gray-100">
                        {obj.key}
                      </div>
                      {dimensions && (
                        <div className="mt-1 text-gray-500 text-xs">
                          {dimensions.width} × {dimensions.height}
                        </div>
                      )}
                      {obj.size && (
                        <div className="mt-1 text-gray-500 text-xs">
                          {(obj.size / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function GalleryPage() {
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
