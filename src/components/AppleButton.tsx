import Ionicons from "@expo/vector-icons/Ionicons";
import { useColors } from "@/lib/theme";
import { Button } from "./ui";

// Android and web: same look as the Google button, opens Apple in a browser
export default function AppleButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const c = useColors();
  return (
    <Button
      title="Continue with Apple"
      variant="ghost"
      onPress={onPress}
      disabled={disabled}
      icon={<Ionicons name="logo-apple" size={18} color={c.foreground} />}
    />
  );
}
