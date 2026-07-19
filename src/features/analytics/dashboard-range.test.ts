import { describe, expect, it } from "vitest";
import { fillPaymentTotals, fillSalesDays, getDashboardRange } from "./dashboard-range";
describe("dashboard ranges", () => {
  it.each([["today",1],["7d",7],["30d",30]] as const)("builds %s local days", (range,count) => { const value=getDashboardRange(range,new Date(2026,6,19,12)); expect(value.days).toHaveLength(count); expect(new Date(value.startIso).getHours()).toBe(0); expect(new Date(value.endIso).getDate()).toBe(20); });
  it("fills missing days and payment methods", () => { const d=getDashboardRange("7d",new Date(2026,6,19,12)); expect(fillSalesDays(d,[]).every(x=>x.salesPaise===0)).toBe(true); expect(fillPaymentTotals([{method:"upi",salesPaise:5000}])).toEqual([{method:"cash",salesPaise:0},{method:"upi",salesPaise:5000},{method:"card",salesPaise:0},{method:"other",salesPaise:0}]); });
});

