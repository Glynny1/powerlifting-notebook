import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// drizzle-kit runs its schema queries in parallel, which hangs on Supabase's
// transaction pooler (6543); the session pooler (5432) on the same host handles it
const url = process.env.DATABASE_URL?.replace(/:6543\//, ":5432/");

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: url! },
  // Supabase owns the anon/authenticated roles; only manage our policies
  entities: { roles: { provider: "supabase" } },
});
