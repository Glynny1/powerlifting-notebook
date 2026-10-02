"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { cues } from "@/lib/db/schema";
import type { Lift } from "@/lib/lifts";

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  return db;
}

export async function createCue(lift: Lift, formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await requireDb().insert(cues).values({ lift, text });
  revalidatePath(`/cues/${lift}`);
}

export async function updateCue(lift: Lift, id: number, formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await requireDb().update(cues).set({ text }).where(eq(cues.id, id));
  revalidatePath(`/cues/${lift}`);
}

export async function deleteCue(lift: Lift, id: number) {
  await requireDb().delete(cues).where(eq(cues.id, id));
  revalidatePath(`/cues/${lift}`);
}
