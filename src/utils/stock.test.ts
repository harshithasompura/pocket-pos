import { describe, expect, it } from "vitest";

import { isLowStock } from "./stock";

describe("isLowStock", () => {
  it("flags tracked stock at or below its threshold", () => {
    expect(isLowStock({ trackInventory: true, stockQuantity: 2, lowStockThreshold: 2 })).toBe(true);
    expect(isLowStock({ trackInventory: true, stockQuantity: 3, lowStockThreshold: 2 })).toBe(false);
  });

  it("ignores untracked products", () => {
    expect(isLowStock({ trackInventory: false, stockQuantity: 0, lowStockThreshold: 2 })).toBe(false);
  });
});
