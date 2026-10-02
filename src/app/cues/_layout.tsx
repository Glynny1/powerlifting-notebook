import { Stack } from "expo-router";
import { useStackOptions } from "@/lib/navigation";

export default function CuesStack() {
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: "Cues", headerLargeTitle: true }}
      />
    </Stack>
  );
}
