import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SetupNotice } from "@/components/Loadable";
import PasswordField from "@/components/PasswordField";
import { Button, Card, Field, Notice, Screen, styles as ui, Txt } from "@/components/ui";
import {
  emailLooksValid,
  normalizeUsername,
  passwordChecks,
  usernameProblem,
} from "@/lib/accountRules";
import { signUpWithEmail } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/theme";

export default function SignUpScreen() {
  const router = useRouter();
  const c = useColors();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  if (!supabase) {
    return (
      <Screen>
        <SetupNotice />
      </Screen>
    );
  }

  const goToLogin = () => router.replace("/login");

  // Account made, waiting for the person to confirm their email
  if (sentTo) {
    return (
      <Screen>
        <Notice
          title="Check your email"
          action={{ label: "Go to Log in", onPress: goToLogin }}
        >
          We&apos;ve sent a link to {sentTo}. Tap it to confirm your account,
          then log in.
        </Notice>
      </Screen>
    );
  }

  const name = normalizeUsername(username);
  const nameProblem = usernameProblem(name);
  const checks = passwordChecks(password);
  const canSubmit =
    !nameProblem && emailLooksValid(email) && checks.every((k) => k.met) && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    setBusy(true);
    setError(null);
    const result = await signUpWithEmail(email.trim(), password, name);
    setBusy(false);
    if (result.error) setError(result.error);
    else if (result.notice) {
      setPassword("");
      setSentTo(email.trim());
    } else if (!result.pending) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }
  };

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.field}>
          <Txt tone="secondary" style={ui.small}>
            Username
          </Txt>
          <Field
            value={username}
            onChangeText={setUsername}
            onBlur={() => setUsernameTouched(true)}
            placeholder="e.g. heavy_sam"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username-new"
            textContentType="username"
            maxLength={20}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            accessibilityLabel="Username"
          />
          <Txt
            tone={usernameTouched && nameProblem ? "accent" : "muted"}
            style={ui.tiny}
          >
            {usernameTouched && nameProblem
              ? nameProblem
              : "3 to 20 letters, numbers or underscores."}
          </Txt>
        </View>

        <View style={styles.field}>
          <Txt tone="secondary" style={ui.small}>
            Email
          </Txt>
          <Field
            ref={emailRef}
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
            placeholder="Create a password"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={submit}
            accessibilityLabel="Password"
          />
          <View style={styles.checks} accessibilityLabel="Password requirements">
            {checks.map((k) => (
              <View key={k.label} style={styles.check}>
                <Ionicons
                  name={k.met ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={k.met ? c.accent : c.muted}
                />
                <Txt
                  tone={k.met ? "default" : "muted"}
                  style={ui.tiny}
                  accessibilityLabel={`${k.label}: ${k.met ? "done" : "not yet"}`}
                >
                  {k.label}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        {error && (
          <Txt tone="accent" style={ui.small} accessibilityLiveRegion="polite">
            {error}
          </Txt>
        )}

        <Button
          title={busy ? "Creating your account…" : "Create account"}
          onPress={submit}
          disabled={!canSubmit}
        />

        <Pressable
          onPress={goToLogin}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.switch}
        >
          <Txt tone="secondary" style={ui.small}>
            Already have an account?{" "}
            <Txt tone="accent" style={[ui.small, styles.bold]}>
              Log in
            </Txt>
          </Txt>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  field: { gap: 4 },
  checks: { gap: 4, marginTop: 6 },
  check: { flexDirection: "row", alignItems: "center", gap: 6 },
  bold: { fontWeight: "600" },
  switch: { alignSelf: "center", paddingVertical: 4 },
});
