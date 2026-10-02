import "react-native-url-polyfill/auto";
import "./localStorage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Null until .env.local has the URL and key, so screens can show a setup notice
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          storage: localStorage,
          autoRefreshToken: true,
          persistSession: true,
          // On web, Google/Apple sign-in returns to the page with the session in the URL
          detectSessionInUrl: Platform.OS === "web",
        },
      })
    : null;

// Phones: only keep the login token fresh while the app is in the foreground
if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
