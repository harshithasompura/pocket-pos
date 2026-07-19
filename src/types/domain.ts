export type ReceiptWidth = 58 | 80;
export type MovementType = "opening_stock" | "stock_added" | "manual_correction" | "sale" | "bill_void" | "damaged" | "other";

export type Business = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  gstNumber: string | null;
  currency: string;
  receiptWidth: ReceiptWidth;
  receiptFooter: string | null;
  taxEnabled: boolean;
  defaultTaxPercentage: number;
  inventoryTrackingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  businessId: string;
  name: string;
  sku: string | null;
  category: string | null;
  sellingPricePaise: number;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  billId: string | null;
  movementType: MovementType;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  note: string | null;
  createdAt: string;
};

export type PaymentMethod = "cash" | "upi" | "card" | "other";
export type BillStatus = "completed" | "void";
export type Bill = { id: string; businessId: string; billNumber: string; subtotalPaise: number; discountPaise: number; taxPaise: number; totalPaise: number; totalUnits: number; paymentMethod: PaymentMethod; status: BillStatus; printStatus: string; pdfUri: string | null; voidReason: string | null; createdAt: string; voidedAt: string | null };
export type BillItem = { id: string; billId: string; productId: string | null; name: string; sku: string | null; quantity: number; unitPricePaise: number; lineTotalPaise: number; affectsInventory: boolean; createdAt: string };
