import type { Session } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// error: show it; notice: show it, stay on the page; pending: nothing to do
// yet (cancelled, or the browser is redirecting); none of them: signed in
export type AuthResult = { error?: string; notice?: string; pending?: boolean };

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

// Undefined until Supabase reports whether there's a saved login
let current: Session | null | undefined = supabase ? undefined : null;
const listeners = new Set<() => void>();
supabase?.auth.onAuthStateChange((_event, session) => {
  current = session;
  listeners.forEach((notify) => notify());
});

export function currentSession(): Session | null | undefined {
  return current;
}

export function useSession(): Session | null | undefined {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => current
  );
}

// Where Supabase sends people back to after Google or an email link
function redirectUrl(): string {
  return Platform.OS === "web" ? window.location.origin : makeRedirectUri();
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { error } = await client().auth.signInWithPassword({ email, password });
  return error ? { error: error.message } : {};
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
): Promise<AuthResult> {
  const { data: available, error: lookupError } = await client().rpc(
    "username_available",
    { name: username }
  );
  if (lookupError) return { error: lookupError.message };
  if (!available) return { error: "That username is taken. Try another." };

  // The username travels as sign-up metadata; a database trigger copies it
  // into the profiles table. The password goes straight to Supabase Auth,
  // which stores only a salted bcrypt hash of it.
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectUrl(), data: { username } },
  });
  // The profiles table rejected the username (someone took it a moment ago)
  if (error?.message.includes("Database error saving new user")) {
    return { error: "That username is taken. Try another." };
  }
  if (error) return { error: error.message };
  // With email confirmation on, there's no session until the link is tapped
  return data.session
    ? {}
    : { notice: "Check your email for a link to confirm your account." };
}

// Signs in from a redirect URL carrying tokens (OAuth return or email link)
export async function createSessionFromUrl(url: string): Promise<AuthResult> {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) return { error: params.error_description ?? errorCode };
  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) return { pending: true };
  const { error } = await client().auth.setSession({ access_token, refresh_token });
  return error ? { error: error.message } : {};
}

// A secure browser sheet that returns to the app (on web the whole page
// redirects and comes back)
export async function signInWithProvider(
  provider: "google"
): Promise<AuthResult> {
  if (Platform.OS === "web") {
    const { error } = await client().auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl() },
    });
    return error ? { error: error.message } : { pending: true };
  }

  const redirectTo = redirectUrl();
  const { data, error } = await client().auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) return { error: error.message };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return { pending: true };
  return createSessionFromUrl(result.url);
}

export async function signOut(): Promise<void> {
  await client().auth.signOut();
}

// Phones: an email confirmation link opens the app with the login in the URL.
// (Web picks this up itself via detectSessionInUrl.)
export function useAuthLinks() {
  const url = Linking.useLinkingURL();
  useEffect(() => {
    if (Platform.OS !== "web" && supabase && url?.includes("access_token")) {
      void createSessionFromUrl(url);
    }
  }, [url]);
}
