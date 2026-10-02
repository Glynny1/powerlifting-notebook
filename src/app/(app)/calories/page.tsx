import { desc } from "drizzle-orm";
import DailyEntryForm from "@/components/DailyEntryForm";
import HistoryList from "@/components/HistoryList";
import LineChart from "@/components/LineChart";
import Notice from "@/components/Notice";
import { getDb } from "@/lib/db";
import { calorieEntries } from "@/lib/db/schema";
import { deleteCalories, saveCalories } from "./actions";

export const dynamic = "force-dynamic";

export default async function CaloriesPage() {
  const db = getDb();
  if (!db) {
    return (
      <Notice title="Database not connected">
        Calorie entries are stored in the database. Connect Supabase and set
        DATABASE_URL, then run npm run db:push.
      </Notice>
    );
  }

  const rows = await db
    .select()
    .from(calorieEntries)
    .orderBy(desc(calorieEntries.date))
    .limit(90);
  const points = [...rows]
    .reverse()
    .map((r) => ({ date: r.date, value: r.calories }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Calories</h1>
      <p className="-mt-2 text-sm text-secondary">
        One number a day — the total you ate.
      </p>
      <DailyEntryForm
        action={saveCalories}
        valueLabel="Calories"
        unit="kcal"
        step="1"
        min={0}
        max={20000}
        placeholder="3200"
      />
      {points.length >= 2 ? (
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Last {points.length} entries
          </h2>
          <LineChart
            points={points}
            colorVar="var(--chart-calories)"
            unit="kcal"
            decimals={0}
            title="Daily calories"
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
          display: `${r.calories.toLocaleString("en-GB")} kcal`,
        }))}
        deleteAction={deleteCalories}
      />
    </div>
  );
}
