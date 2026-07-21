import { describe, expect, it } from "vitest";
import type { Product } from "@/src/types/domain";
import { filterProducts } from "./product-filter";

const product = (values: Partial<Product>): Product => ({
  id: "1",
  businessId: "b",
  name: "Masala Tea",
  sku: "TEA-1",
  category: null,
  sellingPricePaise: 2000,
  stockQuantity: 1,
  lowStockThreshold: 2,
  trackInventory: true,
  isActive: true,
  createdAt: "",
  updatedAt: "",
  ...values,
});

describe("filterProducts", () => {
  it("searches names and SKUs case-insensitively", () => {
    const products = [product({}), product({ id: "2", name: "Coffee", sku: "COF" })];
    expect(filterProducts(products, "tea", "all").map(({ id }) => id)).toEqual(["1"]);
    expect(filterProducts(products, "cof", "all").map(({ id }) => id)).toEqual(["2"]);
  });
  it("filters low and inactive products without mutating input", () => {
    const products = [product({}), product({ id: "2", isActive: false, stockQuantity: 8 })];
    expect(filterProducts(products, "", "low").map(({ id }) => id)).toEqual(["1"]);
    expect(filterProducts(products, "", "inactive").map(({ id }) => id)).toEqual(["2"]);
    expect(products).toHaveLength(2);
  });
});
