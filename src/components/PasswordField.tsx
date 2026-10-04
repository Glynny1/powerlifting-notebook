import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef, useState } from "react";
import { StyleSheet, View, type TextInput, type TextInputProps } from "react-native";
import { useColors } from "@/lib/theme";
import { Field, IconButton } from "./ui";

// Password input with a show/hide toggle, so people can check what they typed
const PasswordField = forwardRef<TextInput, TextInputProps>(function PasswordField(
  { style, ...props },
  ref
) {
  const c = useColors();
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrap}>
      <Field
        ref={ref}
        {...props}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.field, style]}
      />
      <View style={styles.toggle}>
        <IconButton
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          onPress={() => setVisible((v) => !v)}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={c.muted}
          />
        </IconButton>
      </View>
    </View>
  );
});

export default PasswordField;

const styles = StyleSheet.create({
  wrap: { justifyContent: "center" },
  field: { paddingRight: 48 },
  toggle: { position: "absolute", right: 4 },
});
