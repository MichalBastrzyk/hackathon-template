import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";

export const postsTable = t.sqliteTable("posts", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  title: t.text({ length: 255 }),
  content: t.text(),
  createdAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;
