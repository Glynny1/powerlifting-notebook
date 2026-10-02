import * as AppleAuthentication from "expo-apple-authentication";
import { StyleSheet } from "react-native";
import { useIsDark } from "@/lib/theme";

// Apple's own button, which App Review expects on iPhone
export default function AppleButton({
  onPress,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const dark = useIsDark();
  const { BLACK, WHITE } = AppleAuthentication.AppleAuthenticationButtonStyle;
  return (
    <AppleAuthentication.AppleAuthenticationButton
      // The native button doesn't restyle in place, so remount on theme change
      key={dark ? "dark" : "light"}
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={dark ? WHITE : BLACK}
      cornerRadius={10}
      style={styles.button}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  button: { height: 48, width: "100%" },
});
