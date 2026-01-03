import { Suspense } from "react";

import { count, desc } from "drizzle-orm";
import { unstable_noStore } from "next/cache";

import { PostsSection } from "@/components/posts-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db/client";
import { postsTable } from "@/db/schema";

const PAGE_SIZE = 10;

async function getInitialData() {
  const [posts, countResult] = await Promise.all([
    db
      .select()
      .from(postsTable)
      .orderBy(desc(postsTable.createdAt))
      .limit(PAGE_SIZE),
    db.select({ count: count() }).from(postsTable),
  ]);

  const nextCursor =
    posts.length === PAGE_SIZE ? posts[posts.length - 1].id : null;

  return {
    posts,
    count: countResult[0].count,
    nextCursor,
  };
}

async function Data() {
  unstable_noStore();
  const initialData = await getInitialData();

  return <PostsSection initialData={initialData} />;
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
            Drizzle ORM Demo
          </Badge>
          <h1 className="font-bold text-4xl text-zinc-900 tracking-tight dark:text-zinc-50">
            Next.js + Drizzle ORM
          </h1>
          <p className="mx-auto max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            A simple demo showcasing SQLite with Drizzle ORM. Create posts and
            see them appear in real-time using Server Components.
          </p>
        </section>

        <Suspense fallback={<DataSkeleton />}>
          <Data />
        </Suspense>

        {/* Footer */}
        <footer className="mt-auto border-t pt-8 text-center text-sm text-zinc-500">
          Built with Next.js, Drizzle ORM, and shadcn/ui
        </footer>
      </main>
    </div>
  );
}
