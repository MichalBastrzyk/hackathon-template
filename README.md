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

## S3-Compatible Storage & Image Upload

This project includes a robust file upload system with S3-compatible storage integration. Images are uploaded with their dimensions stored directly as S3 object metadata (no database required).

### Features

- **Drag-and-drop upload** with multi-file support
- **Real-time upload progress** indicator
- **Image dimension extraction** using Sharp
- **Automatic metadata storage** on S3 objects (`x-amz-meta-width`, `x-amz-meta-height`)
- **Gallery display** using Next.js `next/image` for optimal performance
- **Multiple provider support**: MinIO (local), Cloudflare R2, Hetzner S3

### Local Development with MinIO

1. Start MinIO using Docker Compose:

```bash
docker-compose up -d
```

2. MinIO Console is available at http://localhost:9001
   - Username: `minioadmin`
   - Password: `minioadmin`

3. The `uploads` bucket is automatically created and configured for public read access.

### Environment Configuration

Add these variables to your `.env.local` file (see `.env.example`):

```env
# MinIO (Local Development)
S3_ENDPOINT=http://localhost:9000
S3_REGION=auto
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=uploads
S3_PUBLIC_URL=http://localhost:9000
```

### Cloudflare R2 Setup

1. Create an R2 bucket in Cloudflare Dashboard
2. Generate API tokens with read/write permissions
3. Update environment variables:

```env
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET_NAME=<your-bucket-name>
S3_PUBLIC_URL=https://<custom-domain-or-public-url>
```

**Note**: For production, configure a custom domain or R2 public URL for the `S3_PUBLIC_URL`.

### Hetzner Object Storage Setup

1. Create a Hetzner Cloud project
2. Enable Object Storage and create a bucket
3. Generate access credentials
4. Update environment variables:

```env
S3_ENDPOINT=https://<region>.your-objectstorage.com
S3_REGION=<region>
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET_NAME=<your-bucket-name>
S3_PUBLIC_URL=https://<region>.your-objectstorage.com
```

### Usage

1. Navigate to `/gallery` in your browser
2. Upload images using drag-and-drop or file picker
3. Images appear in the gallery with dimensions fetched from S3 metadata
4. All images are rendered using Next.js `next/image` for optimization

### How It Works

**Upload Flow:**
1. Client selects/drops image files
2. Preview is generated client-side
3. File is sent to server action
4. Server extracts dimensions using Sharp
5. File is uploaded to S3 with metadata headers:
   - `x-amz-meta-width: 1920`
   - `x-amz-meta-height: 1080`
6. Public URL is returned to client

**Display Flow:**
1. Gallery page fetches list of objects from S3
2. For each image, dimensions are retrieved via `HeadObjectCommand`
3. Images are rendered using `next/image` with proper width/height
4. No database queries needed - all metadata lives on S3

### File Validation

- **Max file size**: 10MB
- **Allowed types**: JPEG, PNG, GIF, WebP
- **Filename sanitization**: Non-alphanumeric characters replaced with underscores
- **Server-side validation**: All checks performed before upload

### Security Considerations

- ✅ File type validation (server-side)
- ✅ File size limits enforced
- ✅ Filename sanitization to prevent path traversal
- ✅ Credentials never exposed to client
- ✅ All uploads handled through server actions

### Troubleshooting

**MinIO Connection Issues:**
- Ensure Docker is running: `docker ps`
- Check MinIO logs: `docker-compose logs minio`
- Verify bucket exists: Access MinIO Console at http://localhost:9001

**Upload Failures:**
- Check environment variables are set correctly
- Verify S3 credentials have write permissions
- Ensure bucket name matches configuration
- Check Next.js logs for detailed error messages

**Image Display Issues:**
- Verify `S3_PUBLIC_URL` is accessible from the browser
- Check Next.js `remotePatterns` configuration in `next.config.js`
- Ensure images were uploaded with metadata (check S3 console/MinIO browser)

## Deployment

### Environment Variables

Make sure to set these environment variables in your deployment platform:

- `DATABASE_URL` - Your database connection string
- `DATABASE_AUTH_TOKEN` - Database authentication token (for Turso/libSQL)
- `BETTER_AUTH_SECRET` - A random secret key (at least 32 characters)
- `BETTER_AUTH_URL` - Your production URL (e.g., `https://yourdomain.com`)
- `S3_ENDPOINT` - S3-compatible endpoint URL
- `S3_REGION` - S3 region (use "auto" for R2/MinIO)
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_BUCKET_NAME` - S3 bucket name
- `S3_PUBLIC_URL` - Public URL for accessing uploaded files (optional, defaults to S3_ENDPOINT)

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