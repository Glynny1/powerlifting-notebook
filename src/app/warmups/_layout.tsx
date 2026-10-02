import { Stack } from "expo-router";
import { useStackOptions } from "@/lib/navigation";

export default function WarmupsStack() {
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: "Warm-ups", headerLargeTitle: true }}
      />
      <Stack.Screen name="edit" options={{ title: "Edit warm-ups" }} />
    </Stack>
  );
}
