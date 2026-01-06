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

## Email

This project includes a complete email pipeline for transactional emails (signup verification, password resets, etc.) using Nodemailer, MailHog, and React Email.

### Quick Start

1. **Start MailHog (Mock SMTP Server)**
   ```bash
   docker-compose up -d mailhog
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and configure SMTP settings:
   ```bash
   # For local development with MailHog (default)
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_SECURE=false
   SMTP_FROM_EMAIL=noreply@localhost
   SMTP_FROM_NAME=Hackathon Template
   ```

3. **Test Email Sending**
   ```bash
   npm run demo:email
   ```

4. **View Emails in MailHog**
   
   Open your browser to [http://localhost:8025](http://localhost:8025) to see captured emails.

### Email Templates

Email templates are located in the `emails/` directory and use React Email with TailwindCSS.

#### Preview Templates

Start the React Email development server:
```bash
npm run email:dev
```

Then open [http://localhost:3001](http://localhost:3001) to preview templates with live reload.

#### Create New Templates

1. Create a new `.tsx` file in `emails/` directory
2. Use React Email components and Tailwind utility classes
3. Export the component

Example:
```tsx
import { Html, Button, Container } from "@react-email/components";

export function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <Html>
      <Container>
        <h1 className="text-2xl font-bold">Welcome {userName}!</h1>
        <Button href="https://example.com" className="bg-blue-600 text-white">
          Get Started
        </Button>
      </Container>
    </Html>
  );
}
```

### Sending Emails

Use the `emailClient` service to send emails from your application:

```tsx
import { emailClient } from "@/server/email";
import { WelcomeEmail } from "../../../emails/welcome-email";

// Send an email
const result = await emailClient.sendEmail({
  to: "user@example.com",
  subject: "Welcome to Our App",
  reactEmailTemplate: WelcomeEmail({ userName: "John" }),
});

if (result.success) {
  console.log("Email sent:", result.messageId);
}
```

### Better-Auth Integration

Email verification is automatically integrated with better-auth signups. When a user signs up:

1. A verification email is sent using the `VerificationEmail` template
2. The email includes a verification link with a token
3. Clicking the link verifies the user's email address

The integration is configured in `src/server/auth/config.ts`:
```tsx
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, url, token }) => {
    await emailClient.sendEmail({
      to: user.email,
      subject: "Verify Your Email Address",
      reactEmailTemplate: VerificationEmail({
        userName: user.name,
        verificationUrl: url,
        verificationToken: token,
      }),
    });
  },
}
```

### Switching SMTP Providers

The email service is designed to work with any SMTP provider. Update environment variables to switch providers:

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

#### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Troubleshooting

#### Emails Not Appearing in MailHog

1. Check if MailHog is running:
   ```bash
   docker ps | grep mailhog
   ```

2. Verify SMTP configuration:
   ```bash
   npm run demo:email
   ```

3. Check MailHog logs:
   ```bash
   docker logs hackathon-mailhog
   ```

#### SMTP Connection Errors

1. Verify environment variables are set correctly
2. Check firewall settings if using external SMTP
3. For Gmail, ensure "App Passwords" are enabled
4. For SendGrid, verify API key permissions

#### Email Rendering Issues

1. Test templates in preview mode:
   ```bash
   npm run email:dev
   ```

2. Check browser console for errors
3. Verify all React Email components are properly imported

### Docker Compose Commands

```bash
# Start MailHog
docker-compose up -d mailhog

# Stop MailHog
docker-compose down

# View logs
docker logs hackathon-mailhog -f

# Restart MailHog
docker-compose restart mailhog
```

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
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (usually 587 for TLS or 465 for SSL)
- `SMTP_SECURE` - Set to `true` for SSL, `false` for TLS/STARTTLS
- `SMTP_USER` - SMTP username (if required)
- `SMTP_PASSWORD` - SMTP password (if required)
- `SMTP_FROM_EMAIL` - From email address for outgoing emails
- `SMTP_FROM_NAME` - From name for outgoing emails

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