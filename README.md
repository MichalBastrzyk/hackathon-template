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

- Dependabot is configured via `.github/dependabot.yml` (free on GitHub).
- It opens weekly PRs for npm dependencies and GitHub Actions.
- After merging a dependency PR, run `bun install` to refresh `bun.lock` because Dependabot does not update Bun lockfiles.

## Shadcn/UI Components with MCP integrated to copilot

https://www.creative-tim.com
https://www.cult-ui.com


## Getting Started

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Database - Drizzle ORM

Here are the full docs for using Drizzle ORM: https://orm.drizzle.team/llms-full.txt

## Auth - Better auth

Here are the full docs for using Better Auth: https://www.better-auth.com/llms.txt

## AI SDK - The way to integrate AI into your applications.

Here are the full docs for using AI SDK: https://ai-sdk.dev/llms.txt