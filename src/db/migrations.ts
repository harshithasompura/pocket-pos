export type Migration = { version: number; name: string; sql: string };

export const migrations: Migration[] = [{
  version: 1,
  name: "foundation",
  sql: `
    CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT, phone TEXT, gst_number TEXT,
      currency TEXT NOT NULL DEFAULT 'INR', receipt_width INTEGER NOT NULL DEFAULT 58,
      receipt_footer TEXT, tax_enabled INTEGER NOT NULL DEFAULT 0,
      default_tax_percentage REAL NOT NULL DEFAULT 0,
      inventory_tracking_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), name TEXT NOT NULL,
      sku TEXT, category TEXT, selling_price_paise INTEGER NOT NULL CHECK(selling_price_paise >= 0),
      stock_quantity INTEGER NOT NULL DEFAULT 0, low_stock_threshold INTEGER NOT NULL DEFAULT 0,
      track_inventory INTEGER NOT NULL DEFAULT 1, is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), bill_number TEXT NOT NULL UNIQUE,
      subtotal_paise INTEGER NOT NULL, discount_paise INTEGER NOT NULL DEFAULT 0, tax_paise INTEGER NOT NULL DEFAULT 0,
      total_paise INTEGER NOT NULL, total_units INTEGER NOT NULL, payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed', print_status TEXT NOT NULL DEFAULT 'not_printed', pdf_uri TEXT,
      void_reason TEXT, created_at TEXT NOT NULL, voided_at TEXT
    );
    CREATE TABLE IF NOT EXISTS bill_items (
      id TEXT PRIMARY KEY, bill_id TEXT NOT NULL REFERENCES bills(id), product_id TEXT REFERENCES products(id),
      product_name_snapshot TEXT NOT NULL, sku_snapshot TEXT, quantity INTEGER NOT NULL,
      unit_price_paise INTEGER NOT NULL, line_total_paise INTEGER NOT NULL,
      affects_inventory INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id), bill_id TEXT REFERENCES bills(id),
      movement_type TEXT NOT NULL, quantity_before INTEGER NOT NULL, quantity_change INTEGER NOT NULL,
      quantity_after INTEGER NOT NULL, note TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id, created_at DESC);
  `,
}];
