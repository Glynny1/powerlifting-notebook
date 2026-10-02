import "@/lib/localStorage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { focusManager, onlineManager, QueryClient } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";
import { registerMutations } from "./queries";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    // Kept for a week so the last-seen data shows with no signal
    queries: { gcTime: WEEK, staleTime: 30_000, retry: 2 },
  },
});
registerMutations(queryClient);

export const persistOptions = {
  persister: createAsyncStoragePersister({
    storage: localStorage,
    key: "powerlifting-notebook-cache",
  }),
  maxAge: WEEK,
};

// The browser reports online/focus itself; on a phone, wire them up
if (Platform.OS !== "web") {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(!!state.isConnected))
  );
  AppState.addEventListener("change", (status) =>
    focusManager.setFocused(status === "active")
  );
}
