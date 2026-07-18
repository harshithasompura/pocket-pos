import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/src/constants/theme";

export const IndexScreen = () => (
  <View style={styles.container}>
    <Text style={styles.eyebrow}>POCKETPOS</Text>
    <Text style={styles.title}>Billing that stays in your pocket.</Text>
    <Text style={styles.body}>Offline setup is being prepared.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 36, fontWeight: "800", lineHeight: 42, marginTop: spacing.md },
  body: { color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: spacing.md },
});

export default IndexScreen;
