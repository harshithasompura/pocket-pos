import { describe, expect, it } from "vitest";

import { formatCurrency } from "./currency";

describe("formatCurrency", () => {
  it("formats integer paise without floating-point drift", () => {
    expect(formatCurrency(12_550, "INR")).toBe("₹125.50");
  });
});
