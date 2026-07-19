import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text } from "react-native";
import { Screen } from "@/src/components/ui/screen";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBusinessRepository } from "@/src/db/repositories/business-repository";
import { seedDemoData } from "@/src/db/seed";
import { Button } from "@/src/components/ui/button";
import type { Business } from "@/src/types/domain";
import type { BusinessValues } from "@/src/features/setup/business-schema";
import { BusinessForm } from "@/src/features/setup/business-form";

export const SettingsScreen = () => {
  const { db } = useDatabaseReady(); const [business, setBusiness] = useState<Business | null>(null);
  useEffect(() => { createBusinessRepository(db).get().then(setBusiness); }, [db]);
  if (!business) return <Screen style={styles.center}><ActivityIndicator color={colors.text} /></Screen>;
  const save = async (values: BusinessValues) => { setBusiness(await createBusinessRepository(db).save(values)); Alert.alert("Saved", "Business settings updated."); };
  const seed = () => Alert.alert("Add demo products?", "Demo data is added only when the catalogue is empty.", [{ text: "Cancel", style: "cancel" }, { text: "Add demo data", onPress: async () => { const result = await seedDemoData(db); Alert.alert(result.created ? "Demo data added" : "Catalogue unchanged", result.created ? `${result.created} products created.` : "Products already exist."); } }]);
  return <Screen scroll style={styles.screen}><Text style={styles.title}>Business settings</Text><Text style={styles.body}>Receipt and billing defaults stay on this device.</Text><BusinessForm initial={{ ...business, address: business.address ?? "", phone: business.phone ?? "", gstNumber: business.gstNumber ?? "", receiptFooter: business.receiptFooter ?? "" }} submitLabel="Save changes" onSubmit={save} />{__DEV__ && <Button label="Add demo products" variant="secondary" onPress={seed} />}</Screen>;
};
const styles = StyleSheet.create({ center: { justifyContent: "center" }, screen: { gap: spacing.md }, title: { color: colors.text, fontSize: 30, fontWeight: "800" }, body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: spacing.md } });
export default SettingsScreen;
