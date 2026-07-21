import { describe, expect, it } from "vitest";

import type { CartLine } from "./billing-types";
import { calculateBillTotals } from "./billing-calculations";

const line = (values: Partial<CartLine> = {}): CartLine => ({
  id: "line-1",
  productId: "product-1",
  name: "Tea",
  sku: "TEA-1",
  unitPricePaise: 3000,
  quantity: 2,
  affectsInventory: true,
  ...values,
});

describe("calculateBillTotals", () => {
  it("returns zero totals for an empty cart", () => {
    expect(calculateBillTotals([], { type: "none" }, false, 0)).toEqual({
      subtotalPaise: 0,
      discountPaise: 0,
      taxPaise: 0,
      totalPaise: 0,
      totalUnits: 0,
    });
  });

  it("multiplies quantities and sums units", () => {
    expect(
      calculateBillTotals(
        [line(), line({ id: "line-2", unitPricePaise: 500, quantity: 3 })],
        { type: "none" },
        false,
        0,
      ),
    ).toEqual({
      subtotalPaise: 7500,
      discountPaise: 0,
      taxPaise: 0,
      totalPaise: 7500,
      totalUnits: 5,
    });
  });

  it("caps a fixed discount at the subtotal", () => {
    expect(
      calculateBillTotals([line()], { type: "fixed", value: 10000 }, false, 0).discountPaise,
    ).toBe(6000);
  });

  it("rounds percentage discounts and taxes the discounted subtotal", () => {
    expect(
      calculateBillTotals(
        [line({ unitPricePaise: 999, quantity: 1 })],
        { type: "percentage", value: 10 },
        true,
        5,
      ),
    ).toEqual({
      subtotalPaise: 999,
      discountPaise: 100,
      taxPaise: 45,
      totalPaise: 944,
      totalUnits: 1,
    });
  });

  it("does not calculate tax when tax is disabled", () => {
    expect(calculateBillTotals([line()], { type: "none" }, false, 18).taxPaise).toBe(0);
  });
});
