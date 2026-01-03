import { defineConfig } from "drizzle-kit";

import { env } from "@/env";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "turso",

  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },

  casing: "snake_case",
  strict: true,
  verbose: true,
});
