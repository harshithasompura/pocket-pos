import { describe, expect, it } from "vitest";

import { mapBill, mapBillItem, mapProduct } from "./repository-mappers";

describe("mapProduct", () => {
  it("maps SQLite integer booleans to domain booleans", () => {
    const product = mapProduct({
      id: "p1",
      business_id: "b1",
      name: "Tea",
      sku: null,
      category: null,
      selling_price_paise: 1000,
      stock_quantity: 2,
      low_stock_threshold: 1,
      track_inventory: 1,
      is_active: 0,
      created_at: "now",
      updated_at: "now",
    });
    expect(product.trackInventory).toBe(true);
    expect(product.isActive).toBe(false);
  });
});

describe("bill mappers", () => {
  it("maps a bill row", () => {
    expect(
      mapBill({
        id: "b1",
        business_id: "shop",
        bill_number: "INV-000001",
        subtotal_paise: 1000,
        discount_paise: 100,
        tax_paise: 45,
        total_paise: 945,
        total_units: 2,
        payment_method: "upi",
        status: "completed",
        print_status: "not_printed",
        pdf_uri: null,
        void_reason: null,
        created_at: "now",
        voided_at: null,
      }),
    ).toMatchObject({
      id: "b1",
      businessId: "shop",
      billNumber: "INV-000001",
      totalPaise: 945,
      paymentMethod: "upi",
      pdfUri: null,
    });
  });

  it("maps inventory flags and nullable item snapshots", () => {
    expect(
      mapBillItem({
        id: "i1",
        bill_id: "b1",
        product_id: null,
        product_name_snapshot: "Delivery",
        sku_snapshot: null,
        quantity: 1,
        unit_price_paise: 500,
        line_total_paise: 500,
        affects_inventory: 0,
        created_at: "now",
      }),
    ).toMatchObject({ productId: null, name: "Delivery", sku: null, affectsInventory: false });
  });
});
