import { describe, expect, it } from "vitest";

import { mapProduct } from "./repository-mappers";

describe("mapProduct", () => {
  it("maps SQLite integer booleans to domain booleans", () => {
    const product = mapProduct({
      id: "p1", business_id: "b1", name: "Tea", sku: null, category: null,
      selling_price_paise: 1000, stock_quantity: 2, low_stock_threshold: 1,
      track_inventory: 1, is_active: 0, created_at: "now", updated_at: "now",
    });
    expect(product.trackInventory).toBe(true);
    expect(product.isActive).toBe(false);
  });
});
