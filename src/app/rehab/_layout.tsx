import { Stack } from "expo-router";
import { useStackOptions } from "@/lib/navigation";

export default function RehabStack() {
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: "Rehab", headerLargeTitle: true }}
      />
      <Stack.Screen name="edit" options={{ title: "Edit rehab" }} />
    </Stack>
  );
}
