This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Quick Setup

We provide automated setup scripts to get you started quickly:

### Linux/macOS/WSL (Shell/Bash)
```bash
./setup.sh
```

### Windows (PowerShell)
```powershell
.\setup.ps1
```

These scripts will:
- ✅ Automatically install Node.js v24 (reading from `.nvmrc`)
- ✅ Install `bun` package manager
- ✅ Install all project dependencies
- ✅ Configure PATH variables for the current session
- ✅ Provide clear guidance for persistent PATH configuration

**Note:** You may need to restart your terminal after the first run for PATH changes to take full effect.

## Automated dependency updates (Dependabot)

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

### Using the Setup Scripts (Recommended)

The easiest way to get started is to use our automated setup scripts:

**Linux/macOS/WSL:**
```bash
./setup.sh
```

**Windows PowerShell:**
```powershell
.\setup.ps1
```

After setup completes, start the development server:

```bash
bun run dev
# or for faster performance with Turbopack:
bunx next dev --turbopack
```

### Manual Setup

If you prefer to set up manually or already have Node.js v24 and bun installed:

```bash
bun install
bun run dev
```

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