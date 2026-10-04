import Ionicons from "@expo/vector-icons/Ionicons";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSession } from "@/lib/auth";
import { useColors } from "@/lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Native tabs float at the top on web; this keeps a phone-style bottom bar
// for testing in the browser
function TabButton({
  label,
  icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & { label: string; icon: IconName }) {
  const c = useColors();
  const color = isFocused ? c.accent : c.muted;
  return (
    <Pressable
      {...props}
      role="tab"
      aria-selected={isFocused}
      style={styles.button}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const c = useColors();
  const session = useSession();
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />
      {/* Stays mounted (it defines the tabs) but hidden until signed in */}
      <TabList
        style={[
          styles.bar,
          { backgroundColor: c.surface, borderColor: c.hairline },
          !session && styles.hidden,
        ]}
      >
        <TabTrigger name="(home)" href="/" asChild>
          <TabButton label="Home" icon="home-outline" />
        </TabTrigger>
        <TabTrigger name="warmups" href="/warmups" asChild>
          <TabButton label="Warm-ups" icon="body-outline" />
        </TabTrigger>
        <TabTrigger name="cues" href="/cues" asChild>
          <TabButton label="Cues" icon="chatbox-ellipses-outline" />
        </TabTrigger>
        <TabTrigger name="rehab" href="/rehab" asChild>
          <TabButton label="Rehab" icon="bandage-outline" />
        </TabTrigger>
        <TabTrigger name="log" href="/log" asChild>
          <TabButton label="Log" icon="analytics-outline" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
  slot: { flex: 1 },
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    paddingTop: 6,
    paddingBottom: 8,
  },
  hidden: { display: "none" },
  button: { flex: 1, alignItems: "center", gap: 2 },
  label: { fontSize: 11, fontWeight: "600" },
});
