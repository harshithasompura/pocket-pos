import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { colors, radius, spacing } from "@/src/constants/theme";

type FieldProps = TextInputProps & { label: string; error?: string; hint?: string };

export const Field = forwardRef<TextInput, FieldProps>(({ label, error, hint, style, ...props }, ref) => (
  <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      ref={ref}
      accessibilityLabel={label}
      placeholderTextColor={colors.muted}
      style={[styles.input, error && styles.inputError, style]}
      {...props}
    />
    {!!error && <Text style={styles.error}>{error}</Text>}
    {!error && !!hint && <Text style={styles.hint}>{hint}</Text>}
  </View>
));

Field.displayName = "Field";

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13 },
  hint: { color: colors.muted, fontSize: 13 },
});
