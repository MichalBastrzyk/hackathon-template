import { count, desc, lt } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { postsTable } from "@/db/schema";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");

  const [posts, countResult] = await Promise.all([
    cursor
      ? db
          .select()
          .from(postsTable)
          .where(lt(postsTable.id, Number(cursor)))
          .orderBy(desc(postsTable.createdAt))
          .limit(PAGE_SIZE)
      : db
          .select()
          .from(postsTable)
          .orderBy(desc(postsTable.createdAt))
          .limit(PAGE_SIZE),
    db.select({ count: count() }).from(postsTable),
  ]);

  const nextCursor =
    posts.length === PAGE_SIZE ? posts[posts.length - 1].id : null;

  return NextResponse.json({
    posts,
    count: countResult[0].count,
    nextCursor,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title: string; content?: string };
  const { title, content } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const [newPost] = await db
    .insert(postsTable)
    .values({
      title: title.trim(),
      content: content?.trim() || null,
    })
    .returning();

  return NextResponse.json(newPost);
}
