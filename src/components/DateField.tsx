import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { formatDate } from "@/lib/format";
import { useColors, useIsDark } from "@/lib/theme";
import { Field } from "./ui";

function toDate(iso: string): Date {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function toIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// A YYYY-MM-DD value edited with the platform's own date picker
export default function DateField({
  value,
  onChange,
  placeholder = "Pick a date",
  accessibilityLabel,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  accessibilityLabel: string;
}) {
  const c = useColors();
  const dark = useIsDark();

  if (Platform.OS === "web") {
    return (
      <Field
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  if (Platform.OS === "ios" && value) {
    return (
      <DateTimePicker
        value={toDate(value)}
        mode="date"
        display="compact"
        accentColor={c.accent}
        themeVariant={dark ? "dark" : "light"}
        onChange={(_e, d) => d && onChange(toIso(d))}
        accessibilityLabel={accessibilityLabel}
        style={styles.iosPicker}
      />
    );
  }

  // Android, or iOS with no date yet: a button that opens the picker
  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: value ? toDate(value) : new Date(),
        mode: "date",
        onChange: (e, d) => {
          if (e.type === "set" && d) onChange(toIso(d));
        },
      });
    } else {
      onChange(toIso(new Date()));
    }
  };

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: c.background,
          borderColor: c.hairline,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.text, { color: value ? c.foreground : c.muted }]}>
        {value ? formatDate(value) : placeholder}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iosPicker: { alignSelf: "flex-start" },
  button: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  text: { fontSize: 16 },
});
