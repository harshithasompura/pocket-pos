import { createStore } from "zustand/vanilla";

import type { Product } from "@/src/types/domain";
import type { CartLine, Discount, PaymentMethod } from "./billing-types";

type CustomItemInput = { name: string; unitPricePaise: number; quantity: number };
export type CartState = {
  lines: CartLine[]; discount: Discount; paymentMethod: PaymentMethod;
  addProduct: (product: Product) => void; addCustomItem: (input: CustomItemInput) => void;
  increment: (id: string) => void; decrement: (id: string) => void; remove: (id: string) => void;
  setDiscount: (discount: Discount) => void; setPaymentMethod: (paymentMethod: PaymentMethod) => void; clear: () => void;
};

const initial = { lines: [] as CartLine[], discount: { type: "none" } as Discount, paymentMethod: "cash" as PaymentMethod };

export const createCartState = (createLineId: () => string) => (set: (update: Partial<CartState> | ((state: CartState) => Partial<CartState>)) => void): CartState => ({
  ...initial,
  addProduct: (product) => set((state) => {
    const existing = state.lines.find((line) => line.productId === product.id);
    return existing ? { lines: state.lines.map((line) => line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line) } : { lines: [...state.lines, { id: `product:${product.id}`, productId: product.id, name: product.name, sku: product.sku, unitPricePaise: product.sellingPricePaise, quantity: 1, affectsInventory: product.trackInventory }] };
  }),
  addCustomItem: (input) => set((state) => ({ lines: [...state.lines, { id: createLineId(), productId: null, name: input.name, sku: null, unitPricePaise: input.unitPricePaise, quantity: input.quantity, affectsInventory: false }] })),
  increment: (id) => set((state) => ({ lines: state.lines.map((line) => line.id === id ? { ...line, quantity: line.quantity + 1 } : line) })),
  decrement: (id) => set((state) => ({ lines: state.lines.flatMap((line) => line.id !== id ? [line] : line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : []) })),
  remove: (id) => set((state) => ({ lines: state.lines.filter((line) => line.id !== id) })),
  setDiscount: (discount) => set({ discount }), setPaymentMethod: (paymentMethod) => set({ paymentMethod }), clear: () => set(initial),
});

export const createCartStore = () => { let nextId = 0; return createStore<CartState>(createCartState(() => `custom:${++nextId}`)); };
