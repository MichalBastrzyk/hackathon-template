import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, HydrateClient } from "@/trpc/server";

import { PostsSection } from "./_components/posts-section";

async function Data() {
  // Prefetch data for the client
  await api.post.list.prefetchInfinite({});
  await api.post.count.prefetch();

  return (
    <HydrateClient>
      <PostsSection />
    </HydrateClient>
  );
}

function DataSkeleton() {
  return (
    <>
      {/* Stats Skeleton */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-8 w-16" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-8 w-24" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-8 w-24" />
          </CardHeader>
        </Card>
      </section>

      {/* Create Post Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Posts List Skeleton */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-5 w-24 shrink-0" />
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-5 w-24 shrink-0" />
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-5 w-24 shrink-0" />
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
    </>
  );
}

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-16">
        {/* Hero Section */}
        <section className="flex flex-col gap-4 text-center">
          <Badge variant="secondary" className="mx-auto w-fit">
            tRPC + Drizzle ORM Demo
          </Badge>
          <h1 className="font-bold text-4xl text-zinc-900 tracking-tight dark:text-zinc-50">
            Next.js + tRPC + Drizzle
          </h1>
          <p className="mx-auto max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            A demo showcasing tRPC with optimistic updates. Create posts and
            watch them appear instantly using optimistic UI.
          </p>
        </section>

        <Suspense fallback={<DataSkeleton />}>
          <Data />
        </Suspense>

        {/* Footer */}
        <footer className="mt-auto border-t pt-8 text-center text-sm text-zinc-500">
          Built with Next.js, tRPC, Drizzle ORM, and shadcn/ui
        </footer>
      </main>
    </div>
  );
}
