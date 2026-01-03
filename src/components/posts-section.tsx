"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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
import type { Post } from "@/db/schema";

interface PostsPage {
  posts: Post[];
  count: number;
  nextCursor: number | null;
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

async function fetchPosts(cursor?: number): Promise<PostsPage> {
  const url = cursor ? `/api/posts?cursor=${cursor}` : "/api/posts";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json() as Promise<PostsPage>;
}

async function createPost(data: {
  title: string;
  content?: string;
}): Promise<Post> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json() as Promise<Post>;
}

interface PostsSectionProps {
  initialData: PostsPage;
}

export function PostsSection({ initialData }: PostsSectionProps) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: ({ pageParam }) => fetchPosts(pageParam),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialData: {
        pages: [initialData],
        pageParams: [undefined],
      },
    });

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

  const mutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPostData) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousData = queryClient.getQueryData<{
        pages: PostsPage[];
        pageParams: (number | undefined)[];
      }>(["posts"]);

      if (previousData) {
        const optimisticPost: Post = {
          id: Date.now(),
          title: newPostData.title,
          content: newPostData.content ?? null,
          createdAt: new Date(),
        };

        queryClient.setQueryData<{
          pages: PostsPage[];
          pageParams: (number | undefined)[];
        }>(["posts"], {
          ...previousData,
          pages: previousData.pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  posts: [optimisticPost, ...page.posts],
                  count: page.count + 1,
                }
              : page,
          ),
        });
      }

      formRef.current?.reset();

      return { previousData };
    },
    onError: (_err, _newPost, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title?.trim()) return;

    mutation.mutate({ title: title.trim(), content: content?.trim() });
  };

  const allPosts = data.pages.flatMap((page) => page.posts);
  const totalCount = data.pages[0].count;

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
            <CardDescription>Database</CardDescription>
            <CardTitle className="text-lg">SQLite (libSQL)</CardTitle>
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
            Add a new post to the database using Drizzle ORM
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
                disabled={mutation.isPending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Input
                name="content"
                placeholder="Post content (optional)..."
                className="w-full"
                disabled={mutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-fit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create Post"}
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
                      <CardTitle className="text-lg">{post.title}</CardTitle>
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
