import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    // S3-compatible storage configuration
    S3_ENDPOINT: z.string().url(),
    S3_REGION: z.string().default("auto"),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1),
    S3_PUBLIC_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: process.env,
});
