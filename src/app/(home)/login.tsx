import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import AppleButton from "@/components/AppleButton";
import { SetupNotice } from "@/components/Loadable";
import { Button, Card, Divider, Field, Screen, styles as ui, Txt } from "@/components/ui";
import { signInWithApple } from "@/lib/appleSignIn";
import {
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
  type AuthResult,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/theme";

type Mode = "login" | "signup";

export default function LoginScreen() {
  const router = useRouter();
  const c = useColors();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(
    null
  );
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
    setMessage(null);
    const result = await action();
    setBusy(false);
    if (result.error) setMessage({ error: true, text: result.error });
    else if (result.notice) setMessage({ error: false, text: result.notice });
    else if (!result.pending) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }
  };

  const signup = mode === "signup";
  const canSubmit = email.trim() !== "" && password !== "" && !busy;
  const submit = () => {
    if (!canSubmit) return;
    void run(() =>
      signup
        ? signUpWithEmail(email.trim(), password)
        : signInWithEmail(email.trim(), password)
    );
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: signup ? "Create account" : "Log in" }} />
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
          <Field
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder={signup ? "At least 6 characters" : "Your password"}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={signup ? "new-password" : "current-password"}
            textContentType={signup ? "newPassword" : "password"}
            returnKeyType="go"
            onSubmitEditing={submit}
            accessibilityLabel="Password"
          />
        </View>
        {message && (
          <Txt
            tone={message.error ? "accent" : "secondary"}
            style={ui.small}
            accessibilityLiveRegion="polite"
          >
            {message.text}
          </Txt>
        )}
        <Button
          title={busy ? "Please wait…" : signup ? "Create account" : "Log in"}
          onPress={submit}
          disabled={!canSubmit}
        />
        <Pressable
          onPress={() => {
            setMode(signup ? "login" : "signup");
            setMessage(null);
          }}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.switch}
        >
          <Txt tone="secondary" style={ui.small}>
            {signup ? "Already have an account? " : "New here? "}
            <Txt tone="accent" style={[ui.small, styles.bold]}>
              {signup ? "Log in" : "Create an account"}
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

      <View style={styles.providers}>
        <Button
          title="Continue with Google"
          variant="ghost"
          onPress={() => void run(() => signInWithProvider("google"))}
          disabled={busy}
          icon={<Ionicons name="logo-google" size={18} color={c.foreground} />}
        />
        <AppleButton
          onPress={() => void run(signInWithApple)}
          disabled={busy}
        />
      </View>
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
  providers: { gap: 12 },
});
