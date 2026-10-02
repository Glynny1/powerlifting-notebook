import { desc } from "drizzle-orm";
import DailyEntryForm from "@/components/DailyEntryForm";
import HistoryList from "@/components/HistoryList";
import LineChart from "@/components/LineChart";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { weightEntries } from "@/lib/db/schema";
import { deleteWeight, saveWeight } from "./actions";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const db = getDb();
  if (!db) {
    return (
      <Notice title="Database not connected">
        Weight entries are stored in the database. Connect Neon and set
        DATABASE_URL, then run npm run db:push.
      </Notice>
    );
  }

  const rows = await db
    .select()
    .from(weightEntries)
    .orderBy(desc(weightEntries.date))
    .limit(90);
  const points = [...rows]
    .reverse()
    .map((r) => ({ date: r.date, value: Number(r.weightKg) }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Bodyweight</h1>
      <DailyEntryForm
        action={saveWeight}
        valueLabel="Weight"
        unit="kg"
        step="0.1"
        min={25}
        max={350}
        placeholder="82.4"
      />
      {points.length >= 2 ? (
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Last {points.length} entries
          </h2>
          <LineChart
            points={points}
            colorVar="var(--chart-weight)"
            unit="kg"
            decimals={1}
            title="Bodyweight"
          />
        </div>
      ) : (
        rows.length < 2 && (
          <p className="text-sm text-secondary">
            Log a couple of days and the trend chart will appear here.
          </p>
        )
      )}
      <HistoryList
        rows={rows.map((r) => ({
          date: r.date,
          display: `${Number(r.weightKg) % 1 === 0 ? Number(r.weightKg).toFixed(0) : Number(r.weightKg).toFixed(1)} kg`,
        }))}
        deleteAction={deleteWeight}
      />
    </div>
  );
}
