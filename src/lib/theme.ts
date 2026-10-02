import { useColorScheme } from "react-native";

// Warm gray neutrals and one accent, used sparingly
const light = {
  background: "#f9f9f7",
  surface: "#fcfcfb",
  foreground: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  hairline: "rgba(11, 11, 11, 0.1)",
  gridline: "#e1e0d9",
  accent: "#d03b3b",
  chartWeight: "#2a78d6",
  chartCalories: "#eb6834",
};

const dark: typeof light = {
  background: "#0d0d0d",
  surface: "#1a1a19",
  foreground: "#ffffff",
  secondary: "#c3c2b7",
  muted: "#898781",
  hairline: "rgba(255, 255, 255, 0.1)",
  gridline: "#2c2c2a",
  accent: "#e66767",
  chartWeight: "#3987e5",
  chartCalories: "#d95926",
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === "dark" ? dark : light;
}

export function useIsDark(): boolean {
  return useColorScheme() === "dark";
}
