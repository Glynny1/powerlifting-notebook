import type { Lift } from "./lifts";

export const MEET_DATE_KEY = "meet_date";
export const MAX_KEYS: Record<Lift, string> = {
  squat: "max_squat",
  bench: "max_bench",
  deadlift: "max_deadlift",
};

export type Countdown = { months: number; weeks: number; days: number };

function atMidnight(iso: string): Date | null {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addMonths(date: Date, n: number): Date {
  const r = new Date(date);
  r.setMonth(r.getMonth() + n);
  return r;
}

// Whole calendar months, then weeks, then days. Null if the date is invalid
// or in the past; all zeros means meet day.
export function meetCountdown(todayIso: string, meetIso: string): Countdown | null {
  const today = atMidnight(todayIso);
  const meet = atMidnight(meetIso);
  if (!today || !meet || meet < today) return null;

  let months = 0;
  while (addMonths(today, months + 1) <= meet) months++;
  const rest = Math.round(
    (meet.getTime() - addMonths(today, months).getTime()) / 86_400_000
  );
  return { months, weeks: Math.floor(rest / 7), days: rest % 7 };
}

export function formatCountdown(c: Countdown): string {
  const unit = (n: number, word: string) =>
    n > 0 ? `${n} ${word}${n === 1 ? "" : "s"}` : null;
  const parts = [
    unit(c.months, "month"),
    unit(c.weeks, "week"),
    unit(c.days, "day"),
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Meet day";
}

export type AttemptPlan = { first: number; second: number; third: number };

// Opener ≈91% (something you can triple), second ≈97%, third ≈101% of the
// gym max. Openers and seconds round down to 2.5kg, thirds to the nearest.
export function planAttempts(maxKg: number): AttemptPlan {
  const down = (x: number) => Math.floor(x / 2.5) * 2.5;
  const nearest = (x: number) => Math.round(x / 2.5) * 2.5;
  return {
    first: down(maxKg * 0.91),
    second: down(maxKg * 0.97),
    third: nearest(maxKg * 1.01),
  };
}

export function parseMaxKg(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 20 && n <= 600 ? n : null;
}
