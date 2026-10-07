import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Loadable } from "@/components/Loadable";
import RequireLogin from "@/components/RequireLogin";
import { LiftPicker } from "@/components/Segmented";
import TemplatePicker from "@/components/TemplatePicker";
import { Screen, styles as ui, Txt } from "@/components/ui";
import WarmupEditor from "@/components/WarmupEditor";
import { useWarmup, useWarmupActions } from "@/data/queries";
import { isLift, liftLabel, type Lift } from "@/lib/lifts";

export default function WarmupEditorScreen() {
  const params = useLocalSearchParams<{ lift?: string }>();
  const [lift, setLift] = useState<Lift>(
    params.lift && isLift(params.lift) ? params.lift : "squat"
  );
  const query = useWarmup(lift);
  const { update, applyTemplate } = useWarmupActions(lift);

  return (
    <Screen>
      <RequireLogin
        title="Log in to edit your warm-ups"
        message="Your warm-ups are saved to your account."
      >
        <Txt tone="secondary" style={ui.small}>
          Changes save straight away. Rename sections, add notes, reorder them
          with the arrows, and add the exercises you do in each one.
        </Txt>
        <LiftPicker value={lift} onChange={setLift} />
        <Loadable query={query}>
          {(sections) =>
            sections.length === 0 ? (
              <TemplatePicker liftName={liftLabel(lift)} onPick={applyTemplate} />
            ) : (
              // Keyed by lift so section fields reset when switching lifts
              <WarmupEditor
                key={lift}
                sections={sections}
                liftName={liftLabel(lift)}
                update={update}
              />
            )
          }
        </Loadable>
      </RequireLogin>
    </Screen>
  );
}
