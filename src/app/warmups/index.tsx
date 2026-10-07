import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import ExerciseChecklist from "@/components/ExerciseChecklist";
import HeaderButton from "@/components/HeaderButton";
import { Loadable } from "@/components/Loadable";
import RequireLogin from "@/components/RequireLogin";
import { LiftPicker } from "@/components/Segmented";
import TemplatePicker from "@/components/TemplatePicker";
import { Screen } from "@/components/ui";
import { useWarmup, useWarmupActions } from "@/data/queries";
import { useSession } from "@/lib/auth";
import { liftLabel, type Lift } from "@/lib/lifts";
import { useRefresh } from "@/lib/navigation";
import { exampleFor } from "@/lib/warmupTemplates";

export default function WarmupsScreen() {
  const session = useSession();
  const router = useRouter();
  const [lift, setLift] = useState<Lift>("squat");
  const query = useWarmup(lift);
  const { update, applyTemplate } = useWarmupActions(lift);
  const { refreshing, onRefresh } = useRefresh(query.refetch);
  const hasWarmup = (query.data?.length ?? 0) > 0;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Stack.Screen
        options={{
          headerRight:
            session && hasWarmup
              ? () => (
                  <HeaderButton
                    title="Edit"
                    accessibilityLabel="Edit warm-ups"
                    onPress={() =>
                      router.push({ pathname: "/warmups/edit", params: { lift } })
                    }
                  />
                )
              : undefined,
        }}
      />
      <RequireLogin
        title="Log in to see your warm-ups"
        message="Your warm-ups are saved to your account. Log in to tick them off and make them your own."
      >
        <LiftPicker value={lift} onChange={setLift} />
        <Loadable query={query}>
          {(sections) =>
            sections.length === 0 ? (
              <TemplatePicker liftName={liftLabel(lift)} onPick={applyTemplate} />
            ) : (
              <ExerciseChecklist
                sections={sections.map((s, i) => ({
                  id: s.id,
                  number: i + 1,
                  title: s.title,
                  blurb: s.notes || undefined,
                  placeholder: exampleFor(s.title),
                  steps: s.steps,
                }))}
                onToggle={(id, index, done) =>
                  update((all) =>
                    all.map((s) =>
                      s.id === id
                        ? {
                            ...s,
                            steps: s.steps.map((step, k) =>
                              k === index ? { ...step, done } : step
                            ),
                          }
                        : s
                    )
                  )
                }
                onReset={() =>
                  update((all) =>
                    all.map((s) => ({
                      ...s,
                      steps: s.steps.map((step) => ({ ...step, done: false })),
                    }))
                  )
                }
              />
            )
          }
        </Loadable>
      </RequireLogin>
    </Screen>
  );
}
