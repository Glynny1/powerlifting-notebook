import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import ExerciseChecklist from "@/components/ExerciseChecklist";
import HeaderButton from "@/components/HeaderButton";
import { Loadable } from "@/components/Loadable";
import { LiftPicker } from "@/components/Segmented";
import { Screen, styles as ui, Txt } from "@/components/ui";
import type { StepsBySection } from "@/data/api";
import { keys, useSaveWarmups, useWarmups } from "@/data/queries";
import type { Lift } from "@/lib/lifts";
import { useRefresh } from "@/lib/navigation";
import { warmupSections } from "@/lib/warmup";

export default function WarmupsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [lift, setLift] = useState<Lift>("squat");
  const query = useWarmups(lift);
  const save = useSaveWarmups();
  const { refreshing, onRefresh } = useRefresh(query.refetch);

  // Read the cache at tap time, not this render's copy, so quick taps don't undo each other
  const latest = () =>
    queryClient.getQueryData<StepsBySection>(keys.warmups(lift)) ?? {};

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton
              title="Edit"
              accessibilityLabel="Edit warm-ups"
              onPress={() =>
                router.push({ pathname: "/warmups/edit", params: { lift } })
              }
            />
          ),
        }}
      />
      <Txt tone="secondary" style={ui.small}>
        Dr John Rusin&apos;s six-phase warm-up — run it top to bottom, 6–10
        minutes.
      </Txt>
      <LiftPicker value={lift} onChange={setLift} />
      <Loadable query={query}>
        {(data) => (
          <ExerciseChecklist
            sections={warmupSections(data)}
            onToggle={(phase, index, done) => {
              const steps = (latest()[phase] ?? []).map((s, i) =>
                i === index ? { ...s, done } : s
              );
              save.mutate({ lift, phases: { [phase]: steps } });
            }}
            onReset={() => {
              const phases = Object.fromEntries(
                Object.entries(latest()).map(([phase, steps]) => [
                  phase,
                  steps.map((s) => ({ ...s, done: false })),
                ])
              );
              save.mutate({ lift, phases });
            }}
          />
        )}
      </Loadable>
    </Screen>
  );
}
