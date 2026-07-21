import type { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";
import type { BackupRow, BackupV1 } from "./backup-types";
import { validateBackup } from "./backup-validation";
const columns = {
  businesses: [
    "id",
    "name",
    "address",
    "phone",
    "gst_number",
    "currency",
    "receipt_width",
    "receipt_footer",
    "tax_enabled",
    "default_tax_percentage",
    "inventory_tracking_enabled",
    "created_at",
    "updated_at",
  ],
  products: [
    "id",
    "business_id",
    "name",
    "sku",
    "category",
    "selling_price_paise",
    "stock_quantity",
    "low_stock_threshold",
    "track_inventory",
    "is_active",
    "created_at",
    "updated_at",
  ],
  bills: [
    "id",
    "business_id",
    "bill_number",
    "subtotal_paise",
    "discount_paise",
    "tax_paise",
    "total_paise",
    "total_units",
    "payment_method",
    "status",
    "print_status",
    "pdf_uri",
    "void_reason",
    "created_at",
    "voided_at",
  ],
  bill_items: [
    "id",
    "bill_id",
    "product_id",
    "product_name_snapshot",
    "sku_snapshot",
    "quantity",
    "unit_price_paise",
    "line_total_paise",
    "affects_inventory",
    "created_at",
  ],
  inventory_movements: [
    "id",
    "product_id",
    "bill_id",
    "movement_type",
    "quantity_before",
    "quantity_change",
    "quantity_after",
    "note",
    "created_at",
  ],
  app_settings: ["key", "value"],
} as const;
export const createBackup = async (db: SQLiteDatabase): Promise<BackupV1> => {
  const [businesses, products, bills, billItems, inventoryMovements, appSettings] =
    await Promise.all([
      db.getAllAsync<BackupRow>("SELECT * FROM businesses"),
      db.getAllAsync<BackupRow>("SELECT * FROM products"),
      db.getAllAsync<BackupRow>("SELECT * FROM bills"),
      db.getAllAsync<BackupRow>("SELECT * FROM bill_items"),
      db.getAllAsync<BackupRow>("SELECT * FROM inventory_movements"),
      db.getAllAsync<BackupRow>("SELECT * FROM app_settings"),
    ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    businesses,
    products,
    bills,
    billItems,
    inventoryMovements,
    appSettings,
  };
};
const bind = (value: unknown): SQLiteBindValue => {
  if (value === undefined || value === null) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Uint8Array
  )
    return value;
  throw new Error("Backup row contains an unsupported value");
};
const insert = async (txn: SQLiteDatabase, table: keyof typeof columns, row: BackupRow) => {
  const cols = columns[table];
  await txn.runAsync(
    `INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
    ...cols.map((c) => bind(row[c])),
  );
};
export const restoreBackup = async (db: SQLiteDatabase, input: BackupV1): Promise<void> => {
  const b = validateBackup(input);
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const table of [
      "inventory_movements",
      "bill_items",
      "bills",
      "products",
      "app_settings",
      "businesses",
    ] as const)
      await txn.runAsync(`DELETE FROM ${table}`);
    for (const row of b.businesses) await insert(txn, "businesses", row);
    for (const row of b.products) await insert(txn, "products", row);
    for (const row of b.bills) await insert(txn, "bills", row);
    for (const row of b.billItems) await insert(txn, "bill_items", row);
    for (const row of b.inventoryMovements) await insert(txn, "inventory_movements", row);
    for (const row of b.appSettings) await insert(txn, "app_settings", row);
    const violations = await txn.getAllAsync("PRAGMA foreign_key_check");
    if (violations.length) throw new Error("Backup contains broken database references");
  });
};
