import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { confirmDestructive } from "@/lib/confirm";
import { useColors } from "@/lib/theme";
import {
  formatReps,
  formatSeconds,
  newSection,
  type WarmupSection,
} from "@/lib/warmup";
import { exampleFor } from "@/lib/warmupTemplates";
import { AddStepForm } from "./ExerciseEditor";
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

type Update = (fn: (sections: WarmupSection[]) => WarmupSection[]) => void;

const replace = (
  sections: WarmupSection[],
  id: string,
  fn: (s: WarmupSection) => WarmupSection
) => sections.map((s) => (s.id === id ? fn(s) : s));

function SectionCard({
  section,
  number,
  isFirst,
  isLast,
  update,
}: {
  section: WarmupSection;
  number: number;
  isFirst: boolean;
  isLast: boolean;
  update: Update;
}) {
  const c = useColors();
  // Edited locally and saved when the field loses focus, not on every key
  const [title, setTitle] = useState(section.title);
  const [notes, setNotes] = useState(section.notes);

  const saveText = () => {
    const nextTitle = title.trim() || section.title;
    setTitle(nextTitle);
    if (nextTitle !== section.title || notes.trim() !== section.notes) {
      update((all) =>
        replace(all, section.id, (s) => ({ ...s, title: nextTitle, notes: notes.trim() }))
      );
    }
  };

  const move = (by: -1 | 1) =>
    update((all) => {
      const i = all.findIndex((s) => s.id === section.id);
      const j = i + by;
      if (i < 0 || j < 0 || j >= all.length) return all;
      const next = [...all];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const remove = () => {
    const count = section.steps.length;
    confirmDestructive(
      count
        ? `Delete “${section.title}” and its ${count} exercise${count === 1 ? "" : "s"}?`
        : `Delete “${section.title}”?`,
      "Delete",
      () => update((all) => all.filter((s) => s.id !== section.id))
    );
  };

  return (
    <Card>
      <View style={styles.headerRow}>
        <Txt tone="accent" style={styles.number}>
          {number}
        </Txt>
        <Field
          value={title}
          onChangeText={setTitle}
          onBlur={saveText}
          onSubmitEditing={saveText}
          returnKeyType="done"
          maxLength={60}
          accessibilityLabel={`Section ${number} name`}
          style={[styles.grow, styles.titleField]}
        />
        <IconButton
          accessibilityLabel={`Move ${section.title} up`}
          onPress={() => !isFirst && move(-1)}
        >
          <Ionicons name="chevron-up" size={20} color={isFirst ? c.hairline : c.muted} />
        </IconButton>
        <IconButton
          accessibilityLabel={`Move ${section.title} down`}
          onPress={() => !isLast && move(1)}
        >
          <Ionicons name="chevron-down" size={20} color={isLast ? c.hairline : c.muted} />
        </IconButton>
        <IconButton accessibilityLabel={`Delete ${section.title}`} onPress={remove}>
          <Ionicons name="trash-outline" size={18} color={c.muted} />
        </IconButton>
      </View>
      <Field
        value={notes}
        onChangeText={setNotes}
        onBlur={saveText}
        placeholder="Notes for this section (optional)"
        multiline
        maxLength={300}
        accessibilityLabel={`Notes for ${section.title}`}
        style={[ui.small, styles.notes]}
      />

      {section.steps.length > 0 && <Divider style={styles.divider} />}
      {section.steps.map((step, i) => (
        <View key={`${i}-${step.text}`} style={styles.stepRow}>
          <View style={styles.grow}>
            <Txt>{step.text}</Txt>
            {step.note && (
              <Txt tone="muted" style={ui.tiny}>
                {step.note}
              </Txt>
            )}
          </View>
          {step.reps && <Chip>{formatReps(step.reps)}</Chip>}
          {step.seconds !== undefined && <Chip>{formatSeconds(step.seconds)}</Chip>}
          <IconButton
            accessibilityLabel={`Remove ${step.text}`}
            onPress={() =>
              confirmDestructive(`Remove “${step.text}”?`, "Remove", () =>
                update((all) =>
                  replace(all, section.id, (s) => ({
                    ...s,
                    steps: s.steps.filter((_, k) => k !== i),
                  }))
                )
              )
            }
          >
            <Ionicons name="close" size={18} color={c.muted} />
          </IconButton>
        </View>
      ))}

      <Divider style={styles.divider} />
      <AddStepForm
        placeholder={exampleFor(section.title)}
        onAdd={(step) =>
          update((all) =>
            replace(all, section.id, (s) => ({ ...s, steps: [...s.steps, step] }))
          )
        }
      />
    </Card>
  );
}

function AddSection({ update }: { update: Update }) {
  const [title, setTitle] = useState("");
  const add = () => {
    if (!title.trim()) return;
    update((all) => [...all, newSection(title.trim().slice(0, 60))]);
    setTitle("");
  };
  return (
    <Card style={styles.addSection}>
      <Txt style={styles.bold}>Add a section</Txt>
      <View style={styles.row}>
        <Field
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Mobility"
          returnKeyType="done"
          onSubmitEditing={add}
          maxLength={60}
          accessibilityLabel="New section name"
          style={styles.grow}
        />
        <Button title="Add" variant="ghost" onPress={add} disabled={!title.trim()} />
      </View>
    </Card>
  );
}

// Full control over one lift's warm-up: sections and their exercises
export default function WarmupEditor({
  sections,
  liftName,
  update,
}: {
  sections: WarmupSection[];
  liftName: string;
  update: Update;
}) {
  return (
    <View style={styles.list}>
      {sections.map((section, i) => (
        <SectionCard
          key={section.id}
          section={section}
          number={i + 1}
          isFirst={i === 0}
          isLast={i === sections.length - 1}
          update={update}
        />
      ))}
      <AddSection update={update} />
      <Button
        title="Start again from a template"
        variant="ghost"
        onPress={() =>
          confirmDestructive(
            `Clear your ${liftName.toLowerCase()} warm-up and pick a template again?`,
            "Clear",
            () => update(() => [])
          )
        }
        style={styles.startAgain}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  number: { fontWeight: "700", fontVariant: ["tabular-nums"], width: 18 },
  titleField: { fontWeight: "600", minWidth: 0 },
  notes: { marginTop: 8, minHeight: 44 },
  divider: { marginVertical: 12 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 40 },
  grow: { flex: 1 },
  addSection: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  bold: { fontWeight: "600" },
  startAgain: { alignSelf: "flex-start" },
});
