import type { SQLiteDatabase } from "expo-sqlite";

import type { InventoryMovement } from "@/src/types/domain";
import { mapMovement, type MovementRow } from "./repository-mappers";

export const createInventoryRepository = (db: SQLiteDatabase) => ({
  async listForProduct(productId: string): Promise<InventoryMovement[]> {
    const rows = await db.getAllAsync<MovementRow>("SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY created_at DESC", productId);
    return rows.map(mapMovement);
  },
});
