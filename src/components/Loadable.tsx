import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/theme";
import { Notice } from "./ui";

export function SetupNotice() {
  return (
    <Notice title="Connect Supabase">
      Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to
      .env.local, then restart npx expo start.
    </Notice>
  );
}

// Shows a query's data, or the right notice while it can't
export function Loadable<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  const c = useColors();
  if (!supabase) return <SetupNotice />;
  if (query.data !== undefined) return children(query.data);
  if (query.isError) {
    return (
      <Notice
        title="Couldn't load this"
        action={{ label: "Try again", onPress: () => void query.refetch() }}
      >
        {query.error.message}
      </Notice>
    );
  }
  if (query.isPaused) {
    return (
      <Notice title="You're offline">
        This hasn&apos;t been loaded on this phone yet. It&apos;ll appear once
        you&apos;re back online.
      </Notice>
    );
  }
  return <ActivityIndicator color={c.muted} style={{ marginTop: 24 }} />;
}
