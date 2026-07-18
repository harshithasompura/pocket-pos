import { describe, expect, it } from "vitest";

import { productSchema, stockAdjustmentSchema } from "./product-schema";

describe("productSchema", () => {
  it("requires non-negative integer paise", () => {
    expect(productSchema.safeParse({ name: "Tea", sellingPricePaise: 1250, stockQuantity: 2, trackInventory: true, isActive: true }).success).toBe(true);
    expect(productSchema.safeParse({ name: "Tea", sellingPricePaise: 12.5, stockQuantity: 2, trackInventory: true, isActive: true }).success).toBe(false);
  });
});

describe("stockAdjustmentSchema", () => {
  it("requires a non-zero integer quantity change", () => {
    expect(stockAdjustmentSchema.safeParse({ movementType: "stock_added", quantityChange: 3 }).success).toBe(true);
    expect(stockAdjustmentSchema.safeParse({ movementType: "stock_added", quantityChange: 0 }).success).toBe(false);
  });
});
