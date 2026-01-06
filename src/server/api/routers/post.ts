import { count, desc, lt } from "drizzle-orm";
import { z } from "zod";

import { postsTable } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const PAGE_SIZE = 10;

export const postRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const posts = input.cursor
        ? await ctx.db
            .select()
            .from(postsTable)
            .where(lt(postsTable.id, input.cursor))
            .orderBy(desc(postsTable.createdAt))
            .limit(PAGE_SIZE)
        : await ctx.db
            .select()
            .from(postsTable)
            .orderBy(desc(postsTable.createdAt))
            .limit(PAGE_SIZE);

      const nextCursor =
        posts.length === PAGE_SIZE ? posts[posts.length - 1]?.id : null;

      return {
        posts,
        nextCursor,
      };
    }),

  count: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select({ count: count() }).from(postsTable);
    return result[0]?.count ?? 0;
  }),

  create: publicProcedure
    .input(
      z.object({ title: z.string().min(1), content: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .insert(postsTable)
        .values({
          title: input.title,
          content: input.content ?? null,
        })
        .returning();
      return post;
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db
      .select()
      .from(postsTable)
      .orderBy(desc(postsTable.createdAt))
      .limit(1);
    return post?.[0] ?? null;
  }),
});
