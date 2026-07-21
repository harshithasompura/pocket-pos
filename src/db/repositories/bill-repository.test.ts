import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it } from "vitest";

import { createBillRepository } from "./bill-repository";

describe("bill repository output state", () => {
  it("persists print status and PDF URI", async () => {
    const calls: unknown[][] = [];
    const db = {
      runAsync: async (...args: unknown[]) => {
        calls.push(args);
      },
    } as unknown as SQLiteDatabase;
    const repository = createBillRepository(db);

    await repository.setPrintStatus("bill-1", "printed");
    await repository.setPdfUri("bill-1", "file:///receipt.pdf");

    expect(calls).toEqual([
      ["UPDATE bills SET print_status = ? WHERE id = ?", "printed", "bill-1"],
      ["UPDATE bills SET pdf_uri = ? WHERE id = ?", "file:///receipt.pdf", "bill-1"],
    ]);
  });
});
