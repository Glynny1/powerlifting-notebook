import { useState } from "react";
import { useColors } from "./theme";

// Shared header look for every tab's stack
export function useStackOptions() {
  const c = useColors();
  return {
    headerStyle: { backgroundColor: c.background },
    headerTintColor: c.foreground,
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerBackButtonDisplayMode: "minimal" as const,
    contentStyle: { backgroundColor: c.background },
  };
}

// Pull-to-refresh state that only spins for a pull, not background refetches
export function useRefresh(...refetchers: (() => Promise<unknown>)[]) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all(refetchers.map((refetch) => refetch()));
    } finally {
      setRefreshing(false);
    }
  };
  return { refreshing, onRefresh };
}
