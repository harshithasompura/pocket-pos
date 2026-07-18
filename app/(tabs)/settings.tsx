import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text } from "react-native";
import { Screen } from "@/src/components/ui/screen";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBusinessRepository } from "@/src/db/repositories/business-repository";
import type { Business } from "@/src/types/domain";
import type { BusinessValues } from "@/src/features/setup/business-schema";
import { BusinessForm } from "@/src/features/setup/business-form";

export const SettingsScreen = () => {
  const { db } = useDatabaseReady(); const [business, setBusiness] = useState<Business | null>(null);
  useEffect(() => { createBusinessRepository(db).get().then(setBusiness); }, [db]);
  if (!business) return <Screen style={styles.center}><ActivityIndicator color={colors.text} /></Screen>;
  const save = async (values: BusinessValues) => { setBusiness(await createBusinessRepository(db).save(values)); Alert.alert("Saved", "Business settings updated."); };
  return <Screen scroll style={styles.screen}><Text style={styles.title}>Business settings</Text><Text style={styles.body}>Receipt and billing defaults stay on this device.</Text><BusinessForm initial={{ ...business, address: business.address ?? "", phone: business.phone ?? "", gstNumber: business.gstNumber ?? "", receiptFooter: business.receiptFooter ?? "" }} submitLabel="Save changes" onSubmit={save} /></Screen>;
};
const styles = StyleSheet.create({ center: { justifyContent: "center" }, screen: { gap: spacing.sm }, title: { color: colors.text, fontSize: 30, fontWeight: "800" }, body: { color: colors.muted, fontSize: 16, marginBottom: spacing.lg } });
export default SettingsScreen;
