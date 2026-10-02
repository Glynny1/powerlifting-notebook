"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { warmupPhases } from "@/lib/db/schema";
import type { Lift } from "@/lib/lifts";
import { normalizeSteps, type WarmupStep } from "@/lib/warmup";

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  return db;
}

async function readSteps(lift: Lift, phase: number): Promise<WarmupStep[]> {
  const rows = await requireDb()
    .select()
    .from(warmupPhases)
    .where(and(eq(warmupPhases.lift, lift), eq(warmupPhases.phase, phase)));
  return normalizeSteps(rows[0]?.steps);
}

async function writeSteps(lift: Lift, phase: number, steps: WarmupStep[]) {
  await requireDb()
    .insert(warmupPhases)
    .values({ lift, phase, steps })
    .onConflictDoUpdate({
      target: [warmupPhases.lift, warmupPhases.phase],
      set: { steps },
    });
  revalidatePath(`/warmups/${lift}`);
}

export async function addWarmupStep(
  lift: Lift,
  phase: number,
  formData: FormData
): Promise<WarmupStep[]> {
  if (!Number.isInteger(phase) || phase < 1 || phase > 6) return [];
  const text = String(formData.get("text") ?? "").trim();
  const rawSeconds = String(formData.get("seconds") ?? "").trim();
  const reps = String(formData.get("reps") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!text) return readSteps(lift, phase);

  const step: WarmupStep = { text, done: false };
  const seconds = Number(rawSeconds);
  if (rawSeconds && Number.isInteger(seconds) && seconds >= 1 && seconds <= 3600) {
    step.seconds = seconds;
  }
  if (reps) step.reps = reps.slice(0, 30);
  if (note) step.note = note.slice(0, 200);

  const steps = [...(await readSteps(lift, phase)), step];
  await writeSteps(lift, phase, steps);
  return steps;
}

export async function removeWarmupStep(
  lift: Lift,
  phase: number,
  index: number
): Promise<WarmupStep[]> {
  const steps = await readSteps(lift, phase);
  if (index < 0 || index >= steps.length) return steps;
  steps.splice(index, 1);
  await writeSteps(lift, phase, steps);
  return steps;
}

export async function toggleWarmupStep(
  lift: Lift,
  phase: number,
  index: number,
  done: boolean
) {
  const db = requireDb();
  const steps = await readSteps(lift, phase);
  if (!steps[index]) return;

  steps[index] = { ...steps[index], done };
  await db
    .update(warmupPhases)
    .set({ steps })
    .where(and(eq(warmupPhases.lift, lift), eq(warmupPhases.phase, phase)));
}

export async function resetWarmupTicks(lift: Lift) {
  const db = requireDb();
  const rows = await db
    .select()
    .from(warmupPhases)
    .where(eq(warmupPhases.lift, lift));

  for (const row of rows) {
    const steps = normalizeSteps(row.steps).map((s) => ({
      ...s,
      done: false,
    }));
    await db
      .update(warmupPhases)
      .set({ steps })
      .where(
        and(eq(warmupPhases.lift, lift), eq(warmupPhases.phase, row.phase))
      );
  }
  revalidatePath(`/warmups/${lift}`);
}
