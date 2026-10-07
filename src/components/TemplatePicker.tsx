import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { WARMUP_TEMPLATES } from "@/lib/warmupTemplates";
import { Checkbox } from "./ExerciseChecklist";
import { Button, Card, styles as ui, Txt } from "./ui";

// Shown when a lift has no warm-up yet: pick a template to start from
export default function TemplatePicker({
  liftName,
  onPick,
}: {
  liftName: string;
  onPick: (templateId: string, allLifts: boolean) => void;
}) {
  const [allLifts, setAllLifts] = useState(true);

  return (
    <View style={styles.list}>
      <View style={styles.intro}>
        <Txt style={styles.heading} accessibilityRole="header">
          Set up your {liftName.toLowerCase()} warm-up
        </Txt>
        <Txt tone="secondary" style={ui.small}>
          Pick a starting point. You can rename, add, remove and reorder
          anything afterwards.
        </Txt>
      </View>

      {WARMUP_TEMPLATES.map((t) => (
        <Card key={t.id} style={styles.card}>
          <Txt style={styles.bold}>{t.name}</Txt>
          <Txt tone="secondary" style={ui.small}>
            {t.description}
          </Txt>
          {t.sections.length > 1 && (
            <Txt tone="muted" style={ui.tiny}>
              {t.sections.map((s) => s.title).join(" · ")}
            </Txt>
          )}
          <Button
            title={`Use ${t.name.toLowerCase()}`}
            onPress={() => onPick(t.id, allLifts)}
            style={styles.button}
          />
        </Card>
      ))}

      <Pressable
        onPress={() => setAllLifts((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allLifts }}
        style={styles.allLifts}
      >
        <Checkbox checked={allLifts} />
        <Txt tone="secondary" style={[ui.small, styles.grow]}>
          Also set up any other lifts that don&apos;t have a warm-up yet
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  intro: { gap: 4 },
  heading: { fontSize: 18, fontWeight: "600" },
  card: { gap: 6 },
  bold: { fontWeight: "600" },
  button: { alignSelf: "flex-start", marginTop: 6 },
  allLifts: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  grow: { flex: 1 },
});
