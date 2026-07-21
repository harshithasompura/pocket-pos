import type { SQLiteDatabase } from "expo-sqlite";

import type { ProductValues, StockAdjustmentValues } from "@/src/features/inventory/product-schema";
import type { Product } from "@/src/types/domain";
import { nowIso } from "@/src/utils/dates";
import { createId } from "@/src/utils/id";
import { mapProduct, type ProductRow } from "./repository-mappers";

export const createProductRepository = (db: SQLiteDatabase) => ({
  async list(): Promise<Product[]> {
    return (
      await db.getAllAsync<ProductRow>(
        "SELECT * FROM products ORDER BY is_active DESC, name COLLATE NOCASE",
      )
    ).map(mapProduct);
  },
  async get(id: string): Promise<Product | null> {
    const row = await db.getFirstAsync<ProductRow>("SELECT * FROM products WHERE id = ?", id);
    return row ? mapProduct(row) : null;
  },
  async create(businessId: string, values: ProductValues): Promise<Product> {
    const id = createId();
    const now = nowIso();
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(
        `INSERT INTO products (id,business_id,name,sku,category,selling_price_paise,stock_quantity,low_stock_threshold,track_inventory,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        id,
        businessId,
        values.name,
        values.sku || null,
        values.category || null,
        values.sellingPricePaise,
        values.stockQuantity,
        values.lowStockThreshold,
        values.trackInventory ? 1 : 0,
        values.isActive ? 1 : 0,
        now,
        now,
      );
      if (values.trackInventory && values.stockQuantity !== 0) {
        await txn.runAsync(
          `INSERT INTO inventory_movements (id,product_id,movement_type,quantity_before,quantity_change,quantity_after,note,created_at) VALUES (?,?,?,?,?,?,?,?)`,
          createId(),
          id,
          "opening_stock",
          0,
          values.stockQuantity,
          values.stockQuantity,
          "Opening stock",
          now,
        );
      }
    });
    return (await this.get(id))!;
  },
  async update(id: string, values: ProductValues): Promise<Product> {
    await db.runAsync(
      `UPDATE products SET name=?,sku=?,category=?,selling_price_paise=?,low_stock_threshold=?,track_inventory=?,is_active=?,updated_at=? WHERE id=?`,
      values.name,
      values.sku || null,
      values.category || null,
      values.sellingPricePaise,
      values.lowStockThreshold,
      values.trackInventory ? 1 : 0,
      values.isActive ? 1 : 0,
      nowIso(),
      id,
    );
    return (await this.get(id))!;
  },
  async setActive(id: string, isActive: boolean) {
    await db.runAsync(
      "UPDATE products SET is_active=?,updated_at=? WHERE id=?",
      isActive ? 1 : 0,
      nowIso(),
      id,
    );
  },
  async adjustStock(id: string, values: StockAdjustmentValues): Promise<Product> {
    await db.withExclusiveTransactionAsync(async (txn) => {
      const row = await txn.getFirstAsync<ProductRow>("SELECT * FROM products WHERE id = ?", id);
      if (!row) throw new Error("Product not found");
      const after = row.stock_quantity + values.quantityChange;
      const now = nowIso();
      await txn.runAsync(
        "UPDATE products SET stock_quantity=?,updated_at=? WHERE id=?",
        after,
        now,
        id,
      );
      await txn.runAsync(
        `INSERT INTO inventory_movements (id,product_id,movement_type,quantity_before,quantity_change,quantity_after,note,created_at) VALUES (?,?,?,?,?,?,?,?)`,
        createId(),
        id,
        values.movementType,
        row.stock_quantity,
        values.quantityChange,
        after,
        values.note || null,
        now,
      );
    });
    return (await this.get(id))!;
  },
});
