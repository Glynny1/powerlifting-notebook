import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CueGroup from "@/components/CueGroup";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { cues } from "@/lib/db/schema";
import { isLift, liftLabel, type Lift } from "@/lib/lifts";

export const dynamic = "force-dynamic";

const placeholders: Record<Lift, string> = {
  squat: "e.g. Spread the floor",
  bench: "e.g. Bend the bar",
  deadlift: "e.g. Push the floor away",
};

export default async function CueLiftPage({
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
        Cues are stored in the database. Connect Supabase and set DATABASE_URL,
        then run npm run db:push.
      </Notice>
    );
  }

  const list = await db
    .select()
    .from(cues)
    .where(eq(cues.lift, lift))
    .orderBy(asc(cues.position), asc(cues.id));

  return (
    <CueGroup
      lift={lift}
      label={liftLabel(lift)}
      cues={list}
      placeholder={placeholders[lift]}
    />
  );
}
