import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import ExerciseChecklist from "@/components/ExerciseChecklist";
import HeaderButton from "@/components/HeaderButton";
import { Loadable } from "@/components/Loadable";
import { LiftPicker } from "@/components/Segmented";
import { Screen } from "@/components/ui";
import RequireLogin from "@/components/RequireLogin";
import { keys, useRehab, useSaveRehab } from "@/data/queries";
import type { Lift } from "@/lib/lifts";
import { useSession } from "@/lib/auth";
import { useRefresh } from "@/lib/navigation";
import { REHAB_PLACEHOLDER, type WarmupStep } from "@/lib/warmup";

export default function RehabScreen() {
  const session = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [lift, setLift] = useState<Lift>("squat");
  const query = useRehab(lift);
  const save = useSaveRehab();
  const { refreshing, onRefresh } = useRefresh(query.refetch);

  // Read the cache at tap time, not this render's copy, so quick taps don't undo each other
  const latest = () =>
    queryClient.getQueryData<WarmupStep[]>(keys.rehab(lift)) ?? [];

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Stack.Screen
        options={{
          headerRight: session
            ? () => (
                <HeaderButton
                  title="Edit"
                  accessibilityLabel="Edit rehab"
                  onPress={() =>
                    router.push({ pathname: "/rehab/edit", params: { lift } })
                  }
                />
              )
            : undefined,
        }}
      />
      <RequireLogin
        title="Log in to see your rehab"
        message="Your rehab exercises are saved to your account. Log in to tick them off and make them your own."
      >
        <LiftPicker value={lift} onChange={setLift} />
        <Loadable query={query}>
          {(steps) => (
            <ExerciseChecklist
              sections={[{ id: "rehab", placeholder: REHAB_PLACEHOLDER, steps }]}
              onToggle={(_section, index, done) =>
                save.mutate({
                  lift,
                  steps: latest().map((s, i) => (i === index ? { ...s, done } : s)),
                })
              }
              onReset={() =>
                save.mutate({
                  lift,
                  steps: latest().map((s) => ({ ...s, done: false })),
                })
              }
            />
          )}
        </Loadable>
      </RequireLogin>
    </Screen>
  );
}
