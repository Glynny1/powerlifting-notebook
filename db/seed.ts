// Fills the database with dummy data for local development.
//   npm run db:seed              only runs on an empty database
//   npm run db:seed -- --reset   wipes every table first
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Lift } from "../src/lib/lifts";
import { MAX_KEYS, MEET_DATE_KEY } from "../src/lib/meet";
import type { WarmupStep } from "../src/lib/warmup";
import * as schema from "./schema";
import {
  calorieEntries,
  cues,
  rehabSteps,
  settings,
  warmupPhases,
  weightEntries,
} from "./schema";

const step = (text: string, extra: Omit<WarmupStep, "text" | "done"> = {}) => ({
  text,
  done: false,
  ...extra,
});

// Six phases per lift, in order
const WARMUPS: Record<Lift, WarmupStep[][]> = {
  squat: [
    [
      step("Foam roll quads", { seconds: 60 }),
      step("Foam roll adductors", { seconds: 45 }),
    ],
    [
      step("Leg swings", { reps: "10/side" }),
      step("Walking lunge with reach", { reps: "6/side" }),
    ],
    [
      step("Deep goblet squat hold", { seconds: 45 }),
      step("90/90 hip switches", { reps: "8/side" }),
    ],
    [
      step("Banded glute bridge", { reps: "15" }),
      step("Lateral band walks", { reps: "10/side" }),
    ],
    [
      step("Empty bar squats", { reps: "10" }),
      step("Pause squats at 60kg", {
        reps: "2×3",
        note: "Two-second pause, stay tight in the hole",
      }),
    ],
    [step("Box jumps", { reps: "3" }), step("Squat jumps", { reps: "3" })],
  ],
  bench: [
    [
      step("Foam roll upper back", { seconds: 60 }),
      step("Lacrosse ball on pecs", { seconds: 30, note: "Each side" }),
    ],
    [
      step("Arm circles", { reps: "10/direction" }),
      step("Band pull-aparts", { reps: "15" }),
    ],
    [
      step("Thoracic extensions over roller", { reps: "8" }),
      step("Wall slides", { reps: "10" }),
    ],
    [
      step("Banded face pulls", { reps: "15" }),
      step("Banded external rotations", { reps: "12/side" }),
    ],
    [
      step("Empty bar bench", { reps: "15" }),
      step("Paused bench at 50kg", { reps: "2×5" }),
    ],
    [
      step("Explosive push-ups", { reps: "5" }),
      step("Med ball chest pass", { reps: "5" }),
    ],
  ],
  deadlift: [
    [
      step("Foam roll hamstrings", { seconds: 60 }),
      step("Foam roll glutes", { seconds: 45 }),
    ],
    [step("Leg swings", { reps: "10/side" }), step("Inchworms", { reps: "5" })],
    [
      step("Cat-camel", { reps: "8" }),
      step("Hip hinge with dowel", {
        reps: "10",
        note: "Dowel touching head, upper back and tailbone",
      }),
    ],
    [
      step("Banded good mornings", { reps: "15" }),
      step("Glute bridges", { reps: "15" }),
    ],
    [
      step("Kettlebell deadlifts", { reps: "10" }),
      step("Bar-only RDLs", { reps: "8" }),
    ],
    [
      step("Broad jumps", { reps: "3" }),
      step("Kettlebell swings", { reps: "5" }),
    ],
  ],
};

const REHAB: Record<Lift, WarmupStep[]> = {
  squat: [
    step("Copenhagen plank", { seconds: 20, note: "Each side" }),
    step("Spanish squat hold", { seconds: 45 }),
    step("Tibialis raises", { reps: "20" }),
  ],
  bench: [
    step("Banded external rotations", { reps: "15/side" }),
    step("Prone Y-raises", { reps: "12" }),
    step("Dead hang", { seconds: 30 }),
  ],
  deadlift: [
    step("McGill curl-up", { reps: "5/side" }),
    step("Side plank", { seconds: 30, note: "Each side" }),
    step("Bird dogs", { reps: "8/side" }),
  ],
};

const CUES: Record<Lift | "general", string[]> = {
  squat: [
    "Big breath into the belt, brace before you unrack",
    "Spread the floor with your feet",
    "Knees out on the way down",
    "Drive your back into the bar out of the hole",
  ],
  bench: [
    "Shoulder blades back and down, keep them pinned",
    "Leg drive: push the floor away",
    "Bend the bar, elbows tucked",
    "Touch the same spot every rep",
  ],
  deadlift: [
    "Push the floor away, don't pull with your back",
    "Lats tight: protect your armpits",
    "Drag the bar up your shins",
    "Squeeze your glutes to lock out",
  ],
  general: [
    "Same setup every single rep",
    "Breathe, brace, then move",
    "Fast on the way up",
  ],
};

function isoDaysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// 60 days of history with a few missed days, so the charts look lived-in
const DAYS = Array.from({ length: 60 }, (_, i) => i);

const WEIGHTS = DAYS.filter((i) => i % 7 !== 3).map((i) => ({
  date: isoDaysFromToday(-i),
  // Slow cut from ~82.8kg up to today, with day-to-day noise
  weightKg: (
    82.8 +
    (1.8 * i) / 59 +
    0.4 * Math.sin(i * 1.7) +
    0.2 * Math.cos(i * 0.9)
  ).toFixed(1),
}));

const CALORIES = DAYS.filter((i) => i % 9 !== 4).map((i) => ({
  date: isoDaysFromToday(-i),
  calories:
    Math.round(
      (2700 + 250 * Math.sin(i * 1.3) + 100 * Math.cos(i * 0.7)) / 10,
    ) * 10,
}));

async function main() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env.local");

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });
  const reset = process.argv.includes("--reset");
  const tables = [
    warmupPhases,
    rehabSteps,
    cues,
    weightEntries,
    calorieEntries,
    settings,
  ];

  try {
    if (!reset) {
      // One at a time: parallel queries on one connection hang on
      // Supabase's transaction pooler
      let rows = 0;
      for (const t of tables) rows += await db.$count(t);
      if (rows > 0) {
        console.error(
          "The database already has data. Run `npm run db:seed -- --reset` to wipe it and reseed.",
        );
        process.exitCode = 1;
        return;
      }
    }

    await db.transaction(async (tx) => {
      if (reset) for (const t of tables) await tx.delete(t);

      await tx
        .insert(warmupPhases)
        .values(
          Object.entries(WARMUPS).flatMap(([lift, phases]) =>
            phases.map((steps, i) => ({
              lift: lift as Lift,
              phase: i + 1,
              steps,
            })),
          ),
        );
      await tx
        .insert(rehabSteps)
        .values(
          Object.entries(REHAB).map(([lift, steps]) => ({
            lift: lift as Lift,
            steps,
          })),
        );
      await tx
        .insert(cues)
        .values(
          Object.entries(CUES).flatMap(([lift, texts]) =>
            texts.map((text, position) => ({
              lift: lift as Lift | "general",
              text,
              position,
            })),
          ),
        );
      await tx.insert(weightEntries).values(WEIGHTS);
      await tx.insert(calorieEntries).values(CALORIES);
      await tx.insert(settings).values([
        { key: MEET_DATE_KEY, value: isoDaysFromToday(84) },
        { key: MAX_KEYS.squat, value: "200" },
        { key: MAX_KEYS.bench, value: "130" },
        { key: MAX_KEYS.deadlift, value: "240" },
      ]);
    });

    console.log(
      `Seeded warm-ups, rehab, ${Object.values(CUES).flat().length} cues, ` +
        `${WEIGHTS.length} weight and ${CALORIES.length} calorie entries, and meet prep settings.`,
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
