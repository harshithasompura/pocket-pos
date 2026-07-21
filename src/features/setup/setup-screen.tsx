import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PocketPosLogo } from "@/src/components/brand/pocketpos-logo";
import { Screen } from "@/src/components/ui/screen";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBusinessRepository } from "@/src/db/repositories/business-repository";
import type { BusinessValues } from "./business-schema";
import { BusinessForm } from "./business-form";

export const SetupScreen = () => {
  const { db } = useDatabaseReady();
  const save = async (values: BusinessValues) => {
    await createBusinessRepository(db).save(values);
    router.replace("/(tabs)");
  };
  return (
    <Screen scroll style={styles.screen}>
      <PocketPosLogo />
      <View style={styles.header}>
        <Text style={styles.title}>Set up your counter.</Text>
        <Text style={styles.body}>
          Everything stays on this device. You can change these details later.
        </Text>
      </View>
      <BusinessForm submitLabel="Start using PocketPOS" onSubmit={save} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  header: { gap: spacing.xs },
  title: { color: colors.text, fontSize: 34, fontWeight: "800", letterSpacing: -1 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
});
