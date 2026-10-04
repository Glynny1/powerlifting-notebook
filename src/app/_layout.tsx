import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AppTabs from "@/components/AppTabs";
import { persistOptions, queryClient } from "@/data/queryClient";
import { currentSession, useAuthLinks } from "@/lib/auth";
import { useColors, useIsDark } from "@/lib/theme";

// Writes made offline are saved with the cache; send them once it's restored.
// If nobody is signed in, drop the saved copy instead.
const resumeQueuedWrites = async () => {
  if (currentSession() === null) {
    queryClient.clear();
    return;
  }
  await queryClient.resumePausedMutations();
  await queryClient.invalidateQueries();
};

export default function RootLayout() {
  useAuthLinks();
  const c = useColors();
  const base = useIsDark() ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.accent,
      background: c.background,
      card: c.surface,
      text: c.foreground,
      border: c.hairline,
      notification: c.accent,
    },
  };

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={resumeQueuedWrites}
    >
      <ThemeProvider value={theme}>
        <StatusBar style="auto" />
        <AppTabs />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
