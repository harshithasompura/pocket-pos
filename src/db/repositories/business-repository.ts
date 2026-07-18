import type { SQLiteDatabase } from "expo-sqlite";

import type { BusinessValues } from "@/src/features/setup/business-schema";
import type { Business } from "@/src/types/domain";
import { createId } from "@/src/utils/id";
import { nowIso } from "@/src/utils/dates";
import { mapBusiness, type BusinessRow } from "./repository-mappers";

export const createBusinessRepository = (db: SQLiteDatabase) => ({
  async get(): Promise<Business | null> {
    const row = await db.getFirstAsync<BusinessRow>("SELECT * FROM businesses LIMIT 1");
    return row ? mapBusiness(row) : null;
  },
  async save(values: BusinessValues): Promise<Business> {
    const existing = await this.get();
    const now = nowIso();
    const id = existing?.id ?? createId();
    await db.runAsync(
      `INSERT INTO businesses (id,name,address,phone,gst_number,currency,receipt_width,receipt_footer,tax_enabled,default_tax_percentage,inventory_tracking_enabled,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name,address=excluded.address,phone=excluded.phone,gst_number=excluded.gst_number,currency=excluded.currency,receipt_width=excluded.receipt_width,receipt_footer=excluded.receipt_footer,tax_enabled=excluded.tax_enabled,default_tax_percentage=excluded.default_tax_percentage,inventory_tracking_enabled=excluded.inventory_tracking_enabled,updated_at=excluded.updated_at`,
      id, values.name, values.address || null, values.phone || null, values.gstNumber || null, values.currency,
      values.receiptWidth, values.receiptFooter || null, values.taxEnabled ? 1 : 0, values.defaultTaxPercentage,
      values.inventoryTrackingEnabled ? 1 : 0, existing?.createdAt ?? now, now,
    );
    return (await this.get())!;
  },
});
