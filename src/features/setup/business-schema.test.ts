import { describe, expect, it } from "vitest";

import { businessSchema } from "./business-schema";

describe("businessSchema", () => {
  it("trims and requires a business name", () => {
    expect(
      businessSchema.safeParse({ name: "   ", currency: "INR", receiptWidth: 58 }).success,
    ).toBe(false);
    expect(
      businessSchema.parse({ name: "  Som Stores  ", currency: "INR", receiptWidth: 58 }).name,
    ).toBe("Som Stores");
  });

  it("accepts only supported receipt widths", () => {
    expect(
      businessSchema.safeParse({ name: "Shop", currency: "INR", receiptWidth: 80 }).success,
    ).toBe(true);
    expect(
      businessSchema.safeParse({ name: "Shop", currency: "INR", receiptWidth: 72 }).success,
    ).toBe(false);
  });
});
