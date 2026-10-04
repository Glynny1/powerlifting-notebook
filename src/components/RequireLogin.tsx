import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator } from "react-native";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/theme";
import { SetupNotice } from "./Loadable";
import { Notice } from "./ui";

// Shows children only to signed-in users; everyone else gets a prompt to log in
export default function RequireLogin({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const c = useColors();
  const session = useSession();

  if (!supabase) return <SetupNotice />;
  // Still checking for a saved login
  if (session === undefined) {
    return <ActivityIndicator color={c.muted} style={{ marginTop: 24 }} />;
  }
  if (!session) {
    return (
      <Notice
        title={title}
        action={{ label: "Log in", onPress: () => router.push("/login") }}
        secondaryAction={{
          label: "Create account",
          onPress: () => router.push("/signup"),
        }}
      >
        {message}
      </Notice>
    );
  }
  return children;
}
