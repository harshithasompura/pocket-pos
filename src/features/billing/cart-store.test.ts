import { describe, expect, it } from "vitest";

import { createCartStore } from "./cart-store-core";

const product = {
  id: "p1",
  businessId: "b1",
  name: "Tea",
  sku: "T1",
  category: null,
  sellingPricePaise: 3000,
  stockQuantity: 10,
  lowStockThreshold: 2,
  trackInventory: true,
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

describe("cart store", () => {
  it("merges repeated products and removes a line when decremented to zero", () => {
    const store = createCartStore();
    store.getState().addProduct(product);
    store.getState().addProduct(product);
    expect(store.getState().lines[0]?.quantity).toBe(2);
    const id = store.getState().lines[0]!.id;
    store.getState().decrement(id);
    store.getState().decrement(id);
    expect(store.getState().lines).toEqual([]);
  });

  it("keeps custom items separate and clears checkout state", () => {
    const store = createCartStore();
    store.getState().addCustomItem({ name: "Delivery", unitPricePaise: 500, quantity: 1 });
    store.getState().addCustomItem({ name: "Delivery", unitPricePaise: 500, quantity: 1 });
    store.getState().setDiscount({ type: "fixed", value: 100 });
    store.getState().setPaymentMethod("card");
    expect(store.getState().lines).toHaveLength(2);
    store.getState().clear();
    expect(store.getState().lines).toEqual([]);
    expect(store.getState().discount).toEqual({ type: "none" });
    expect(store.getState().paymentMethod).toBe("cash");
  });

  it("increments and explicitly removes a line", () => {
    const store = createCartStore();
    store.getState().addProduct(product);
    const id = store.getState().lines[0]!.id;
    store.getState().increment(id);
    expect(store.getState().lines[0]?.quantity).toBe(2);
    store.getState().remove(id);
    expect(store.getState().lines).toEqual([]);
  });
});
