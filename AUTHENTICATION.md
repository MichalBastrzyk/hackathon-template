# Authentication Implementation

This document describes the authentication implementation in this Next.js template.

## Overview

Authentication is implemented using [better-auth](https://www.better-auth.com) with the email/password provider. It's fully integrated with tRPC for type-safe authenticated API calls.

## Architecture

### Database Schema

The following tables are used for authentication (defined in `src/db/schema.ts`):

- **user**: Stores user information (id, name, email, emailVerified, image)
- **session**: Manages active sessions with tokens and expiration
- **account**: Stores authentication provider data and hashed passwords
- **verification**: Handles email verification tokens

### Auth Configuration

The auth instance is configured in `src/server/auth/config.ts`:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
});
```

### tRPC Integration

The tRPC context includes session data:

```typescript
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    session,
    ...opts,
  };
};
```

A `protectedProcedure` middleware ensures authentication:

```typescript
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
```

## Usage Examples

### Client-Side Authentication

Using the React hook:

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

### Server-Side Authentication

In Server Components or Route Handlers:

```tsx
import { auth } from "@/server/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    redirect("/auth/signin");
  }
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

### Protected tRPC Procedures

```typescript
export const myRouter = createTRPCRouter({
  protectedQuery: protectedProcedure
    .query(({ ctx }) => {
      // ctx.session.user is guaranteed to be non-null
      return {
        userId: ctx.session.user.id,
        userName: ctx.session.user.name,
      };
    }),
    
  protectedMutation: protectedProcedure
    .input(z.object({ data: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Access authenticated user
      const userId = ctx.session.user.id;
      
      // Perform authenticated action
      return ctx.db.insert(table).values({
        ...input,
        userId,
      });
    }),
});
```

## Security Considerations

### Implemented Security Features

1. **Password Hashing**: Better-auth handles password hashing automatically using bcrypt
2. **Session Management**: Secure session tokens with expiration
3. **CSRF Protection**: Built into better-auth
4. **Type Safety**: Full TypeScript type safety prevents common errors
5. **Protected Routes**: Server-side session validation for protected pages
6. **Protected API Endpoints**: tRPC middleware ensures authenticated access

### Environment Variables

Critical secrets are stored in environment variables:

```env
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

**Important**: Never commit `.env` files. Use `.env.example` as a template.

### Best Practices

1. **Always validate sessions server-side** for protected routes
2. **Use `protectedProcedure`** for authenticated tRPC endpoints
3. **Never expose user passwords** or session tokens
4. **Rotate secrets regularly** in production
5. **Enable HTTPS** in production for secure transmission

## Testing

The following authentication flows have been tested:

- ✅ User registration (sign up)
- ✅ User login (sign in)
- ✅ Session persistence across requests
- ✅ Protected tRPC procedures (requires authentication)
- ✅ Protected routes (redirects to sign in)
- ✅ Sign out (clears session)

## Future Enhancements

Potential improvements for production use:

1. **Email Verification**: Enable `requireEmailVerification: true`
2. **Password Reset**: Implement email-based password reset flow
3. **OAuth Providers**: Add social login (Google, GitHub, etc.)
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **Rate Limiting**: Implement rate limiting on auth endpoints
6. **Account Lockout**: Lock accounts after failed login attempts
7. **Session Management**: Add ability to view and revoke active sessions

## Troubleshooting

### Common Issues

1. **"UNAUTHORIZED" error on protected procedures**
   - Ensure user is logged in
   - Check session cookies are being sent
   - Verify `BETTER_AUTH_SECRET` is set

2. **Sign in/sign up not working**
   - Check database connection
   - Verify `BETTER_AUTH_URL` matches your domain
   - Check browser console for errors

3. **Session not persisting**
   - Verify cookies are enabled
   - Check `BETTER_AUTH_URL` matches the current domain
   - Ensure HTTPS is used in production

## References

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
