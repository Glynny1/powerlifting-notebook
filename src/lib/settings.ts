import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { settings } from "./db/schema";

export async function getSetting(key: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
