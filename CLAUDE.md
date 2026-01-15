# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Package manager: **Bun** (use `bun install`, not npm)

```bash
# Start development server (Turbopack recommended for speed)
bun run dev                    # Standard Next.js dev
bunx next dev --turbopack     # Faster dev with Turbopack

# Building & Quality
bun run build                 # Production build
bun run lint                  # Biome linter check
bun run format                # Biome format code

# Database (Drizzle ORM with LibSQL/Turso)
bun run db:generate           # Generate migrations from schema changes
bun run db:push               # Push schema directly to database (dev)
bun run db:studio             # Open Drizzle Studio database GUI

# Email (React Email)
bun run email:dev             # Start email preview server on :3001
bun run email:export          # Export emails to static HTML
bun run demo:email            # Send test verification email
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict mode
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` (no `tailwind.config.js`)
- **Database**: LibSQL/Turso with Drizzle ORM (snake_case casing, `src/db/schema.ts`)
- **API**: tRPC v11 with SuperJSON, timing middleware, protected/public procedures
- **Auth**: better-auth with email verification (Drizzle adapter, custom email sending)
- **Email**: Nodemailer transport + React Email templates (dev: MailHog on :1025, web UI on :8025)
- **Linting/Formatting**: Biome (not ESLint/Prettier)
- **Package Manager**: Bun (not npm/pnpm)

### Key Architectural Patterns

**tRPC Setup** (`src/server/api/trpc.ts`):
- `createTRPCContext` provides `db` and `session` to all procedures
- `publicProcedure`: accessible to anyone (session may be null)
- `protectedProcedure`: requires authentication, guarantees `ctx.session.user` exists
- Router defined in `src/server/api/root.ts` - add new routers there and in `/routers` directory
- React client in `src/trpc/react.tsx` with batch streaming link

**Authentication** (`src/server/auth/config.ts`):
- better-auth with Drizzle adapter (user, session, account, verification tables)
- Email verification REQUIRED on signup (`requireEmailVerification: true`)
- Custom email sending via Nodemailer/React Email integration
- Client helpers in `src/lib/auth-client.ts` (`signIn`, `signUp`, `signOut`, `useSession`)
- Auth API handler at `src/app/api/auth/[...all]/route.ts`

**Email System** (`src/server/email/`):
- `emailClient.sendEmail()`: main method for sending emails
- Accepts React Email components, renders HTML + plain text automatically
- SMTP configured via env variables (defaults to localhost:1025 for MailHog in dev)
- Templates in `emails/` directory (e.g., `VerificationEmail`)
- Use `bun run email:dev` for live preview of email templates

**Database** (`src/db/`):
- Drizzle ORM with snake_case casing convention in database
- Schema defines: `user`, `session`, `account`, `verification` (auth tables), `postsTable`
- Singleton pattern for connection (`globalForDb`) to prevent hot-reload issues
- Use `bun run db:studio` to inspect data

**Environment Variables** (`src/env.ts`):
- Typed with `@t3-oss/env-nextjs` + Zod
- Required: `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- SMTP defaults: localhost:1025, no auth (configure `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` for real email)

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/  # better-auth handler
│   │   └── trpc/[trpc]/    # tRPC handler
│   ├── auth/               # Auth pages (signup, signin, verify-email, etc.)
│   ├── profile/            # Protected profile page
│   └── page.tsx            # Landing/home
├── components/
│   ├── ui/                 # Radix UI primitives (button, input, card, etc.)
│   └── providers.tsx       # App providers (TRPCReactProvider, etc.)
├── db/
│   ├── client.ts           # Drizzle DB singleton
│   └── schema.ts           # Table definitions
├── lib/
│   ├── auth-client.ts      # better-auth React client hooks
│   └── utils.ts            # Utility functions (cn, etc.)
├── server/
│   ├── api/
│   │   ├── routers/        # tRPC routers
│   │   ├── root.ts         # Main router (add routers here)
│   │   └── trpc.ts         # tRPC context & procedures
│   ├── auth/
│   │   └── config.ts       # better-auth server config
│   └── email/
│       ├── email-client.ts # Nodemailer wrapper singleton
│       ├── types.ts        # Email types
│       └── index.ts
├── trpc/
│   ├── react.tsx           # tRPC React client setup
│   ├── server.ts           # Server-side caller
│   └── query-client.ts     # TanStack Query client
└── env.ts                  # Typed environment variables
emails/                     # React Email templates (.tsx)
```

## Code Style & Conventions

**TypeScript**:
- Strict mode enabled: `exactOptionalPropertyTypes`, `noImplicitOverride`, `useUnknownInCatchVariables`
- Path alias: `@/*` -> `src/*` (use `@/db/client`, `@/server/auth/config`, etc.)
- Prefer types-first, narrow types, avoid `any`

**React/Next.js**:
- Default to Server Components; use `"use client"` only when needed
- Use `next/navigation` (not `next/router`)
- Import `next/image`, `next/font` for optimization

**Formatting** (Biome):
- Target line length: ~100 characters
- `bun run format` to fix
- Import sorting handled by Biome

**General**:
- Keep code ASCII-only
- Concise comments for non-obvious logic only
- No magic strings; centralize constants
- Functional, composable utilities preferred

## Adding Features

**New tRPC Router**:
1. Create in `src/server/api/routers/your-router.ts`
2. Add to `src/server/api/root.ts`: `export const appRouter = createTRPCRouter({ your: yourRouter, ... })`
3. Use in React: `const { data } = api.your.procedure.useQuery()`

**New Email Template**:
1. Create in `emails/your-email.tsx` using React Email components
2. Send via `emailClient.sendEmail({ to, subject, reactEmailTemplate: YourEmail() })`
3. Preview with `bun run email:dev`

**Database Migration**:
1. Edit `src/db/schema.ts`
2. Run `bun run db:generate` (creates migration) or `bun run db:push` (direct, dev only)

**Protected Page**:
- Server: Check `session` from `auth.api.getSession({ headers })`
- Client: Use `useSession()` hook from `@/lib/auth-client`
