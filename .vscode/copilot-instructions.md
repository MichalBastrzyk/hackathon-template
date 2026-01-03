# Copilot Instructions for this repo

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

## Stack: 

- Next.js 16 (App Router)
- React 19
- TypeScript strict
- Tailwind CSS v4
- Biome for lint/format,
- Turbopack preferred in dev,
- React Compiler enabled.
- Runtime: Node v24.
- Package manager and script runner: Bun (use `bun install`).


## What to do 

- Formatting: use Biome (`bun run format` / `bunx biome format --write`). Keep lines ~100 chars. Imports organized by Biome; use non-relative imports when alias applies.
- Commands: dev `bun run dev`, build `bun run build`, lint `bun run lint`, format `bun run format`
- React/Next patterns: default to Server Components; use `"use client"` only when required. Prefer `next/navigation` over legacy router. Keep data fetching `async`/`cache`/`revalidate` aligned with App Router defaults. Use `next/image` and `next/font`.
- Style: concise comments only when non-obvious. Favor functional, composable utilities. Avoid magic strings; centralize constants.
- Testing/checks: before PR, run lint + build. Add targeted tests when adding logic. DO NOT try to run `bun run dev` as I'm the one whos running it.
- When installing new dependencies use `bun add <package>` to ensure Bun compatibility do not edit package.json manually.


Writing database schema and queries:

For writing datbase schema we use Drizzle ORM. Please make sure when you write schema you use this import style:

```typescript
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
```

This simplifies imports and ensures we are using correct dialect.