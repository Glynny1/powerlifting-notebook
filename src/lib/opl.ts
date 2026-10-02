import Papa from "papaparse";
import { getDb } from "./db";
import { getSetting } from "./settings";

export const OPL_USERNAME_KEY = "opl_username";

type RawRow = Record<string, string>;

export type OplMeet = {
  date: string;
  meetName: string;
  federation: string;
  equipment: string;
  weightClassKg: string;
  bodyweightKg: number | null;
  squat: number | null;
  bench: number | null;
  deadlift: number | null;
  total: number | null;
  dots: number | null;
  place: string;
};

export type OplStats = {
  bestSquat: number | null;
  bestBench: number | null;
  bestDeadlift: number | null;
  bestTotal: number | null;
  bestDots: number | null;
  meetCount: number;
};

export type OplData =
  | { state: "no-db" }
  | { state: "unset" }
  | { state: "error"; message: string }
  | { state: "ok"; username: string; stats: OplStats; meets: OplMeet[] };

function num(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function best(values: (number | null)[]): number | null {
  const finite = values.filter((v): v is number => v !== null);
  return finite.length ? Math.max(...finite) : null;
}

export async function getOplData(): Promise<OplData> {
  if (!getDb()) return { state: "no-db" };

  const username = await getSetting(OPL_USERNAME_KEY);
  if (!username) return { state: "unset" };

  let csv: string;
  try {
    const res = await fetch(
      `https://www.openpowerlifting.org/api/liftercsv/${encodeURIComponent(username)}`,
      { next: { revalidate: 86400, tags: ["opl"] } }
    );
    if (res.status === 404) {
      return {
        state: "error",
        message: `No lifter found for “${username}” — check the username in Settings.`,
      };
    }
    if (!res.ok) {
      return {
        state: "error",
        message: `OpenPowerlifting responded with ${res.status}. Try again later.`,
      };
    }
    csv = await res.text();
  } catch {
    return {
      state: "error",
      message: "Couldn't reach openpowerlifting.org. Try again later.",
    };
  }

  const parsed = Papa.parse<RawRow>(csv.trim(), { header: true });
  const meets: OplMeet[] = parsed.data
    .filter((row) => row.Date)
    .map((row) => ({
      date: row.Date,
      meetName: row.MeetName ?? "",
      federation: row.Federation ?? "",
      equipment: row.Equipment ?? "",
      weightClassKg: row.WeightClassKg ?? "",
      bodyweightKg: num(row.BodyweightKg),
      squat: num(row.Best3SquatKg),
      bench: num(row.Best3BenchKg),
      deadlift: num(row.Best3DeadliftKg),
      total: row.Event === "SBD" ? num(row.TotalKg) : null,
      dots: num(row.Dots),
      place: row.Place ?? "",
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const stats: OplStats = {
    bestSquat: best(meets.map((m) => m.squat)),
    bestBench: best(meets.map((m) => m.bench)),
    bestDeadlift: best(meets.map((m) => m.deadlift)),
    bestTotal: best(meets.map((m) => m.total)),
    bestDots: best(meets.map((m) => m.dots)),
    meetCount: meets.length,
  };

  return { state: "ok", username, stats, meets };
}
