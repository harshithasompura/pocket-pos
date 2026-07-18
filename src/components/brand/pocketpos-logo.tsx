import { Image, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/src/constants/theme";

type PocketPosLogoProps = { compact?: boolean };

export const PocketPosLogo = ({ compact = false }: PocketPosLogoProps) => (
  <View style={styles.row}>
    <Image source={require("@/assets/pocketpos-mark.png")} style={compact ? styles.compactMark : styles.mark} />
    {!compact && <Text style={styles.wordmark}>PocketPOS</Text>}
  </View>
);

const styles = StyleSheet.create({
  row: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  mark: { height: 48, width: 48 },
  compactMark: { height: 32, width: 32 },
  wordmark: { color: colors.text, fontSize: 23, fontWeight: "800", letterSpacing: -0.7 },
});
