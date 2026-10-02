import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ExerciseEditor from "@/components/ExerciseEditor";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { rehabSteps } from "@/lib/db/schema";
import { isLift } from "@/lib/lifts";
import { normalizeSteps } from "@/lib/warmup";
import { addRehabStep, removeRehabStep } from "../../../rehab.actions";

export const dynamic = "force-dynamic";

export default async function RehabEditorPage({
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
    <ExerciseEditor
      sections={[{ id: 1, placeholder: "e.g. Banded hip distraction", steps }]}
      addAction={addRehabStep.bind(null, lift)}
      removeAction={removeRehabStep.bind(null, lift)}
    />
  );
}
