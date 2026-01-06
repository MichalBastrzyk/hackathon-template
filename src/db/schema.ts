import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";

// Auth tables for better-auth
export const user = t.sqliteTable("user", {
  id: t.text().primaryKey(),
  name: t.text().notNull(),
  email: t.text().notNull().unique(),
  emailVerified: t.integer({ mode: "boolean" }).notNull().default(false),
  image: t.text(),
  createdAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const session = t.sqliteTable("session", {
  id: t.text().primaryKey(),
  expiresAt: t.integer({ mode: "timestamp" }).notNull(),
  token: t.text().notNull().unique(),
  createdAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  ipAddress: t.text(),
  userAgent: t.text(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = t.sqliteTable("account", {
  id: t.text().primaryKey(),
  accountId: t.text().notNull(),
  providerId: t.text().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: t.text(),
  refreshToken: t.text(),
  idToken: t.text(),
  accessTokenExpiresAt: t.integer({ mode: "timestamp" }),
  refreshTokenExpiresAt: t.integer({ mode: "timestamp" }),
  scope: t.text(),
  password: t.text(),
  createdAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const verification = t.sqliteTable("verification", {
  id: t.text().primaryKey(),
  identifier: t.text().notNull(),
  value: t.text().notNull(),
  expiresAt: t.integer({ mode: "timestamp" }).notNull(),
  createdAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Posts table with user relationship
export const postsTable = t.sqliteTable("posts", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  title: t.text({ length: 255 }),
  content: t.text(),
  userId: t.text().references(() => user.id, { onDelete: "cascade" }),
  createdAt: t
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
