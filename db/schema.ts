import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";

// Every notebook row belongs to one account. The app never sends user_id:
// the database fills it in from the signed-in user, and deleting an account
// deletes its rows.
const owner = () =>
  uuid("user_id")
    .notNull()
    .default(sql`auth.uid()`)
    .references(() => authUsers.id, { onDelete: "cascade" });

// Signed-in users can only see and change their own rows; signed-out
// visitors get nothing
const ownRowsOnly = (userId: AnyPgColumn) =>
  pgPolicy("users manage their own rows", {
    for: "all",
    to: authenticatedRole,
    using: sql`${userId} = ${authUid}`,
    withCheck: sql`${userId} = ${authUid}`,
  });

type WarmupStepRow = {
  text: string;
  done: boolean;
  seconds?: number;
  reps?: string;
  note?: string;
};

// One row per account x lift x warm-up phase (Rusin six-phase structure).
// Steps carry their tick state; older rows may still hold plain strings,
// so read through normalizeSteps().
export const warmupPhases = pgTable(
  "warmup_phases",
  {
    userId: owner(),
    lift: text("lift", { enum: ["squat", "bench", "deadlift"] }).notNull(),
    phase: integer("phase").notNull(),
    steps: jsonb("steps").$type<WarmupStepRow[]>().notNull().default([]),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.lift, t.phase] }),
    ownRowsOnly(t.userId),
  ]
);

// Rehab mirrors the warm-up exercise system: one flat list per account x lift
export const rehabSteps = pgTable(
  "rehab_steps",
  {
    userId: owner(),
    lift: text("lift", { enum: ["squat", "bench", "deadlift"] }).notNull(),
    steps: jsonb("steps").$type<WarmupStepRow[]>().notNull().default([]),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lift] }), ownRowsOnly(t.userId)]
);

export const cues = pgTable(
  "cues",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    lift: text("lift", {
      enum: ["squat", "bench", "deadlift", "general"],
    }).notNull(),
    text: text("text").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("cues_user_id_lift_idx").on(t.userId, t.lift), ownRowsOnly(t.userId)]
);

// One value per account per day
export const weightEntries = pgTable(
  "weight_entries",
  {
    userId: owner(),
    date: date("date").notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] }), ownRowsOnly(t.userId)]
);

export const calorieEntries = pgTable(
  "calorie_entries",
  {
    userId: owner(),
    date: date("date").notNull(),
    calories: integer("calories").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] }), ownRowsOnly(t.userId)]
);

export const settings = pgTable(
  "settings",
  {
    userId: owner(),
    key: text("key").notNull(),
    value: text("value").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] }), ownRowsOnly(t.userId)]
);

// One row per account, created by the on_auth_user_created trigger in
// db/sql/profiles.sql from the username given at sign-up. Usernames are
// stored lowercase, so uniqueness ignores capitals.
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    username: text("username").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("username_format", sql`${t.username} ~ '^[a-z0-9_]{3,20}$'`),
    pgPolicy("users read their own profile", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.id} = ${authUid}`,
    }),
    pgPolicy("users update their own profile", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.id} = ${authUid}`,
      withCheck: sql`${t.id} = ${authUid}`,
    }),
  ]
);

export type Cue = typeof cues.$inferSelect;
