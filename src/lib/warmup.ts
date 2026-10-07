export type WarmupStep = {
  text: string;
  done: boolean;
  seconds?: number; // time-based → countdown timer
  reps?: string; // rep-based → static chip, e.g. "15", "8/side", "2×6"
  note?: string; // coaching detail shown under the name
};

// A lift's warm-up is an ordered list of sections the user controls, e.g.
// the six phases of Dr John Rusin's warm-up, or one simple list
export type WarmupSection = {
  id: string;
  title: string;
  notes: string;
  steps: WarmupStep[];
};

// Steps were stored as plain strings before ticking existed, so accept both
export function normalizeSteps(raw: unknown): WarmupStep[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): WarmupStep | null => {
      if (typeof item === "string") return { text: item, done: false };
      if (item && typeof item === "object" && typeof item.text === "string") {
        const step: WarmupStep = { text: item.text, done: item.done === true };
        if (
          Number.isInteger(item.seconds) &&
          item.seconds >= 1 &&
          item.seconds <= 3600
        ) {
          step.seconds = item.seconds;
        }
        if (typeof item.reps === "string" && item.reps.trim()) {
          step.reps = item.reps.trim().slice(0, 30);
        }
        if (typeof item.note === "string" && item.note.trim()) {
          step.note = item.note.trim().slice(0, 200);
        }
        return step;
      }
      return null;
    })
    .filter((s): s is WarmupStep => s !== null);
}

// Section ids only need to be unique within one lift's warm-up
export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function normalizeSections(raw: unknown): WarmupSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && typeof s === "object" && typeof s.title === "string")
    .map((s) => ({
      id: typeof s.id === "string" && s.id ? s.id : makeId(),
      title: s.title.trim().slice(0, 60) || "Untitled section",
      notes: typeof s.notes === "string" ? s.notes.trim().slice(0, 300) : "",
      steps: normalizeSteps(s.steps),
    }));
}

export function newSection(title: string, notes = ""): WarmupSection {
  return { id: makeId(), title, notes, steps: [] };
}

// "15" reads better as "×15"; "8/side" and "2×6" stay as written
export function formatReps(reps: string): string {
  return /^\d+$/.test(reps) ? `×${reps}` : reps;
}

export function formatSeconds(total: number): string {
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Rehab uses the same step system as one flat list per lift
export const REHAB_PLACEHOLDER = "e.g. Banded hip distraction";
