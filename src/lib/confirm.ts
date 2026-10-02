import { Alert, Platform } from "react-native";

// Native destructive-action confirm; react-native-web has no Alert
export function confirmDestructive(
  title: string,
  confirmLabel: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    if (window.confirm(title)) onConfirm();
    return;
  }
  Alert.alert(title, undefined, [
    { text: "Cancel", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
