import { StyleSheet, View, type ViewProps } from "react-native";

import { colors, radius, spacing } from "@/src/constants/theme";

export const Card = ({ style, ...props }: ViewProps) => <View style={[styles.card, style]} {...props} />;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg },
});
