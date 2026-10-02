import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import ExerciseEditor from "@/components/ExerciseEditor";
import { Loadable } from "@/components/Loadable";
import { LiftPicker } from "@/components/Segmented";
import { Screen, styles as ui, Txt } from "@/components/ui";
import type { StepsBySection } from "@/data/api";
import { keys, useSaveWarmups, useWarmups } from "@/data/queries";
import { isLift, type Lift } from "@/lib/lifts";
import { warmupSections } from "@/lib/warmup";

export default function WarmupEditorScreen() {
  const params = useLocalSearchParams<{ lift?: string }>();
  const queryClient = useQueryClient();
  const [lift, setLift] = useState<Lift>(
    params.lift && isLift(params.lift) ? params.lift : "squat"
  );
  const query = useWarmups(lift);
  const save = useSaveWarmups();

  const phaseSteps = (phase: number) =>
    queryClient.getQueryData<StepsBySection>(keys.warmups(lift))?.[phase] ?? [];

  return (
    <Screen>
      <Txt tone="secondary" style={ui.small}>
        Changes save straight away. The Warm-ups tab shows the clean, tickable
        version.
      </Txt>
      <LiftPicker value={lift} onChange={setLift} />
      <Loadable query={query}>
        {(data) => (
          <ExerciseEditor
            sections={warmupSections(data)}
            onAdd={(phase, step) =>
              save.mutate({ lift, phases: { [phase]: [...phaseSteps(phase), step] } })
            }
            onRemove={(phase, index) =>
              save.mutate({
                lift,
                phases: { [phase]: phaseSteps(phase).filter((_, i) => i !== index) },
              })
            }
          />
        )}
      </Loadable>
    </Screen>
  );
}
