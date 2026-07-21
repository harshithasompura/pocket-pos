import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import { createReceiptService, type ReceiptAdapters } from "./receipt-service";

const businessRow = {
  id: "shop",
  name: "Som Stores",
  address: null,
  phone: null,
  gst_number: null,
  currency: "INR",
  receipt_width: 58,
  receipt_footer: null,
  tax_enabled: 0,
  default_tax_percentage: 0,
  inventory_tracking_enabled: 1,
  created_at: "2026-07-19T06:00:00.000Z",
  updated_at: "2026-07-19T06:00:00.000Z",
};
const billRow = {
  id: "bill-1",
  business_id: "shop",
  bill_number: "INV-000001",
  subtotal_paise: 3000,
  discount_paise: 0,
  tax_paise: 0,
  total_paise: 3000,
  total_units: 1,
  payment_method: "cash",
  status: "completed",
  print_status: "not_printed",
  pdf_uri: null,
  void_reason: null,
  created_at: "2026-07-19T06:00:00.000Z",
  voided_at: null,
};
const itemRow = {
  id: "item-1",
  bill_id: "bill-1",
  product_id: "tea",
  product_name_snapshot: "Tea",
  sku_snapshot: null,
  quantity: 1,
  unit_price_paise: 3000,
  line_total_paise: 3000,
  affects_inventory: 1,
  created_at: "2026-07-19T06:00:00.000Z",
};

const setup = (pdfUri: string | null = null, overrides: Partial<ReceiptAdapters> = {}) => {
  const updates: unknown[][] = [];
  const db = {
    getFirstAsync: async (sql: string) =>
      sql.includes("businesses") ? businessRow : { ...billRow, pdf_uri: pdfUri },
    getAllAsync: async () => [itemRow],
    runAsync: async (...args: unknown[]) => {
      updates.push(args);
    },
  } as unknown as SQLiteDatabase;
  const shared: string[] = [];
  const adapters: ReceiptAdapters = {
    printAsync: async () => undefined,
    printToFileAsync: async () => ({ uri: "file:///new.pdf" }),
    isSharingAvailableAsync: async () => true,
    shareAsync: async (uri) => {
      shared.push(uri);
    },
    ...overrides,
  };
  return { service: createReceiptService(db, adapters), updates, shared };
};

describe("receipt service", () => {
  it("marks a successful print", async () => {
    const { service, updates } = setup();
    await service.printBillReceipt("bill-1");
    expect(updates).toContainEqual([
      "UPDATE bills SET print_status = ? WHERE id = ?",
      "printed",
      "bill-1",
    ]);
  });

  it("marks a failed print and rethrows", async () => {
    const { service, updates } = setup(null, {
      printAsync: async () => {
        throw new Error("cancelled");
      },
    });
    await expect(service.printBillReceipt("bill-1")).rejects.toThrow("cancelled");
    expect(updates).toContainEqual([
      "UPDATE bills SET print_status = ? WHERE id = ?",
      "failed",
      "bill-1",
    ]);
  });

  it("creates and stores a PDF", async () => {
    const { service, updates } = setup();
    await expect(service.createBillPdf("bill-1")).resolves.toBe("file:///new.pdf");
    expect(updates).toContainEqual([
      "UPDATE bills SET pdf_uri = ? WHERE id = ?",
      "file:///new.pdf",
      "bill-1",
    ]);
  });

  it("reuses an existing PDF when sharing", async () => {
    const { service, shared, updates } = setup("file:///existing.pdf");
    await service.shareBillPdf("bill-1");
    expect(shared).toEqual(["file:///existing.pdf"]);
    expect(updates).toEqual([]);
  });

  it("rejects when system sharing is unavailable", async () => {
    const { service, shared } = setup("file:///existing.pdf", {
      isSharingAvailableAsync: async () => false,
    });
    await expect(service.shareBillPdf("bill-1")).rejects.toThrow("Sharing is not available");
    expect(shared).toEqual([]);
  });
});
