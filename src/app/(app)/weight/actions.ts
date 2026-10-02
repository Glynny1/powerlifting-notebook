"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { weightEntries } from "@/lib/db/schema";

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  return db;
}

export async function saveWeight(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const value = Number(formData.get("value"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  if (!Number.isFinite(value) || value < 25 || value > 350) return;

  const weightKg = value.toFixed(2);
  await requireDb()
    .insert(weightEntries)
    .values({ date, weightKg })
    .onConflictDoUpdate({ target: weightEntries.date, set: { weightKg } });
  revalidatePath("/weight");
}

export async function deleteWeight(date: string) {
  await requireDb().delete(weightEntries).where(eq(weightEntries.date, date));
  revalidatePath("/weight");
}
