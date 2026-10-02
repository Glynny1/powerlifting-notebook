import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ExerciseChecklist from "@/components/ExerciseChecklist";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { rehabSteps } from "@/lib/db/schema";
import { isLift } from "@/lib/lifts";
import { normalizeSteps } from "@/lib/warmup";
import { resetRehabTicks, toggleRehabStep } from "../../rehab.actions";

export const dynamic = "force-dynamic";

export default async function RehabLiftPage({
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
        Rehab work is stored in the database. Connect Neon and set
        DATABASE_URL, then run npm run db:push.
      </Notice>
    );
  }

  const rows = await db
    .select()
    .from(rehabSteps)
    .where(eq(rehabSteps.lift, lift));
  const steps = normalizeSteps(rows[0]?.steps);

  return (
    <ExerciseChecklist
      sections={[{ id: 1, placeholder: "e.g. Banded hip distraction", steps }]}
      editHref={`/settings/rehab/${lift}`}
      toggleAction={toggleRehabStep.bind(null, lift)}
      resetAction={resetRehabTicks.bind(null, lift)}
    />
  );
}
