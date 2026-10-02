import * as AppleAuthentication from "expo-apple-authentication";
import type { AuthResult } from "./auth";
import { supabase } from "./supabase";

// iPhone: Apple's own sign-in sheet, then hand the token to Supabase
export async function signInWithApple(): Promise<AuthResult> {
  if (!supabase) return { error: "Supabase is not configured" };
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      return { error: "Apple didn't return a sign-in token. Try again." };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });
    if (error) return { error: error.message };

    // Apple only shares the person's name on their very first sign-in
    const { givenName, familyName } = credential.fullName ?? {};
    if (givenName || familyName) {
      await supabase.auth.updateUser({
        data: {
          full_name: [givenName, familyName].filter(Boolean).join(" "),
          given_name: givenName,
          family_name: familyName,
        },
      });
    }
    return {};
  } catch (e) {
    if ((e as { code?: string }).code === "ERR_REQUEST_CANCELED") {
      return { pending: true };
    }
    return { error: e instanceof Error ? e.message : "Apple sign-in failed." };
  }
}
