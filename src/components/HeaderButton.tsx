import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useColors, useIsDark } from "@/lib/theme";

// Text or icon button for the right side of a screen header
export default function HeaderButton({
  title,
  icon,
  outlined,
  filled,
  onPress,
  accessibilityLabel,
}: {
  title?: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  outlined?: boolean;
  filled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const c = useColors();
  const dark = useIsDark();
  const pill = outlined || filled;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      hitSlop={10}
      style={({ pressed }) => [
        styles.button,
        pill && [styles.pill, { borderColor: c.accent }],
        filled && { backgroundColor: c.accent },
        { opacity: pressed ? 0.5 : 1 },
      ]}
    >
      {icon && <Ionicons name={icon} size={22} color={c.foreground} />}
      {title && (
        <Text
          style={[
            styles.text,
            pill && styles.pillText,
            // Dark text on the lighter dark-mode red keeps enough contrast
            { color: filled ? (dark ? c.background : "#ffffff") : c.accent },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 6, minHeight: 32, justifyContent: "center" },
  pill: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14 },
  text: { fontSize: 17, fontWeight: "600" },
  pillText: { fontSize: 15 },
});
