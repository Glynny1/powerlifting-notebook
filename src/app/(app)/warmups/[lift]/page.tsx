import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ExerciseChecklist from "@/components/ExerciseChecklist";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { warmupPhases } from "@/lib/db/schema";
import { isLift } from "@/lib/lifts";
import { normalizeSteps, warmupSections, type WarmupStep } from "@/lib/warmup";
import {
  resetWarmupTicks,
  toggleWarmupStep,
} from "../../warmups.actions";

export const dynamic = "force-dynamic";

export default async function WarmupLiftPage({
  params,
}: {
  params: Promise<{ lift: string }>;
}) {
  const { lift } = await params;
  if (!isLift(lift)) notFound();

  const db = getDb();
  if (!db) {
    return (
      <Notice title="Database not connected">
        Warm-ups are stored in the database. Connect Supabase and set DATABASE_URL,
        then run npm run db:push.
      </Notice>
    );
  }

  const rows = await db
    .select()
    .from(warmupPhases)
    .where(eq(warmupPhases.lift, lift));
  const stepsByPhase = Object.fromEntries(
    rows.map((r) => [r.phase, normalizeSteps(r.steps)])
  ) as Record<number, WarmupStep[]>;

  return (
    <ExerciseChecklist
      sections={warmupSections(stepsByPhase)}
      editHref={`/settings/warmups/${lift}`}
      toggleAction={toggleWarmupStep.bind(null, lift)}
      resetAction={resetWarmupTicks.bind(null, lift)}
    />
  );
}
