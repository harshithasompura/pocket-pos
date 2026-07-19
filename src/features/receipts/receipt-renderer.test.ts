import { describe, expect, it } from "vitest";

import type { Bill, BillItem, Business } from "@/src/types/domain";
import { renderReceiptHtml } from "./receipt-renderer";

const business: Business = {
  id: "shop",
  name: "Som & Sons",
  address: "1 <Market> Road",
  phone: "9999999999",
  gstNumber: "GST-123",
  currency: "INR",
  receiptWidth: 58,
  receiptFooter: "Thanks & visit again",
  taxEnabled: true,
  defaultTaxPercentage: 5,
  inventoryTrackingEnabled: true,
  createdAt: "2026-07-19T06:00:00.000Z",
  updatedAt: "2026-07-19T06:00:00.000Z",
};

const bill: Bill = {
  id: "bill-1",
  businessId: "shop",
  billNumber: "INV-000001",
  subtotalPaise: 8500,
  discountPaise: 500,
  taxPaise: 0,
  totalPaise: 8000,
  totalUnits: 3,
  paymentMethod: "upi",
  status: "completed",
  printStatus: "not_printed",
  pdfUri: null,
  voidReason: null,
  createdAt: "2026-07-19T06:00:00.000Z",
  voidedAt: null,
};

const items: BillItem[] = [{
  id: "item-1",
  billId: "bill-1",
  productId: "tea",
  name: "Masala <Tea>",
  sku: "TEA-001",
  quantity: 2,
  unitPricePaise: 3000,
  lineTotalPaise: 6000,
  affectsInventory: true,
  createdAt: bill.createdAt,
}, {
  id: "item-2",
  billId: "bill-1",
  productId: null,
  name: "Paper Bag",
  sku: null,
  quantity: 1,
  unitPricePaise: 2500,
  lineTotalPaise: 2500,
  affectsInventory: false,
  createdAt: bill.createdAt,
}];

describe("renderReceiptHtml", () => {
  it("renders a complete escaped 58 mm receipt", () => {
    const html = renderReceiptHtml({ business, bill, items });

    expect(html).toContain("@page { size: 58mm auto;");
    expect(html).toContain("Som &amp; Sons");
    expect(html).toContain("1 &lt;Market&gt; Road");
    expect(html).toContain("Masala &lt;Tea&gt;");
    expect(html).toContain("INV-000001");
    expect(html).toContain("UPI");
    expect(html).toContain("2 × ₹30.00");
    expect(html).toContain("₹60.00");
    expect(html).toContain("₹80.00");
    expect(html).toContain("3 items");
    expect(html).toContain("Thanks &amp; visit again");
  });

  it("uses the configured 80 mm width", () => {
    expect(renderReceiptHtml({ business: { ...business, receiptWidth: 80 }, bill, items }))
      .toContain("@page { size: 80mm auto;");
  });

  it("omits empty optional business fields", () => {
    const html = renderReceiptHtml({
      business: { ...business, address: null, phone: null, gstNumber: null, receiptFooter: null },
      bill,
      items,
    });

    expect(html).not.toContain("Address:");
    expect(html).not.toContain("Phone:");
    expect(html).not.toContain("GST:");
    expect(html).not.toContain('<div class="receipt-footer');
  });
});
