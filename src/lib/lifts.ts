export const LIFTS = ["squat", "bench", "deadlift"] as const;

export type Lift = (typeof LIFTS)[number];

export function isLift(value: string): value is Lift {
  return (LIFTS as readonly string[]).includes(value);
}

export function liftLabel(lift: Lift): string {
  return lift === "squat" ? "Squat" : lift === "bench" ? "Bench" : "Deadlift";
}
