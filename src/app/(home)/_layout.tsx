import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import HeaderButton from "@/components/HeaderButton";
import { signOut, useSession } from "@/lib/auth";
import { confirmDestructive } from "@/lib/confirm";
import { useStackOptions } from "@/lib/navigation";

function AccountButton() {
  const router = useRouter();
  const session = useSession();
  if (session) {
    return (
      <HeaderButton
        title="Log out"
        outlined
        onPress={() =>
          confirmDestructive("Log out of Powerlifting Notebook?", "Log out", () =>
            void signOut()
          )
        }
      />
    );
  }
  return (
    <View style={styles.actions}>
      <HeaderButton
        title="Sign up"
        filled
        onPress={() => router.push("/signup")}
      />
      <HeaderButton title="Login" outlined onPress={() => router.push("/login")} />
    </View>
  );
}

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
              <AccountButton />
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
      <Stack.Screen name="login" options={{ title: "Log in" }} />
      <Stack.Screen name="signup" options={{ title: "Sign up" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
});
