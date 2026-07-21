import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { SQLiteDatabase } from "expo-sqlite";

import { createBackup } from "./backup-service";
import type { BackupV1 } from "./backup-types";
import { parseBackupJson } from "./backup-validation";

export const exportAndShareBackup = async (db: SQLiteDatabase): Promise<string> => {
  if (!FileSystem.documentDirectory)
    throw new Error("Backup storage is unavailable on this device.");

  const backup = await createBackup(db);
  const date = backup.exportedAt.slice(0, 10);
  const uri = `${FileSystem.documentDirectory}pocketpos-backup-${date}.json`;

  await FileSystem.writeAsStringAsync(uri, JSON.stringify(backup, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      dialogTitle: "Save PocketPOS backup",
      mimeType: "application/json",
      UTI: "public.json",
    });
  }

  return uri;
};

export const pickAndReadBackup = async (): Promise<BackupV1 | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: "application/json",
  });

  if (result.canceled) return null;

  const text = await FileSystem.readAsStringAsync(result.assets[0].uri);
  return parseBackupJson(text);
};
