import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { env } from "@/env";

import { VerificationEmail } from "../../../emails/verification-email";
import { emailClient } from "../email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Custom email verification sender
    sendVerificationEmail: async ({ user, url, token }) => {
      // Send verification email using our email service
      const result = await emailClient.sendEmail({
        to: user.email,
        subject: "Verify Your Email Address",
        reactEmailTemplate: VerificationEmail({
          userName: user.name,
          verificationUrl: url,
          verificationToken: token,
          expiresIn: "24 hours",
        }),
      });

      if (!result.success) {
        console.error(
          "[Auth] Failed to send verification email:",
          result.error,
        );
        throw new Error("Failed to send verification email");
      }

      if (env.NODE_ENV === "development" && result.previewUrl) {
        console.log(
          `[Auth] Verification email sent. Preview: ${result.previewUrl}`,
        );
      }
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.BETTER_AUTH_URL],
});

export type AuthSession = typeof auth.$Infer.Session;
