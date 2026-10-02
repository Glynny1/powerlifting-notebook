"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { calorieEntries } from "@/lib/db/schema";

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  return db;
}

export async function saveCalories(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const value = Number(formData.get("value"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  if (!Number.isInteger(value) || value < 0 || value > 20000) return;

  await requireDb()
    .insert(calorieEntries)
    .values({ date, calories: value })
    .onConflictDoUpdate({
      target: calorieEntries.date,
      set: { calories: value },
    });
  revalidatePath("/calories");
}

export async function deleteCalories(date: string) {
  await requireDb()
    .delete(calorieEntries)
    .where(eq(calorieEntries.date, date));
  revalidatePath("/calories");
}
