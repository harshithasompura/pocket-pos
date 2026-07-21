import type { SQLiteDatabase } from "expo-sqlite";
import { mapBill, type BillRow, type ProductRow } from "@/src/db/repositories/repository-mappers";
import type { Bill } from "@/src/types/domain";
import { createId } from "@/src/utils/id";
import { nowIso } from "@/src/utils/dates";
type Input = { billId: string; reason: string };
type VoidItem = { product_id: string | null; quantity: number; affects_inventory: number };
export const voidBill = async (db: SQLiteDatabase, input: Input): Promise<Bill> => {
  const reason = input.reason.trim();
  if (reason.length < 3) throw new Error("Void reason must be at least 3 characters");
  const voidedAt = nowIso();
  let result: Bill | null = null;
  await db.withExclusiveTransactionAsync(async (txn) => {
    const row = await txn.getFirstAsync<BillRow>("SELECT * FROM bills WHERE id = ?", input.billId);
    if (!row) throw new Error("Bill was not found");
    if (row.status === "void") throw new Error("Bill is already voided");
    const items = await txn.getAllAsync<VoidItem>(
      "SELECT product_id,quantity,affects_inventory FROM bill_items WHERE bill_id = ?",
      input.billId,
    );
    const required = new Map<string, number>();
    for (const item of items)
      if (item.product_id && item.affects_inventory === 1) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0)
          throw new Error("Bill contains an invalid tracked quantity");
        required.set(item.product_id, (required.get(item.product_id) ?? 0) + item.quantity);
      }
    for (const [productId, quantity] of required) {
      const product = await txn.getFirstAsync<ProductRow>(
        "SELECT * FROM products WHERE id = ?",
        productId,
      );
      if (!product) throw new Error("Product required for stock restoration was not found");
      const before = product.stock_quantity,
        after = before + quantity;
      await txn.runAsync(
        "UPDATE products SET stock_quantity = ?, updated_at = ? WHERE id = ?",
        after,
        voidedAt,
        productId,
      );
      await txn.runAsync(
        "INSERT INTO inventory_movements (id,product_id,bill_id,movement_type,quantity_before,quantity_change,quantity_after,note,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        createId(),
        productId,
        row.id,
        "bill_void",
        before,
        quantity,
        after,
        `Voided ${row.bill_number}: ${reason}`,
        voidedAt,
      );
    }
    await txn.runAsync(
      "UPDATE bills SET status = 'void', void_reason = ?, voided_at = ? WHERE id = ? AND status = 'completed'",
      reason,
      voidedAt,
      row.id,
    );
    result = { ...mapBill(row), status: "void", voidReason: reason, voidedAt };
  });
  if (!result) throw new Error("Bill could not be voided");
  return result;
};
