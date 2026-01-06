"use client";

import { useCallback, useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import type { Post } from "@/db/schema";
import { api } from "@/trpc/react";

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function PostsSection() {
  const { data: auth } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const { data: count } = api.post.count.useQuery();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.post.list.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    );

  // Intersection Observer for infinite scroll
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

  const createMutation = api.post.create.useMutation({
    onMutate: async (newPostData) => {
      // Cancel any outgoing refetches
      await utils.post.list.cancel();
      await utils.post.count.cancel();

      // Snapshot the previous value
      const previousList = utils.post.list.getInfiniteData({});
      const previousCount = utils.post.count.getData();

      // Optimistically update to the new value
      const optimisticPost: Post = {
        id: Date.now(),
        title: newPostData.title,
        content: newPostData.content ?? null,
        createdAt: new Date(),
        userId: null, // Temporary for optimistic UI, server will set actual userId
      };

      utils.post.list.setInfiniteData({}, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0
              ? { ...page, posts: [optimisticPost, ...page.posts] }
              : page,
          ),
        };
      });

      utils.post.count.setData(undefined, (old) => (old ?? 0) + 1);

      // Clear the form
      formRef.current?.reset();

      return { previousList, previousCount };
    },
    onError: (_err, _newPost, context) => {
      // Rollback on error
      if (context?.previousList) {
        utils.post.list.setInfiniteData({}, context.previousList);
      }
      if (context?.previousCount !== undefined) {
        utils.post.count.setData(undefined, context.previousCount);
      }
    },
    onSettled: () => {
      // Invalidate after mutation settles
      void utils.post.list.invalidate();
      void utils.post.count.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title?.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      content: content?.trim() || undefined,
    });
  };

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
  const totalCount = count ?? 0;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Posts</CardDescription>
            <CardTitle className="text-3xl">{totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>API</CardDescription>
            <CardTitle className="text-lg">tRPC</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ORM</CardDescription>
            <CardTitle className="text-lg">Drizzle ORM</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
          <CardDescription>
            Add a new post using tRPC with optimistic updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Input
                name="title"
                placeholder="Post title..."
                required
                className="w-full"
                disabled={createMutation.isPending || !auth?.user}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Input
                name="content"
                placeholder="Post content (optional)..."
                className="w-full"
                disabled={createMutation.isPending || !auth?.user}
              />
            </div>
            <Button
              type="submit"
              className="w-fit"
              disabled={createMutation.isPending || !auth?.user}
            >
              {createMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-zinc-900 dark:text-zinc-50">
            Recent Posts
          </h2>
          <Badge variant="outline">{allPosts.length} shown</Badge>
        </div>

        {allPosts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">
              No posts yet. Create your first post above!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {allPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-lg">
                        {post.title} - {post.userId}
                      </CardTitle>
                      {post.content && (
                        <CardDescription>{post.content}</CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {formatDate(post.createdAt)}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <div className="grid w-full gap-4">
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
                </div>
              ) : hasNextPage ? (
                <span className="text-sm text-zinc-500">
                  Scroll for more...
                </span>
              ) : allPosts.length > 10 ? (
                <span className="text-sm text-zinc-500">No more posts</span>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
