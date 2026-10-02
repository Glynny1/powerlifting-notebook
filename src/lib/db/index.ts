import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

// Lazy so the app still renders (with a setup notice) before Neon is connected
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!cached) cached = drizzle(neon(url), { schema });
  return cached;
}
