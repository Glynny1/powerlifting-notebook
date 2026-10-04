import { useState } from "react";
import CueList from "@/components/CueList";
import { Loadable } from "@/components/Loadable";
import { Segmented } from "@/components/Segmented";
import { Screen } from "@/components/ui";
import RequireLogin from "@/components/RequireLogin";
import type { CueLift } from "@/data/api";
import { useAddCue, useCues, useDeleteCue, useUpdateCue } from "@/data/queries";
import { LIFTS, liftLabel } from "@/lib/lifts";
import { useRefresh } from "@/lib/navigation";

const groups: { value: CueLift; label: string }[] = [
  ...LIFTS.map((l) => ({ value: l, label: liftLabel(l) })),
  { value: "general", label: "General" },
];

const placeholders: Record<CueLift, string> = {
  squat: "e.g. Spread the floor",
  bench: "e.g. Bend the bar",
  deadlift: "e.g. Push the floor away",
  general: "e.g. Breathe, brace, then move",
};

export default function CuesScreen() {
  const [lift, setLift] = useState<CueLift>("squat");
  const query = useCues(lift);
  const add = useAddCue();
  const update = useUpdateCue();
  const remove = useDeleteCue();
  const { refreshing, onRefresh } = useRefresh(query.refetch);
  const label = groups.find((g) => g.value === lift)!.label;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <RequireLogin
        title="Log in to see your cues"
        message="Your technique cues for each lift are saved to your account."
      >
        <Segmented
          options={groups}
          value={lift}
          onChange={setLift}
          accessibilityLabel="Cue group"
        />
        <Loadable query={query}>
          {(cues) => (
            <CueList
              label={label}
              cues={cues}
              placeholder={placeholders[lift]}
              onAdd={(text) => add.mutate({ lift, text })}
              onUpdate={(id, text) => update.mutate({ lift, id, text })}
              onDelete={(id) => remove.mutate({ lift, id })}
            />
          )}
        </Loadable>
      </RequireLogin>
    </Screen>
  );
}
