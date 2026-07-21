import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { PocketPosLogo } from "@/src/components/brand/pocketpos-logo";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBusinessRepository } from "@/src/db/repositories/business-repository";
import { getInitialRoute } from "@/src/features/setup/initial-route";

export const IndexScreen = () => {
  const { db } = useDatabaseReady();
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  useEffect(() => {
    createBusinessRepository(db)
      .get()
      .then((business) => setHasBusiness(!!business));
  }, [db]);
  if (hasBusiness !== null) return <Redirect href={getInitialRoute(hasBusiness)} />;
  return (
    <View style={styles.container}>
      <PocketPosLogo />
      <Text style={styles.title}>Billing that stays in your pocket.</Text>
      <ActivityIndicator color={colors.text} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
    marginTop: spacing.md,
  },
  body: { color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: spacing.md },
  loader: { alignSelf: "flex-start", marginTop: spacing.lg },
});

export default IndexScreen;
