import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { confirmDestructive } from "@/lib/confirm";
import { useColors } from "@/lib/theme";
import { formatReps, formatSeconds, type WarmupStep } from "@/lib/warmup";
import type { ExerciseSection } from "./ExerciseChecklist";
import {
  Button,
  Card,
  Chip,
  Divider,
  Field,
  IconButton,
  styles as ui,
  Txt,
} from "./ui";

export function AddStepForm({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (step: WarmupStep) => void;
}) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [seconds, setSeconds] = useState("");
  const [reps, setReps] = useState("");

  const submit = () => {
    const name = text.trim();
    if (!name) return;
    const step: WarmupStep = { text: name, done: false };
    const secs = Number(seconds);
    if (seconds && Number.isInteger(secs) && secs >= 1 && secs <= 3600) {
      step.seconds = secs;
    }
    if (reps.trim()) step.reps = reps.trim().slice(0, 30);
    if (note.trim()) step.note = note.trim().slice(0, 200);
    onAdd(step);
    setText("");
    setNote("");
    setSeconds("");
    setReps("");
  };

  return (
    <View style={styles.form}>
      <Field
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        accessibilityLabel="Exercise name"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Field
        value={note}
        onChangeText={setNote}
        placeholder="Note: cues, setup, per side…"
        accessibilityLabel="Note (optional)"
        style={ui.small}
      />
      <View style={styles.formRow}>
        <Field
          value={seconds}
          onChangeText={setSeconds}
          placeholder="secs"
          keyboardType="number-pad"
          accessibilityLabel="Seconds (optional, adds a timer)"
          style={styles.seconds}
        />
        <Field
          value={reps}
          onChangeText={setReps}
          placeholder="reps: 15, 8/side, 2×6"
          accessibilityLabel="Reps (optional)"
          style={[styles.reps, ui.small]}
        />
        <Button title="Add" variant="ghost" onPress={submit} disabled={!text.trim()} />
      </View>
    </View>
  );
}

export default function ExerciseEditor({
  sections,
  onAdd,
  onRemove,
}: {
  sections: ExerciseSection[];
  onAdd: (sectionId: string, step: WarmupStep) => void;
  onRemove: (sectionId: string, index: number) => void;
}) {
  const c = useColors();
  return (
    <View style={styles.list}>
      {sections.map((section) => (
        <Card key={section.id}>
          {section.title && (
            <View style={styles.titleRow}>
              {section.number !== undefined && (
                <Txt tone="accent" style={styles.phase}>
                  {section.number}
                </Txt>
              )}
              <View style={styles.titleText}>
                <Txt style={styles.title} accessibilityRole="header">
                  {section.title}
                </Txt>
                {section.blurb && (
                  <Txt tone="secondary" style={ui.small}>
                    {section.blurb}
                  </Txt>
                )}
              </View>
            </View>
          )}
          {section.title && <Divider style={styles.divider} />}
          {section.steps.map((step, i) => (
            <View key={`${i}-${step.text}`} style={styles.row}>
              <View style={styles.rowText}>
                <Txt>{step.text}</Txt>
                {step.note && (
                  <Txt tone="muted" style={ui.tiny}>
                    {step.note}
                  </Txt>
                )}
              </View>
              {step.reps && <Chip>{formatReps(step.reps)}</Chip>}
              {step.seconds !== undefined && (
                <Chip>{formatSeconds(step.seconds)}</Chip>
              )}
              <IconButton
                accessibilityLabel={`Remove ${step.text}`}
                onPress={() =>
                  confirmDestructive(`Remove “${step.text}”?`, "Remove", () =>
                    onRemove(section.id, i)
                  )
                }
              >
                <Ionicons name="close" size={18} color={c.muted} />
              </IconButton>
            </View>
          ))}
          {(section.title || section.steps.length > 0) && (
            <Divider style={styles.divider} />
          )}
          <AddStepForm
            placeholder={section.placeholder}
            onAdd={(step) => onAdd(section.id, step)}
          />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  titleRow: { flexDirection: "row", gap: 10 },
  titleText: { flex: 1, gap: 2 },
  phase: { fontWeight: "700", fontVariant: ["tabular-nums"] },
  title: { fontWeight: "600" },
  divider: { marginVertical: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 40 },
  rowText: { flex: 1, gap: 2 },
  form: { gap: 8 },
  formRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  seconds: { width: 72, fontVariant: ["tabular-nums"] },
  reps: { flex: 1, minWidth: 0 },
});
