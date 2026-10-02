import { Stack } from "expo-router";
import { useStackOptions } from "@/lib/navigation";

export default function LogStack() {
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: "Log", headerLargeTitle: true }}
      />
    </Stack>
  );
}
