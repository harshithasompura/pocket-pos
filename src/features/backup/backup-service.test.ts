import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";
import { createBackup, restoreBackup } from "./backup-service";
const backup = {
  version: 1 as const,
  exportedAt: "2026-07-19T00:00:00.000Z",
  businesses: [{ id: "biz" }],
  products: [{ id: "p", business_id: "biz", stock_quantity: 1 }],
  bills: [{ id: "b", business_id: "biz", status: "completed" }],
  billItems: [{ id: "i", bill_id: "b", product_id: "p", quantity: 1 }],
  inventoryMovements: [
    {
      id: "m",
      product_id: "p",
      bill_id: "b",
      movement_type: "sale",
      quantity_before: 2,
      quantity_change: -1,
      quantity_after: 1,
    },
  ],
  appSettings: [{ key: "next_bill_sequence", value: "2" }],
};
describe("backup service", () => {
  it("exports every durable table", async () => {
    const seen: string[] = [];
    const db = {
      getAllAsync: async (sql: string) => {
        seen.push(sql);
        return [];
      },
    } as unknown as SQLiteDatabase;
    const value = await createBackup(db);
    expect(value.version).toBe(1);
    expect(seen).toHaveLength(6);
  });
  it("restores in dependency-safe order", async () => {
    const calls: string[] = [];
    const txn = {
      runAsync: async (sql: string) => {
        calls.push(sql);
      },
      getAllAsync: async () => [],
    };
    const db = {
      withExclusiveTransactionAsync: async (cb: (x: typeof txn) => Promise<void>) => cb(txn),
    } as unknown as SQLiteDatabase;
    await restoreBackup(db, backup);
    expect(calls.slice(0, 6).map((x) => x.match(/DELETE FROM (\w+)/)?.[1])).toEqual([
      "inventory_movements",
      "bill_items",
      "bills",
      "products",
      "app_settings",
      "businesses",
    ]);
    expect(calls.some((x) => x.startsWith("INSERT INTO businesses"))).toBe(true);
  });
});
