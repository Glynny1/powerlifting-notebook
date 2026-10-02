import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import type { DailyEntry } from "@/data/api";
import { confirmDestructive } from "@/lib/confirm";
import { formatDate, todayIso } from "@/lib/format";
import { useColors } from "@/lib/theme";
import DateField from "./DateField";
import LineChart from "./LineChart";
import { Button, Card, Divider, Field, IconButton, Label, styles as ui, Txt } from "./ui";

export type DailyLogConfig = {
  title: string;
  valueLabel: string;
  unit: string;
  decimals: number;
  min: number;
  max: number;
  placeholder: string;
  color: string;
  display: (value: number) => string;
};

export default function DailyLog({
  config,
  entries,
  onSave,
  onDelete,
}: {
  config: DailyLogConfig;
  entries: DailyEntry[];
  onSave: (entry: DailyEntry) => void;
  onDelete: (date: string) => void;
}) {
  const c = useColors();
  const [date, setDate] = useState(todayIso);
  const [raw, setRaw] = useState("");

  const value = Number(raw.replace(",", "."));
  const valid =
    raw.trim() !== "" &&
    Number.isFinite(value) &&
    value >= config.min &&
    value <= config.max &&
    (config.decimals > 0 || Number.isInteger(value));

  const save = () => {
    if (!valid) return;
    onSave({ date, value });
    setRaw("");
    Keyboard.dismiss();
  };

  // Entries arrive newest first; the chart reads oldest first
  const points = [...entries].reverse();

  return (
    <View style={styles.stack}>
      <Card style={styles.form}>
        <View style={styles.formField}>
          <Txt tone="secondary" style={ui.small}>
            Date
          </Txt>
          <DateField value={date} onChange={setDate} accessibilityLabel="Date" />
        </View>
        <View style={[styles.formField, styles.grow]}>
          <Txt tone="secondary" style={ui.small}>
            {config.valueLabel} ({config.unit})
          </Txt>
          <Field
            value={raw}
            onChangeText={setRaw}
            placeholder={config.placeholder}
            keyboardType={config.decimals > 0 ? "decimal-pad" : "number-pad"}
            accessibilityLabel={`${config.valueLabel} in ${config.unit}`}
            returnKeyType="done"
            onSubmitEditing={save}
            style={ui.tabular}
          />
        </View>
        <Button title="Save" onPress={save} disabled={!valid} />
      </Card>

      {points.length >= 2 ? (
        <Card>
          <Label>Last {points.length} entries</Label>
          <LineChart
            points={points}
            color={config.color}
            unit={config.unit}
            decimals={config.decimals}
            title={config.title}
          />
        </Card>
      ) : (
        <Txt tone="secondary" style={ui.small}>
          Log a couple of days and the trend chart will appear here.
        </Txt>
      )}

      {entries.length > 0 && (
        <Card style={styles.history}>
          {entries.map((e, i) => (
            <View key={e.date}>
              {i > 0 && <Divider />}
              <View style={styles.historyRow}>
                <Txt tone="secondary" style={ui.small}>
                  {formatDate(e.date)}
                </Txt>
                <Txt style={[styles.historyValue, ui.tabular]}>
                  {config.display(e.value)}
                </Txt>
                <IconButton
                  accessibilityLabel={`Delete entry for ${formatDate(e.date)}`}
                  onPress={() =>
                    confirmDestructive(
                      `Delete the entry for ${formatDate(e.date)}?`,
                      "Delete",
                      () => onDelete(e.date)
                    )
                  }
                >
                  <Ionicons name="trash-outline" size={18} color={c.muted} />
                </IconButton>
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  form: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 12 },
  formField: { gap: 4 },
  grow: { flex: 1, minWidth: 110 },
  history: { paddingVertical: 4 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 },
  historyValue: { marginLeft: "auto", fontWeight: "600" },
});
