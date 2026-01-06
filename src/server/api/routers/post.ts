import { desc } from "drizzle-orm";
import { z } from "zod";

import { postsTable } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ title: z.string().min(1), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .insert(postsTable)
        .values({
          title: input.title,
          content: input.content,
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
    return post[0] ?? null;
  }),
});
