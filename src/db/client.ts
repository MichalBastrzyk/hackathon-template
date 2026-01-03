import "server-only";

import { type Client, createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "@/env";

const globalForDb = globalThis as unknown as {
  sqliteInstance?: Client;
  drizzleDb?: ReturnType<typeof drizzle>;
};

const client =
  globalForDb.sqliteInstance ??
  (() => {
    const instance = createClient({
      url: env.DATABASE_URL,
      authToken: env.DATABASE_AUTH_TOKEN,
    });
    globalForDb.sqliteInstance = instance;
    return instance;
  })();

const db = globalForDb.drizzleDb ?? drizzle(client, { casing: "snake_case" });

if (!globalForDb.drizzleDb) {
  globalForDb.drizzleDb = db;
}

export { db };
