import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import ExerciseEditor from "@/components/ExerciseEditor";
import { Loadable } from "@/components/Loadable";
import { LiftPicker } from "@/components/Segmented";
import { Screen, styles as ui, Txt } from "@/components/ui";
import RequireLogin from "@/components/RequireLogin";
import { keys, useRehab, useSaveRehab } from "@/data/queries";
import { isLift, type Lift } from "@/lib/lifts";
import { REHAB_PLACEHOLDER, type WarmupStep } from "@/lib/warmup";

export default function RehabEditorScreen() {
  const params = useLocalSearchParams<{ lift?: string }>();
  const queryClient = useQueryClient();
  const [lift, setLift] = useState<Lift>(
    params.lift && isLift(params.lift) ? params.lift : "squat"
  );
  const query = useRehab(lift);
  const save = useSaveRehab();

  const latest = () =>
    queryClient.getQueryData<WarmupStep[]>(keys.rehab(lift)) ?? [];

  return (
    <Screen>
      <RequireLogin
        title="Log in to edit your rehab"
        message="Your rehab exercises are saved to your account."
      >
        <Txt tone="secondary" style={ui.small}>
          Changes save straight away. The Rehab tab shows the clean, tickable
          version.
        </Txt>
        <LiftPicker value={lift} onChange={setLift} />
        <Loadable query={query}>
          {(steps) => (
            <ExerciseEditor
              sections={[{ id: "rehab", placeholder: REHAB_PLACEHOLDER, steps }]}
              onAdd={(_section, step) =>
                save.mutate({ lift, steps: [...latest(), step] })
              }
              onRemove={(_section, index) =>
                save.mutate({ lift, steps: latest().filter((_, i) => i !== index) })
              }
            />
          )}
        </Loadable>
      </RequireLogin>
    </Screen>
  );
}
