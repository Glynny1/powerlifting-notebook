import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColors } from "@/lib/theme";

// The platform's own tab bar: Liquid Glass on iOS, Material on Android
export default function AppTabs() {
  const c = useColors();
  return (
    <NativeTabs tintColor={c.accent}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="warmups">
        <NativeTabs.Trigger.Label>Warm-ups</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.flexibility" md="self_improvement" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cues">
        <NativeTabs.Trigger.Label>Cues</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "quote.bubble", selected: "quote.bubble.fill" }}
          md="format_quote"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rehab">
        <NativeTabs.Trigger.Label>Rehab</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "bandage", selected: "bandage.fill" }}
          md="healing"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="log">
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.xyaxis.line" md="monitoring" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
