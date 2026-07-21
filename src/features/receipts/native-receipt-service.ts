import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { SQLiteDatabase } from "expo-sqlite";

import { createReceiptService, type ReceiptAdapters } from "./receipt-service";

const nativeAdapters: ReceiptAdapters = {
  printAsync: (options) => Print.printAsync(options),
  printToFileAsync: (options) => Print.printToFileAsync(options),
  isSharingAvailableAsync: () => Sharing.isAvailableAsync(),
  shareAsync: (uri, options) => Sharing.shareAsync(uri, options),
};

export const createNativeReceiptService = (db: SQLiteDatabase) =>
  createReceiptService(db, nativeAdapters);
