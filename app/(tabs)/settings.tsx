import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Screen } from "@/src/components/ui/screen";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBusinessRepository } from "@/src/db/repositories/business-repository";
import { seedDemoData } from "@/src/db/seed";
import { restoreBackup } from "@/src/features/backup/backup-service";
import { exportAndShareBackup, pickAndReadBackup } from "@/src/features/backup/native-backup-service";
import type { BackupV1 } from "@/src/features/backup/backup-types";
import { BusinessForm } from "@/src/features/setup/business-form";
import type { BusinessValues } from "@/src/features/setup/business-schema";
import type { Business } from "@/src/types/domain";

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";

export const SettingsScreen = () => {
  const { db } = useDatabaseReady();
  const [business, setBusiness] = useState<Business | null>(null);
  const [backupAction, setBackupAction] = useState<"export" | "restore" | null>(null);

  useEffect(() => { createBusinessRepository(db).get().then(setBusiness); }, [db]);

  if (!business) return <Screen style={styles.center}><ActivityIndicator color={colors.text} /></Screen>;

  const save = async (values: BusinessValues) => {
    setBusiness(await createBusinessRepository(db).save(values));
    Alert.alert("Saved", "Business settings updated.");
  };

  const seed = () => Alert.alert("Add demo products?", "Demo data is added only when the catalogue is empty.", [
    { text: "Cancel", style: "cancel" },
    { text: "Add demo data", onPress: async () => { const result = await seedDemoData(db); Alert.alert(result.created ? "Demo data added" : "Catalogue unchanged", result.created ? `${result.created} products created.` : "Products already exist."); } },
  ]);

  const exportBackup = async () => {
    setBackupAction("export");
    try {
      await exportAndShareBackup(db);
    } catch (error) {
      Alert.alert("Backup failed", errorMessage(error));
    } finally {
      setBackupAction(null);
    }
  };

  const confirmRestore = (backup: BackupV1) => {
    const details = [
      `Exported ${new Date(backup.exportedAt).toLocaleString()}`,
      `${backup.products.length} products · ${backup.bills.length} bills · ${backup.inventoryMovements.length} stock movements`,
      "\nThis replaces all current PocketPOS data and cannot be undone.",
    ].join("\n");

    Alert.alert("Restore this backup?", details, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Replace all data",
        style: "destructive",
        onPress: async () => {
          setBackupAction("restore");
          try {
            await restoreBackup(db, backup);
            Alert.alert("Restore complete", "Close and reopen PocketPOS to load the restored data.");
          } catch (error) {
            Alert.alert("Restore failed", errorMessage(error));
          } finally {
            setBackupAction(null);
          }
        },
      },
    ]);
  };

  const chooseBackup = async () => {
    setBackupAction("restore");
    try {
      const backup = await pickAndReadBackup();
      setBackupAction(null);
      if (backup) confirmRestore(backup);
    } catch (error) {
      setBackupAction(null);
      Alert.alert("Invalid backup", errorMessage(error));
    }
  };

  return (
    <Screen scroll style={styles.screen}>
      <Text style={styles.title}>Business settings</Text>
      <Text style={styles.body}>Receipt and billing defaults stay on this device.</Text>
      <Card style={styles.backupCard}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Data backup</Text>
          <Text style={styles.cardBody}>Save a portable copy of your business, products, bills, and stock history.</Text>
        </View>
        <Button label="Export & share backup" loading={backupAction === "export"} disabled={backupAction !== null} onPress={exportBackup} />
        <Button label="Restore backup" loading={backupAction === "restore"} disabled={backupAction !== null} variant="secondary" onPress={chooseBackup} />
      </Card>
      <BusinessForm initial={{ ...business, address: business.address ?? "", phone: business.phone ?? "", gstNumber: business.gstNumber ?? "", receiptFooter: business.receiptFooter ?? "" }} submitLabel="Save changes" onSubmit={save} />
      {__DEV__ && <Button label="Add demo products" variant="secondary" onPress={seed} />}
    </Screen>
  );
};

const styles = StyleSheet.create({
  backupCard: { gap: spacing.md, marginTop: spacing.md },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: spacing.md },
  cardBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  cardCopy: { gap: spacing.xs },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  center: { justifyContent: "center" },
  screen: { gap: spacing.md },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
});

export default SettingsScreen;
