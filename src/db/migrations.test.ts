import { describe, expect, it } from "vitest";

import { migrations } from "./migrations";

describe("migrations", () => {
  it("are strictly ordered and contain the foundation tables", () => {
    expect(migrations.map(({ version }) => version)).toEqual([1]);
    const sql = migrations.map(({ sql }) => sql).join(" ");
    for (const table of ["schema_migrations", "businesses", "products", "inventory_movements", "bills", "bill_items", "app_settings"]) {
      expect(sql).toContain(table);
    }
  });
});
