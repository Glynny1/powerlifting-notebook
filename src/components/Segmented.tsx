import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { LIFTS, liftLabel, type Lift } from "@/lib/lifts";
import { useColors } from "@/lib/theme";

// Pill-style switcher, e.g. Squat / Bench / Deadlift
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  const c = useColors();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={styles.row}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              void Haptics.selectionAsync();
              onChange(o.value);
            }}
            style={({ pressed }) => [
              styles.pill,
              active
                ? { backgroundColor: c.foreground, borderColor: c.foreground }
                : { borderColor: c.hairline },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: active ? c.background : c.secondary },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const liftOptions = LIFTS.map((l) => ({ value: l, label: liftLabel(l) }));

export function LiftPicker({
  value,
  onChange,
}: {
  value: Lift;
  onChange: (lift: Lift) => void;
}) {
  return (
    <Segmented
      options={liftOptions}
      value={value}
      onChange={onChange}
      accessibilityLabel="Lift"
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    justifyContent: "center",
  },
  text: { fontSize: 14, fontWeight: "600" },
});
