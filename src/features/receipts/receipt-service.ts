import type { SQLiteDatabase } from "expo-sqlite";

import { createBillRepository } from "@/src/db/repositories/bill-repository";
import { mapBusiness, type BusinessRow } from "@/src/db/repositories/repository-mappers";
import { renderReceiptHtml } from "./receipt-renderer";

export type ReceiptAdapters = {
  printAsync: (options: { html: string }) => Promise<void>;
  printToFileAsync: (options: { html: string }) => Promise<{ uri: string }>;
  isSharingAvailableAsync: () => Promise<boolean>;
  shareAsync: (uri: string, options: { mimeType: string; dialogTitle: string }) => Promise<void>;
};

export const createReceiptService = (db: SQLiteDatabase, adapters: ReceiptAdapters) => {
  const bills = createBillRepository(db);

  const loadReceipt = async (billId: string) => {
    const [businessRow, bill, items] = await Promise.all([
      db.getFirstAsync<BusinessRow>("SELECT * FROM businesses LIMIT 1"),
      bills.get(billId),
      bills.listItems(billId),
    ]);
    if (!businessRow) throw new Error("Business settings were not found.");
    if (!bill) throw new Error("Bill was not found.");
    if (items.length === 0) throw new Error("Bill items were not found.");
    const business = mapBusiness(businessRow);
    return { bill, html: renderReceiptHtml({ business, bill, items }) };
  };

  const createBillPdf = async (billId: string): Promise<string> => {
    const { html } = await loadReceipt(billId);
    const { uri } = await adapters.printToFileAsync({ html });
    await bills.setPdfUri(billId, uri);
    return uri;
  };

  return {
    async printBillReceipt(billId: string): Promise<void> {
      const { html } = await loadReceipt(billId);
      try {
        await adapters.printAsync({ html });
        await bills.setPrintStatus(billId, "printed");
      } catch (error) {
        await bills.setPrintStatus(billId, "failed");
        throw error;
      }
    },
    createBillPdf,
    async shareBillPdf(billId: string): Promise<string> {
      const bill = await bills.get(billId);
      if (!bill) throw new Error("Bill was not found.");
      const uri = bill.pdfUri ?? await createBillPdf(billId);
      if (!await adapters.isSharingAvailableAsync()) throw new Error("Sharing is not available on this device.");
      await adapters.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `Share ${bill.billNumber}` });
      return uri;
    },
  };
};
