import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AppTabs from "@/components/AppTabs";
import { persistOptions, queryClient } from "@/data/queryClient";
import { useColors, useIsDark } from "@/lib/theme";

// Writes made offline are saved with the cache; send them once it's restored
const resumeQueuedWrites = () =>
  queryClient
    .resumePausedMutations()
    .then(() => queryClient.invalidateQueries());

export default function RootLayout() {
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
