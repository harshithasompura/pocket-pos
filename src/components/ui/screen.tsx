import { SafeAreaView, ScrollView, StyleSheet, View, type ViewProps } from "react-native";

import { colors, spacing } from "@/src/constants/theme";

type ScreenProps = ViewProps & { scroll?: boolean };

export const Screen = ({ scroll = false, children, style, ...props }: ScreenProps) => (
  <SafeAreaView style={styles.safe}>
    {scroll ? (
      <ScrollView contentContainerStyle={[styles.content, style]} keyboardShouldPersistTaps="handled" scrollIndicatorInsets={styles.indicatorInsets} {...props}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    ) : (
      <View style={[styles.content, styles.inner, style]} {...props}>{children}</View>
    )}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, paddingBottom: spacing.xxl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  indicatorInsets: { bottom: spacing.md, right: spacing.xs, top: spacing.md },
  inner: { alignSelf: "center", maxWidth: 820, width: "100%" },
});
