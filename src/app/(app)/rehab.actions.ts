"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { rehabSteps } from "@/lib/db/schema";
import type { Lift } from "@/lib/lifts";
import { normalizeSteps, type WarmupStep } from "@/lib/warmup";

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  return db;
}

async function readSteps(lift: Lift): Promise<WarmupStep[]> {
  const rows = await requireDb()
    .select()
    .from(rehabSteps)
    .where(eq(rehabSteps.lift, lift));
  return normalizeSteps(rows[0]?.steps);
}

async function writeSteps(lift: Lift, steps: WarmupStep[]) {
  await requireDb()
    .insert(rehabSteps)
    .values({ lift, steps })
    .onConflictDoUpdate({ target: rehabSteps.lift, set: { steps } });
  revalidatePath(`/rehab/${lift}`);
}

// The unused section argument keeps these signature-compatible with the
// shared exercise components (warm-ups pass a phase there).
export async function addRehabStep(
  lift: Lift,
  _section: number,
  formData: FormData
): Promise<WarmupStep[]> {
  const text = String(formData.get("text") ?? "").trim();
  const rawSeconds = String(formData.get("seconds") ?? "").trim();
  const reps = String(formData.get("reps") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!text) return readSteps(lift);

  const step: WarmupStep = { text, done: false };
  const seconds = Number(rawSeconds);
  if (rawSeconds && Number.isInteger(seconds) && seconds >= 1 && seconds <= 3600) {
    step.seconds = seconds;
  }
  if (reps) step.reps = reps.slice(0, 30);
  if (note) step.note = note.slice(0, 200);

  const steps = [...(await readSteps(lift)), step];
  await writeSteps(lift, steps);
  return steps;
}

export async function removeRehabStep(
  lift: Lift,
  _section: number,
  index: number
): Promise<WarmupStep[]> {
  const steps = await readSteps(lift);
  if (index < 0 || index >= steps.length) return steps;
  steps.splice(index, 1);
  await writeSteps(lift, steps);
  return steps;
}

export async function toggleRehabStep(
  lift: Lift,
  _section: number,
  index: number,
  done: boolean
) {
  const db = requireDb();
  const steps = await readSteps(lift);
  if (!steps[index]) return;
  steps[index] = { ...steps[index], done };
  await db
    .update(rehabSteps)
    .set({ steps })
    .where(eq(rehabSteps.lift, lift));
}

export async function resetRehabTicks(lift: Lift) {
  const steps = (await readSteps(lift)).map((s) => ({ ...s, done: false }));
  await writeSteps(lift, steps);
}
