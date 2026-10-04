import { forwardRef, type ReactNode } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useColors } from "@/lib/theme";

// Scrolling page body. iOS adjusts for the large-title header and tab bar.
export function Screen({
  children,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const c = useColors();
  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={c.muted}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.hairline },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type Tone = "default" | "secondary" | "muted" | "accent";

export function Txt({
  tone = "default",
  style,
  ...props
}: TextProps & { tone?: Tone }) {
  const c = useColors();
  const color = {
    default: c.foreground,
    secondary: c.secondary,
    muted: c.muted,
    accent: c.accent,
  }[tone];
  return <Text {...props} style={[styles.body, { color }, style]} />;
}

// Small uppercase heading, e.g. "NEXT MEET"
export function Label({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Txt tone="muted" style={[styles.label, style]} accessibilityRole="header">
      {children}
    </Txt>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[styles.divider, { backgroundColor: c.hairline }, style]} />;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  icon,
  style,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const c = useColors();
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        primary
          ? { backgroundColor: c.foreground }
          : { borderColor: c.hairline, borderWidth: StyleSheet.hairlineWidth * 2 },
        { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.buttonText,
          { color: primary ? c.background : c.secondary },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

// Round icon-only button, e.g. trash or pencil
export function IconButton({
  children,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

export const Field = forwardRef<TextInput, TextInputProps>(function Field(
  { style, ...props },
  ref
) {
  const c = useColors();
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={c.muted}
      selectionColor={c.accent}
      {...props}
      style={[
        styles.field,
        {
          color: c.foreground,
          backgroundColor: c.background,
          borderColor: c.hairline,
        },
        style,
      ]}
    />
  );
});

// Rounded pill showing reps or a duration
export function Chip({
  children,
  active,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  const c = useColors();
  return (
    <View
      style={[styles.chip, { borderColor: active ? c.accent : c.hairline }]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? c.accent : c.secondary },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function Notice({
  title,
  children,
  action,
  secondaryAction,
}: {
  title: string;
  children: ReactNode;
  action?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
}) {
  return (
    <Card>
      <Txt style={styles.noticeTitle}>{title}</Txt>
      <Txt tone="secondary" style={styles.small}>
        {children}
      </Txt>
      {(action || secondaryAction) && (
        <View style={styles.noticeActions}>
          {action && <Button title={action.label} onPress={action.onPress} />}
          {secondaryAction && (
            <Button
              title={secondaryAction.label}
              variant="ghost"
              onPress={secondaryAction.onPress}
            />
          )}
        </View>
      )}
    </Card>
  );
}

export const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 32, gap: 16 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: 16,
  },
  body: { fontSize: 16, lineHeight: 22 },
  small: { fontSize: 14, lineHeight: 20 },
  tiny: { fontSize: 12, lineHeight: 16 },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  divider: { height: StyleSheet.hairlineWidth * 2 },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buttonText: { fontSize: 15, fontWeight: "600" },
  iconButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  noticeTitle: { fontWeight: "600" },
  noticeActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tabular: { fontVariant: ["tabular-nums"] },
});
