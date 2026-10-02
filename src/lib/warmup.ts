// Dr John Rusin's six-phase warm-up (6–10 minutes, run top to bottom)
export const WARMUP_PHASES = [
  {
    phase: 1,
    title: "Soft tissue work",
    blurb: "Foam roll the sore or tight spots you'll be loading today.",
    placeholder: "Foam roll quads",
  },
  {
    phase: 2,
    title: "Dynamic stretching",
    blurb: "Dynamically stretch the areas you just rolled.",
    placeholder: "Leg swings x10/side",
  },
  {
    phase: 3,
    title: "Corrective exercise",
    blurb: "Multi-joint mobility work and skill drills.",
    placeholder: "Deep goblet squat hold",
  },
  {
    phase: 4,
    title: "Muscle activation",
    blurb:
      "Bands or bodyweight to wake the target muscles up and build a strong mind-muscle connection.",
    placeholder: "Banded glute bridge x15",
  },
  {
    phase: 5,
    title: "Movement pattern prep",
    blurb: "Groove the exact patterns you're about to train.",
    placeholder: "Empty bar squats x10",
  },
  {
    phase: 6,
    title: "CNS stimulation",
    blurb:
      "Quick explosive movements — jumps, fast skips, hops — to switch the nervous system on.",
    placeholder: "Box jumps x3",
  },
] as const;

export type WarmupPhaseNumber = (typeof WARMUP_PHASES)[number]["phase"];

export type WarmupStep = {
  text: string;
  done: boolean;
  seconds?: number; // time-based → countdown timer
  reps?: string; // rep-based → static chip, e.g. "15", "8/side", "2×6"
  note?: string; // coaching detail shown under the name
};

// Steps were stored as plain strings before ticking existed — accept both
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

// "15" reads better as "×15"; "8/side" and "2×6" stay as written
export function formatReps(reps: string): string {
  return /^\d+$/.test(reps) ? `×${reps}` : reps;
}

// Section list for the shared exercise components
export function warmupSections(stepsByPhase: Record<number, WarmupStep[]>) {
  return WARMUP_PHASES.map((p) => ({
    id: p.phase,
    number: p.phase,
    title: p.title,
    blurb: p.blurb,
    placeholder: p.placeholder,
    steps: stepsByPhase[p.phase] ?? [],
  }));
}

export function formatSeconds(total: number): string {
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Rehab uses the same step system as one flat list per lift
export const REHAB_PLACEHOLDER = "e.g. Banded hip distraction";
