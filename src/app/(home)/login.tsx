import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SetupNotice } from "@/components/Loadable";
import PasswordField from "@/components/PasswordField";
import { Button, Card, Divider, Field, Screen, styles as ui, Txt } from "@/components/ui";
import {
  signInWithEmail,
  signInWithProvider,
  type AuthResult,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const c = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  if (!supabase) {
    return (
      <Screen>
        <SetupNotice />
      </Screen>
    );
  }

  const run = async (action: () => Promise<AuthResult>) => {
    Keyboard.dismiss();
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.error) setError(result.error);
    else if (!result.pending) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }
  };

  const canSubmit = email.trim() !== "" && password !== "" && !busy;
  const submit = () => {
    if (canSubmit) void run(() => signInWithEmail(email.trim(), password));
  };

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.field}>
          <Txt tone="secondary" style={ui.small}>
            Email
          </Txt>
          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            accessibilityLabel="Email"
          />
        </View>
        <View style={styles.field}>
          <Txt tone="secondary" style={ui.small}>
            Password
          </Txt>
          <PasswordField
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            accessibilityLabel="Password"
          />
        </View>
        {error && (
          <Txt tone="accent" style={ui.small} accessibilityLiveRegion="polite">
            {error}
          </Txt>
        )}
        <Button
          title={busy ? "Please wait…" : "Log in"}
          onPress={submit}
          disabled={!canSubmit}
        />
        <Pressable
          onPress={() => router.replace("/signup")}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.switch}
        >
          <Txt tone="secondary" style={ui.small}>
            New here?{" "}
            <Txt tone="accent" style={[ui.small, styles.bold]}>
              Create an account
            </Txt>
          </Txt>
        </Pressable>
      </Card>

      <View style={styles.orRow}>
        <Divider style={styles.orLine} />
        <Txt tone="muted" style={ui.small}>
          or
        </Txt>
        <Divider style={styles.orLine} />
      </View>

      <Button
        title="Continue with Google"
        variant="ghost"
        onPress={() => void run(() => signInWithProvider("google"))}
        disabled={busy}
        icon={<Ionicons name="logo-google" size={18} color={c.foreground} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  field: { gap: 4 },
  bold: { fontWeight: "600" },
  switch: { alignSelf: "center", paddingVertical: 4 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1 },
});
