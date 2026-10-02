import { Stack, useRouter } from "expo-router";
import HeaderButton from "@/components/HeaderButton";
import { useStackOptions } from "@/lib/navigation";

export default function HomeStack() {
  const router = useRouter();
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen
        name="index"
        options={{
          title: "Notebook",
          headerLargeTitle: true,
          // Placeholder until accounts exist; it doesn't do anything yet
          headerLeft: () => <HeaderButton title="Login" onPress={() => {}} />,
          headerRight: () => (
            <HeaderButton
              icon="settings-outline"
              accessibilityLabel="Settings"
              onPress={() => router.push("/settings")}
            />
          ),
        }}
      />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}
