# Next.js Hackathon Template

A production-ready Next.js template with authentication, tRPC, and Drizzle ORM.

## Features

- ⚡️ **Next.js 16** with App Router and React 19
- 🔐 **Authentication** with better-auth (email/password)
- 🚀 **tRPC** for type-safe API routes
- 🗄️ **Drizzle ORM** with SQLite/libSQL
- 🎨 **Tailwind CSS v4** for styling
- 🧩 **shadcn/ui** components
- 📝 **TypeScript** strict mode
- 🔍 **Biome** for linting and formatting

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hackathon-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update the values:
   ```env
   DATABASE_URL=file:./local.db
   DATABASE_AUTH_TOKEN=dummy-token-for-local
   BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to see your app.

## Authentication

This template uses [better-auth](https://www.better-auth.com) for authentication with email/password.

### Available Auth Routes

- `/auth/signin` - Sign in to your account
- `/auth/signup` - Create a new account
- `/auth/forgot-password` - Password reset (placeholder)
- `/auth/verify-email` - Email verification (placeholder)
- `/profile` - Protected profile page (requires authentication)

### Using Auth in Your Code

#### Client-side (React components)

```tsx
"use client";

import { useSession } from "@/lib/auth-client";

export function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  
  if (session?.user) {
    return <div>Welcome, {session.user.name}!</div>;
  }
  
  return <div>Please sign in</div>;
}
```

#### Server-side (Server Components, Route Handlers)

```tsx
import { auth } from "@/server/auth/config";
import { headers } from "next/headers";

export default async function MyPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    redirect("/auth/signin");
  }
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

#### tRPC Protected Procedures

```tsx
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const myRouter = createTRPCRouter({
  // This endpoint requires authentication
  myProtectedQuery: protectedProcedure
    .query(({ ctx }) => {
      // ctx.session.user is guaranteed to exist
      return { userId: ctx.session.user.id };
    }),
});
```

## Database

This template uses Drizzle ORM with SQLite. The database schema is defined in `src/db/schema.ts`.

### Common Commands

- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Adding a New Table

1. Define your table in `src/db/schema.ts`
2. Run `npm run db:generate` to create a migration
3. Run `npm run db:push` to apply the migration

## tRPC

API routes are defined using tRPC for end-to-end type safety.

### Creating a New Router

1. Create a file in `src/server/api/routers/`
2. Export your router using `createTRPCRouter`
3. Add it to `src/server/api/root.ts`

Example:

```tsx
// src/server/api/routers/example.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.text}` };
    }),
    
  createPost: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(({ ctx, input }) => {
      // ctx.session.user is available here
      return ctx.db.insert(posts).values({
        title: input.title,
        userId: ctx.session.user.id,
      });
    }),
});
```

## Deployment

### Environment Variables

Make sure to set these environment variables in your deployment platform:

- `DATABASE_URL` - Your database connection string
- `DATABASE_AUTH_TOKEN` - Database authentication token (for Turso/libSQL)
- `BETTER_AUTH_SECRET` - A random secret key (at least 32 characters)
- `BETTER_AUTH_URL` - Your production URL (e.g., `https://yourdomain.com`)

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hackathon-template)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Automated Dependency Updates (Dependabot)

- Dependabot is configured via `.github/dependabot.yml` (free on GitHub).
- It opens weekly PRs for npm dependencies and GitHub Actions.
- After merging a dependency PR, run `bun install` to refresh `bun.lock` because Dependabot does not update Bun lockfiles.