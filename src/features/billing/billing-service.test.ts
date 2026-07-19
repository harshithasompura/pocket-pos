import { describe, expect, it, vi } from "vitest";
import type { SQLiteDatabase } from "expo-sqlite";
import { completeBill, formatBillNumber } from "./billing-service";

vi.mock("expo-crypto", () => ({ randomUUID: vi.fn(() => `id-${Math.random()}`) }));

const productRow = { id: "p1", business_id: "shop", name: "Tea", sku: "T1", category: null, selling_price_paise: 3000, stock_quantity: 3, low_stock_threshold: 1, track_inventory: 1, is_active: 1, created_at: "now", updated_at: "now" };

const fakeDatabase = (stock = 3) => {
  const calls: { sql: string; args: unknown[] }[] = [];
  const txn = {
    getFirstAsync: async (sql: string) => sql.includes("app_settings") ? null : { ...productRow, stock_quantity: stock },
    runAsync: async (sql: string, ...args: unknown[]) => { calls.push({ sql, args }); return {} as never; },
  };
  const db = { withExclusiveTransactionAsync: async (callback: (value: typeof txn) => Promise<void>) => callback(txn) } as unknown as SQLiteDatabase;
  return { db, calls };
};

const input = { businessId: "shop", lines: [
  { id: "l1", productId: "p1", name: "Tea", sku: "T1", unitPricePaise: 3000, quantity: 2, affectsInventory: true },
  { id: "l2", productId: null, name: "Delivery", sku: null, unitPricePaise: 500, quantity: 1, affectsInventory: false },
], discount: { type: "none" } as const, taxEnabled: false, taxPercentage: 0, paymentMethod: "cash" as const };

describe("completeBill", () => {
  it("formats sequential bill numbers", () => expect(formatBillNumber(12)).toBe("INV-000012"));

  it("saves snapshots and reduces tracked inventory in one transaction", async () => {
    const { db, calls } = fakeDatabase();
    const bill = await completeBill(db, input);
    expect(bill.billNumber).toBe("INV-000001");
    expect(calls.filter(({ sql }) => sql.includes("INSERT INTO bill_items"))).toHaveLength(2);
    expect(calls.some(({ sql, args }) => sql.includes("UPDATE products") && args[0] === 1)).toBe(true);
    expect(calls.some(({ sql }) => sql.includes("INSERT INTO inventory_movements"))).toBe(true);
  });

  it("rejects insufficient stock before inserting a bill", async () => {
    const { db, calls } = fakeDatabase(1);
    await expect(completeBill(db, input)).rejects.toThrow("Tea only has 1 in stock");
    expect(calls.some(({ sql }) => sql.includes("INSERT INTO bills"))).toBe(false);
  });
});
