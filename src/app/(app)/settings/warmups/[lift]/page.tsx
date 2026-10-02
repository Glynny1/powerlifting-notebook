import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ExerciseEditor from "@/components/ExerciseEditor";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { warmupPhases } from "@/lib/db/schema";
import { isLift } from "@/lib/lifts";
import { normalizeSteps, warmupSections, type WarmupStep } from "@/lib/warmup";
import { addWarmupStep, removeWarmupStep } from "../../../warmups.actions";

export const dynamic = "force-dynamic";

export default async function WarmupEditorPage({
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
        Warm-ups are stored in the database. Connect Neon and set DATABASE_URL,
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
    <ExerciseEditor
      sections={warmupSections(stepsByPhase)}
      addAction={addWarmupStep.bind(null, lift)}
      removeAction={removeWarmupStep.bind(null, lift)}
    />
  );
}
