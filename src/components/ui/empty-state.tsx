import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/src/constants/theme";
import { Button } from "./button";

type EmptyStateProps = { icon: LucideIcon; title: string; body: string; actionLabel?: string; onAction?: () => void };

export const EmptyState = ({ icon: Icon, title, body, actionLabel, onAction }: EmptyStateProps) => (
  <View style={styles.container}>
    <Icon color={colors.text} size={34} strokeWidth={1.75} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
    {!!actionLabel && !!onAction && <Button label={actionLabel} onPress={onAction} />}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: spacing.md, justifyContent: "center", padding: spacing.xl },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24, maxWidth: 420, textAlign: "center" },
});
