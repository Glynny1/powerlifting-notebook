import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

// Kept on globalThis so dev hot reloads reuse one connection pool
const globalForDb = globalThis as unknown as { db?: Db };

// Lazy so the app still renders (with a setup notice) before Supabase is connected
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // Supabase's transaction pooler doesn't support prepared statements
  globalForDb.db ??= drizzle(postgres(url, { prepare: false }), { schema });
  return globalForDb.db;
}
