import { sql } from "drizzle-orm";
import {
  date,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

// Signed-out visitors can't read or write anything. Until rows belong to
// individual accounts, every signed-in user shares the same notebook.
const signedInOnly = () =>
  pgPolicy("signed in users only", {
    for: "all",
    to: authenticatedRole,
    using: sql`true`,
    withCheck: sql`true`,
  });

// One row per lift x warm-up phase (Rusin six-phase structure).
// Steps carry their tick state; older rows may still hold plain strings,
// so read through normalizeSteps().
export const warmupPhases = pgTable(
  "warmup_phases",
  {
    lift: text("lift", { enum: ["squat", "bench", "deadlift"] }).notNull(),
    phase: integer("phase").notNull(),
    steps: jsonb("steps")
      .$type<
        {
          text: string;
          done: boolean;
          seconds?: number;
          reps?: string;
          note?: string;
        }[]
      >()
      .notNull()
      .default([]),
  },
  (t) => [primaryKey({ columns: [t.lift, t.phase] }), signedInOnly()],
);

// Rehab mirrors the warm-up exercise system: one flat list per lift
export const rehabSteps = pgTable(
  "rehab_steps",
  {
    lift: text("lift", { enum: ["squat", "bench", "deadlift"] }).primaryKey(),
    steps: jsonb("steps")
      .$type<
        {
          text: string;
          done: boolean;
          seconds?: number;
          reps?: string;
          note?: string;
        }[]
      >()
      .notNull()
      .default([]),
  },
  () => [signedInOnly()],
);

export const cues = pgTable(
  "cues",
  {
    id: serial("id").primaryKey(),
    lift: text("lift", {
      enum: ["squat", "bench", "deadlift", "general"],
    }).notNull(),
    text: text("text").notNull(),
    position: integer("position").notNull().default(0),
  },
  () => [signedInOnly()],
);

export const weightEntries = pgTable(
  "weight_entries",
  {
    date: date("date").primaryKey(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
  },
  () => [signedInOnly()],
);

export const calorieEntries = pgTable(
  "calorie_entries",
  {
    date: date("date").primaryKey(),
    calories: integer("calories").notNull(),
  },
  () => [signedInOnly()],
);

export const settings = pgTable(
  "settings",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
  },
  () => [signedInOnly()],
);

export type Cue = typeof cues.$inferSelect;
