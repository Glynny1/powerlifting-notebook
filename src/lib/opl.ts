import Papa from "papaparse";
import { Platform } from "react-native";

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

export type OplRecord = { stats: OplStats; meets: OplMeet[] };

function num(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function best(values: (number | null)[]): number | null {
  const finite = values.filter((v): v is number => v !== null);
  return finite.length ? Math.max(...finite) : null;
}

// Accepts a pasted profile URL like https://www.openpowerlifting.org/u/name,
// or a name typed with spaces ("John Haack" -> "johnhaack")
export function parseOplUsername(input: string): string {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/openpowerlifting\.org\/u\/([^/?#]+)/i);
  return (fromUrl ? fromUrl[1] : trimmed).replace(/\s+/g, "").toLowerCase();
}

// Browsers can't read openpowerlifting.org directly (it doesn't allow
// cross-site requests), so the web app goes through our Worker relay
// (worker/index.js). Phones aren't affected and fetch it directly.
function lifterCsvUrl(username: string): string {
  const name = encodeURIComponent(username);
  return Platform.OS === "web"
    ? `https://powerliftingnotebook.com/api/opl/${name}`
    : `https://www.openpowerlifting.org/api/liftercsv/${name}`;
}

export function oplProfileUrl(username: string): string {
  return `https://www.openpowerlifting.org/u/${encodeURIComponent(username)}`;
}

// Throws an Error with a user-facing message when the record can't be loaded
export async function fetchOplRecord(username: string): Promise<OplRecord> {
  let res: Response;
  try {
    res = await fetch(lifterCsvUrl(username));
  } catch {
    throw new Error("Couldn't reach openpowerlifting.org. Try again later.");
  }
  if (res.status === 404) {
    throw new Error(
      `No lifter found for “${username}”. Check the username in Settings.`
    );
  }
  if (!res.ok) {
    throw new Error(
      `OpenPowerlifting responded with ${res.status}. Try again later.`
    );
  }

  const parsed = Papa.parse<RawRow>((await res.text()).trim(), {
    header: true,
  });
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

  return { stats, meets };
}
