import type { Bill, BillItem, Business, InventoryMovement, Product } from "@/src/types/domain";

export type ProductRow = {
  id: string; business_id: string; name: string; sku: string | null; category: string | null;
  selling_price_paise: number; stock_quantity: number; low_stock_threshold: number;
  track_inventory: number; is_active: number; created_at: string; updated_at: string;
};

export const mapProduct = (row: ProductRow): Product => ({
  id: row.id, businessId: row.business_id, name: row.name, sku: row.sku, category: row.category,
  sellingPricePaise: row.selling_price_paise, stockQuantity: row.stock_quantity,
  lowStockThreshold: row.low_stock_threshold, trackInventory: row.track_inventory === 1,
  isActive: row.is_active === 1, createdAt: row.created_at, updatedAt: row.updated_at,
});

export type BusinessRow = {
  id: string; name: string; address: string | null; phone: string | null; gst_number: string | null;
  currency: string; receipt_width: 58 | 80; receipt_footer: string | null; tax_enabled: number;
  default_tax_percentage: number; inventory_tracking_enabled: number; created_at: string; updated_at: string;
};

export const mapBusiness = (row: BusinessRow): Business => ({
  id: row.id, name: row.name, address: row.address, phone: row.phone, gstNumber: row.gst_number,
  currency: row.currency, receiptWidth: row.receipt_width, receiptFooter: row.receipt_footer,
  taxEnabled: row.tax_enabled === 1, defaultTaxPercentage: row.default_tax_percentage,
  inventoryTrackingEnabled: row.inventory_tracking_enabled === 1, createdAt: row.created_at, updatedAt: row.updated_at,
});

export type MovementRow = {
  id: string; product_id: string; bill_id: string | null; movement_type: InventoryMovement["movementType"];
  quantity_before: number; quantity_change: number; quantity_after: number; note: string | null; created_at: string;
};

export const mapMovement = (row: MovementRow): InventoryMovement => ({
  id: row.id, productId: row.product_id, billId: row.bill_id, movementType: row.movement_type,
  quantityBefore: row.quantity_before, quantityChange: row.quantity_change, quantityAfter: row.quantity_after,
  note: row.note, createdAt: row.created_at,
});

export type BillRow = { id: string; business_id: string; bill_number: string; subtotal_paise: number; discount_paise: number; tax_paise: number; total_paise: number; total_units: number; payment_method: Bill["paymentMethod"]; status: Bill["status"]; print_status: string; pdf_uri: string | null; void_reason: string | null; created_at: string; voided_at: string | null };
export const mapBill = (row: BillRow): Bill => ({ id: row.id, businessId: row.business_id, billNumber: row.bill_number, subtotalPaise: row.subtotal_paise, discountPaise: row.discount_paise, taxPaise: row.tax_paise, totalPaise: row.total_paise, totalUnits: row.total_units, paymentMethod: row.payment_method, status: row.status, printStatus: row.print_status, pdfUri: row.pdf_uri, voidReason: row.void_reason, createdAt: row.created_at, voidedAt: row.voided_at });

export type BillItemRow = { id: string; bill_id: string; product_id: string | null; product_name_snapshot: string; sku_snapshot: string | null; quantity: number; unit_price_paise: number; line_total_paise: number; affects_inventory: number; created_at: string };
export const mapBillItem = (row: BillItemRow): BillItem => ({ id: row.id, billId: row.bill_id, productId: row.product_id, name: row.product_name_snapshot, sku: row.sku_snapshot, quantity: row.quantity, unitPricePaise: row.unit_price_paise, lineTotalPaise: row.line_total_paise, affectsInventory: row.affects_inventory === 1, createdAt: row.created_at });
