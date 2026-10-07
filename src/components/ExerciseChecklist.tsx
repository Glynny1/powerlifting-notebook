import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useEffectEvent, useId, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useColors } from "@/lib/theme";
import { formatReps, formatSeconds, type WarmupStep } from "@/lib/warmup";
import { Button, Card, Chip, Divider, styles as ui, Txt } from "./ui";

export type ExerciseSection = {
  id: string;
  number?: number; // phase badge
  title?: string;
  blurb?: string;
  placeholder: string;
  steps: WarmupStep[];
};

export function Checkbox({ checked }: { checked: boolean }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.box,
        checked
          ? { backgroundColor: c.accent, borderColor: c.accent }
          : { borderColor: c.muted },
      ]}
    >
      {checked && <Ionicons name="checkmark" size={16} color="#ffffff" />}
    </View>
  );
}

function StepRow({
  step,
  onToggle,
}: {
  step: WarmupStep;
  onToggle: (done: boolean) => void;
}) {
  const keepAwakeTag = useId();
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const running = endsAt !== null;
  const remaining = running ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;

  const finish = useEffectEvent(() => {
    setEndsAt(null);
    onToggle(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  // Counts down from a fixed end time, so it stays right after the app is backgrounded
  useEffect(() => {
    if (endsAt === null) return;
    void activateKeepAwakeAsync(keepAwakeTag);
    const timer = setInterval(() => {
      const t = Date.now();
      if (t >= endsAt) finish();
      else setNow(t);
    }, 250);
    return () => {
      clearInterval(timer);
      void deactivateKeepAwake(keepAwakeTag);
    };
  }, [endsAt, keepAwakeTag]);

  // Ticking a running exercise by hand stops its timer
  const toggle = () => {
    setEndsAt(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(!step.done);
  };

  const toggleTimer = () => {
    if (running) {
      setEndsAt(null);
      return;
    }
    const t = Date.now();
    setNow(t);
    setEndsAt(t + step.seconds! * 1000);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: step.done }}
        accessibilityLabel={step.note ? `${step.text}. ${step.note}` : step.text}
        style={({ pressed }) => [styles.rowMain, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Checkbox checked={step.done} />
        <View style={styles.rowText}>
          <Txt
            tone={step.done ? "muted" : "default"}
            style={step.done ? styles.done : undefined}
          >
            {step.text}
          </Txt>
          {step.note && (
            <Txt tone="muted" style={ui.tiny}>
              {step.note}
            </Txt>
          )}
        </View>
      </Pressable>
      {step.reps && <Chip>{formatReps(step.reps)}</Chip>}
      {step.seconds !== undefined &&
        (step.done ? (
          <Txt tone="muted" style={[ui.tiny, ui.tabular]}>
            {formatSeconds(step.seconds)}
          </Txt>
        ) : (
          <Pressable
            onPress={toggleTimer}
            accessibilityRole="button"
            accessibilityLabel={
              running
                ? `Cancel timer, ${formatSeconds(remaining)} left`
                : `Start ${formatSeconds(step.seconds)} timer`
            }
            hitSlop={6}
          >
            <Chip active={running}>
              {running ? formatSeconds(remaining) : formatSeconds(step.seconds)}
            </Chip>
          </Pressable>
        ))}
    </View>
  );
}

export default function ExerciseChecklist({
  sections,
  onToggle,
  onReset,
}: {
  sections: ExerciseSection[];
  onToggle: (sectionId: string, index: number, done: boolean) => void;
  onReset: () => void;
}) {
  const anyTicked = sections.some((s) => s.steps.some((step) => step.done));

  return (
    <View style={styles.list}>
      {sections.map((section) => {
        const doneCount = section.steps.filter((s) => s.done).length;
        return (
          <Card key={section.id}>
            {(section.title || section.steps.length > 0) && (
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  {section.number !== undefined && (
                    <Txt tone="accent" style={styles.phase}>
                      {section.number}
                    </Txt>
                  )}
                  {section.title && (
                    <View style={styles.titleText}>
                      <Txt
                        style={styles.title}
                        accessibilityRole="header"
                        accessibilityLabel={
                          section.number !== undefined
                            ? `Phase ${section.number}: ${section.title}`
                            : section.title
                        }
                      >
                        {section.title}
                      </Txt>
                      {section.blurb && (
                        <Txt tone="secondary" style={ui.small}>
                          {section.blurb}
                        </Txt>
                      )}
                    </View>
                  )}
                </View>
                {section.steps.length > 0 && (
                  <Txt
                    tone="muted"
                    style={[ui.tiny, ui.tabular]}
                    accessibilityLabel={`${doneCount} of ${section.steps.length} done`}
                  >
                    {doneCount}/{section.steps.length}
                  </Txt>
                )}
              </View>
            )}
            {section.title && <Divider style={styles.divider} />}
            {section.steps.length > 0 ? (
              section.steps.map((step, i) => (
                <StepRow
                  key={`${i}-${step.text}`}
                  step={step}
                  onToggle={(done) => onToggle(section.id, i, done)}
                />
              ))
            ) : (
              <Txt tone="muted" style={ui.small}>
                Nothing here yet. Add exercises with Edit.
              </Txt>
            )}
          </Card>
        );
      })}
      <Button
        title="Reset all ticks"
        variant="ghost"
        onPress={onReset}
        disabled={!anyTicked}
        style={styles.reset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  titleRow: { flexDirection: "row", gap: 10, flex: 1 },
  titleText: { flex: 1, gap: 2 },
  phase: { fontWeight: "700", fontVariant: ["tabular-nums"] },
  title: { fontWeight: "600" },
  divider: { marginTop: 12, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  rowText: { flex: 1, gap: 2 },
  done: { textDecorationLine: "line-through" },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  reset: { alignSelf: "flex-start" },
});
