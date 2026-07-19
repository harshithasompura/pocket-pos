import type { SQLiteDatabase } from "expo-sqlite";

import type { Bill } from "@/src/types/domain";
import { nowIso } from "@/src/utils/dates";
import { createId } from "@/src/utils/id";
import type { ProductRow } from "@/src/db/repositories/repository-mappers";
import { calculateBillTotals } from "./billing-calculations";
import type { CartLine, Discount, PaymentMethod } from "./billing-types";

export type CompleteBillInput = { businessId: string; lines: CartLine[]; discount: Discount; taxEnabled: boolean; taxPercentage: number; paymentMethod: PaymentMethod };
export const formatBillNumber = (sequence: number) => `INV-${String(sequence).padStart(6, "0")}`;

export const completeBill = async (db: SQLiteDatabase, input: CompleteBillInput): Promise<Bill> => {
  if (input.lines.length === 0) throw new Error("Add at least one item");
  const totals = calculateBillTotals(input.lines, input.discount, input.taxEnabled, input.taxPercentage);
  const billId = createId(); const createdAt = nowIso(); let billNumber = "";

  await db.withExclusiveTransactionAsync(async (txn) => {
    const required = new Map<string, number>();
    for (const line of input.lines) if (line.productId && line.affectsInventory) required.set(line.productId, (required.get(line.productId) ?? 0) + line.quantity);
    const products = new Map<string, ProductRow>();
    for (const [productId, quantity] of required) {
      const product = await txn.getFirstAsync<ProductRow>("SELECT * FROM products WHERE id = ?", productId);
      if (!product || product.is_active !== 1) throw new Error(`${input.lines.find((line) => line.productId === productId)?.name ?? "Product"} is unavailable`);
      if (product.stock_quantity < quantity) throw new Error(`${product.name} only has ${product.stock_quantity} in stock`);
      products.set(productId, product);
    }

    const sequenceRow = await txn.getFirstAsync<{ value: string }>("SELECT value FROM app_settings WHERE key = ?", "next_bill_sequence");
    const sequence = Math.max(1, Number(sequenceRow?.value ?? 1)); billNumber = formatBillNumber(sequence);
    await txn.runAsync("INSERT INTO app_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", "next_bill_sequence", String(sequence + 1));
    await txn.runAsync(`INSERT INTO bills (id,business_id,bill_number,subtotal_paise,discount_paise,tax_paise,total_paise,total_units,payment_method,status,print_status,pdf_uri,void_reason,created_at,voided_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, billId, input.businessId, billNumber, totals.subtotalPaise, totals.discountPaise, totals.taxPaise, totals.totalPaise, totals.totalUnits, input.paymentMethod, "completed", "not_printed", null, null, createdAt, null);

    for (const line of input.lines) {
      await txn.runAsync(`INSERT INTO bill_items (id,bill_id,product_id,product_name_snapshot,sku_snapshot,quantity,unit_price_paise,line_total_paise,affects_inventory,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`, createId(), billId, line.productId, line.name, line.sku, line.quantity, line.unitPricePaise, line.unitPricePaise * line.quantity, line.affectsInventory ? 1 : 0, createdAt);
      if (line.productId && line.affectsInventory) {
        const product = products.get(line.productId)!; const before = product.stock_quantity; const after = before - line.quantity;
        await txn.runAsync("UPDATE products SET stock_quantity=?,updated_at=? WHERE id=?", after, createdAt, line.productId);
        await txn.runAsync(`INSERT INTO inventory_movements (id,product_id,bill_id,movement_type,quantity_before,quantity_change,quantity_after,note,created_at) VALUES (?,?,?,?,?,?,?,?,?)`, createId(), line.productId, billId, "sale", before, -line.quantity, after, billNumber, createdAt);
      }
    }
  });

  return { id: billId, businessId: input.businessId, billNumber, ...totals, paymentMethod: input.paymentMethod, status: "completed", printStatus: "not_printed", pdfUri: null, voidReason: null, createdAt, voidedAt: null };
};
