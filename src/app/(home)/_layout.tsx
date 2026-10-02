import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
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
          headerRight: () => (
            <View style={styles.actions}>
              {/* Placeholder until accounts exist; it doesn't do anything yet */}
              <HeaderButton title="Login" outlined onPress={() => {}} />
              <HeaderButton
                icon="settings-outline"
                accessibilityLabel="Settings"
                onPress={() => router.push("/settings")}
              />
            </View>
          ),
        }}
      />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
});
