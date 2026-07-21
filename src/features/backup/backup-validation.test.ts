import { describe, expect, it } from "vitest";
import { parseBackupJson, validateBackup } from "./backup-validation";
const valid = {
  version: 1,
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
describe("backup validation", () => {
  it("accepts a coherent v1 backup", () => expect(validateBackup(valid).version).toBe(1));
  it("rejects malformed input", () => {
    expect(() => parseBackupJson("{")).toThrow("valid JSON");
    expect(() => validateBackup({ ...valid, version: 2 })).toThrow("version");
    expect(() =>
      validateBackup({ ...valid, products: [valid.products[0], valid.products[0]] }),
    ).toThrow("duplicate");
    expect(() =>
      validateBackup({ ...valid, billItems: [{ ...valid.billItems[0], bill_id: "missing" }] }),
    ).toThrow("bill");
  });
});
