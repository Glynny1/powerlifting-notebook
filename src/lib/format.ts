export function formatKg(value: number | null): string {
  if (value === null) return "-";
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPlace(place: string): string {
  const n = Number(place);
  if (!Number.isFinite(n) || n <= 0) return place;
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : ["th", "st", "nd", "rd"][n % 10 < 4 ? n % 10 : 0];
  return `${n}${suffix}`;
}

export function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
