// Every Supabase read and write the app makes. Steps arrays are always
// written whole, so a retried or replayed write can't double-apply.
//
// Rows belong to the signed-in account: the database fills in user_id itself
// (defaultToNull: false lets that default apply to upserts) and row-level
// security means reads only ever return the current user's rows.
import type { Lift } from "@/lib/lifts";
import { supabase } from "@/lib/supabase";
import { normalizeSteps, type WarmupStep } from "@/lib/warmup";

export type CueLift = Lift | "general";
export type Cue = { id: number; lift: CueLift; text: string; position: number };
export type DailyEntry = { date: string; value: number };
export type StepsBySection = Record<number, WarmupStep[]>;

function db() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

// Supabase only returns null data alongside an error
function check<T>(result: {
  data: T | null;
  error: { message: string } | null;
}): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// Warm-ups: one row per lift × phase

export async function fetchWarmups(lift: Lift): Promise<StepsBySection> {
  const rows = check(
    await db().from("warmup_phases").select("phase, steps").eq("lift", lift)
  );
  return Object.fromEntries(
    rows.map((r) => [r.phase as number, normalizeSteps(r.steps)])
  );
}

export async function saveWarmups(vars: {
  lift: Lift;
  phases: StepsBySection;
}): Promise<void> {
  const rows = Object.entries(vars.phases).map(([phase, steps]) => ({
    lift: vars.lift,
    phase: Number(phase),
    steps,
  }));
  check(await db().from("warmup_phases").upsert(rows, { onConflict: "user_id,lift,phase", defaultToNull: false }));
}

// Rehab: one row per lift

export async function fetchRehab(lift: Lift): Promise<WarmupStep[]> {
  const rows = check(
    await db().from("rehab_steps").select("steps").eq("lift", lift)
  );
  return normalizeSteps(rows[0]?.steps);
}

export async function saveRehab(vars: {
  lift: Lift;
  steps: WarmupStep[];
}): Promise<void> {
  check(await db().from("rehab_steps").upsert(vars, { onConflict: "user_id,lift", defaultToNull: false }));
}

// Cues

export async function fetchCues(lift: CueLift): Promise<Cue[]> {
  return check(
    await db()
      .from("cues")
      .select("id, lift, text, position")
      .eq("lift", lift)
      .order("position")
      .order("id")
  ) as Cue[];
}

export async function addCue(vars: { lift: CueLift; text: string }) {
  check(await db().from("cues").insert(vars));
}

export async function updateCue(vars: { id: number; text: string }) {
  check(await db().from("cues").update({ text: vars.text }).eq("id", vars.id));
}

export async function deleteCue(vars: { id: number }) {
  check(await db().from("cues").delete().eq("id", vars.id));
}

// Bodyweight and calories: one value per day, newest first

export async function fetchWeights(): Promise<DailyEntry[]> {
  const rows = check(
    await db()
      .from("weight_entries")
      .select("date, weight_kg")
      .order("date", { ascending: false })
      .limit(90)
  );
  return rows.map((r) => ({ date: r.date, value: Number(r.weight_kg) }));
}

export async function saveWeight(vars: DailyEntry) {
  check(
    await db()
      .from("weight_entries")
      .upsert(
        { date: vars.date, weight_kg: vars.value.toFixed(2) },
        { onConflict: "user_id,date", defaultToNull: false }
      )
  );
}

export async function deleteWeight(vars: { date: string }) {
  check(await db().from("weight_entries").delete().eq("date", vars.date));
}

export async function fetchCalories(): Promise<DailyEntry[]> {
  const rows = check(
    await db()
      .from("calorie_entries")
      .select("date, calories")
      .order("date", { ascending: false })
      .limit(90)
  );
  return rows.map((r) => ({ date: r.date, value: r.calories }));
}

export async function saveCalories(vars: DailyEntry) {
  check(
    await db()
      .from("calorie_entries")
      .upsert({ date: vars.date, calories: vars.value }, { onConflict: "user_id,date", defaultToNull: false })
  );
}

export async function deleteCalories(vars: { date: string }) {
  check(await db().from("calorie_entries").delete().eq("date", vars.date));
}

// Settings: key/value pairs

export async function fetchSettings(): Promise<Record<string, string>> {
  const rows = check(await db().from("settings").select("key, value"));
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function saveSettings(values: Record<string, string>) {
  const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
  check(await db().from("settings").upsert(rows, { onConflict: "user_id,key", defaultToNull: false }));
}
