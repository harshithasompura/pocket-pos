import type { BillTotals, CartLine, Discount } from "./billing-types";

export const calculateBillTotals = (lines: CartLine[], discount: Discount, taxEnabled: boolean, taxPercentage: number): BillTotals => {
  const subtotalPaise = lines.reduce((sum, line) => sum + line.unitPricePaise * line.quantity, 0);
  const totalUnits = lines.reduce((sum, line) => sum + line.quantity, 0);
  const requestedDiscount = discount.type === "fixed"
    ? Math.max(0, Math.round(discount.value))
    : discount.type === "percentage"
      ? Math.round(subtotalPaise * Math.min(100, Math.max(0, discount.value)) / 100)
      : 0;
  const discountPaise = Math.min(subtotalPaise, requestedDiscount);
  const taxablePaise = subtotalPaise - discountPaise;
  const taxPaise = taxEnabled ? Math.round(taxablePaise * Math.max(0, taxPercentage) / 100) : 0;
  return { subtotalPaise, discountPaise, taxPaise, totalPaise: taxablePaise + taxPaise, totalUnits };
};
