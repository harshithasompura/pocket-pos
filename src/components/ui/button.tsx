import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { colors, radius, spacing } from "@/src/constants/theme";

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

export const Button = ({
  label,
  loading = false,
  variant = "primary",
  disabled,
  style,
  ...props
}: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    style={(state) => [
      styles.base,
      styles[variant],
      state.pressed && styles.pressed,
      (disabled || loading) && styles.disabled,
      typeof style === "function" ? style(state) : style,
    ]}
    {...props}
  >
    {loading ? (
      <ActivityIndicator color={variant === "primary" ? colors.inverse : colors.text} />
    ) : (
      <Text
        style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel]}
      >
        {label}
      </Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.text, borderColor: colors.text },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  danger: { backgroundColor: colors.surface, borderColor: colors.danger },
  label: { fontSize: 16, fontWeight: "700" },
  primaryLabel: { color: colors.inverse },
  secondaryLabel: { color: colors.text },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.45 },
});
