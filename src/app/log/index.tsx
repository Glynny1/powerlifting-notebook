import { useState } from "react";
import DailyLog, { type DailyLogConfig } from "@/components/DailyLog";
import { Loadable } from "@/components/Loadable";
import { Segmented } from "@/components/Segmented";
import { Screen, styles as ui, Txt } from "@/components/ui";
import {
  useCalories,
  useDeleteCalories,
  useDeleteWeight,
  useSaveCalories,
  useSaveWeight,
  useWeights,
} from "@/data/queries";
import { formatKg } from "@/lib/format";
import { useRefresh } from "@/lib/navigation";
import { useColors } from "@/lib/theme";

type Tracker = "weight" | "calories";

const trackers: { value: Tracker; label: string }[] = [
  { value: "weight", label: "Bodyweight" },
  { value: "calories", label: "Calories" },
];

function WeightLog() {
  const c = useColors();
  const query = useWeights();
  const save = useSaveWeight();
  const remove = useDeleteWeight();
  const config: DailyLogConfig = {
    title: "Bodyweight",
    valueLabel: "Weight",
    unit: "kg",
    decimals: 1,
    min: 25,
    max: 350,
    placeholder: "82.4",
    color: c.chartWeight,
    display: (v) => `${formatKg(v)} kg`,
  };
  return (
    <Loadable query={query}>
      {(entries) => (
        <DailyLog
          config={config}
          entries={entries}
          onSave={(e) => save.mutate(e)}
          onDelete={(date) => remove.mutate({ date })}
        />
      )}
    </Loadable>
  );
}

function CaloriesLog() {
  const c = useColors();
  const query = useCalories();
  const save = useSaveCalories();
  const remove = useDeleteCalories();
  const config: DailyLogConfig = {
    title: "Daily calories",
    valueLabel: "Calories",
    unit: "kcal",
    decimals: 0,
    min: 0,
    max: 20000,
    placeholder: "3200",
    color: c.chartCalories,
    display: (v) => `${v.toLocaleString("en-GB")} kcal`,
  };
  return (
    <>
      <Txt tone="secondary" style={ui.small}>
        One number a day: the total you ate.
      </Txt>
      <Loadable query={query}>
        {(entries) => (
          <DailyLog
            config={config}
            entries={entries}
            onSave={(e) => save.mutate(e)}
            onDelete={(date) => remove.mutate({ date })}
          />
        )}
      </Loadable>
    </>
  );
}

export default function LogScreen() {
  const [tracker, setTracker] = useState<Tracker>("weight");
  const weights = useWeights();
  const calories = useCalories();
  const { refreshing, onRefresh } = useRefresh(weights.refetch, calories.refetch);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Segmented
        options={trackers}
        value={tracker}
        onChange={setTracker}
        accessibilityLabel="Tracker"
      />
      {tracker === "weight" ? <WeightLog /> : <CaloriesLog />}
    </Screen>
  );
}
