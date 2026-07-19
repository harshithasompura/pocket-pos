export type PaymentMethod = "cash" | "upi" | "card" | "other";
export type Discount = { type: "none" } | { type: "fixed"; value: number } | { type: "percentage"; value: number };
export type CartLine = { id: string; productId: string | null; name: string; sku: string | null; unitPricePaise: number; quantity: number; affectsInventory: boolean };
export type BillTotals = { subtotalPaise: number; discountPaise: number; taxPaise: number; totalPaise: number; totalUnits: number };
