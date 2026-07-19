import type { SQLiteDatabase } from "expo-sqlite";
import type { Bill, BillItem } from "@/src/types/domain";
import { mapBill, mapBillItem, type BillItemRow, type BillRow } from "./repository-mappers";

export const createBillRepository = (db: SQLiteDatabase) => ({
  async list(): Promise<Bill[]> { return (await db.getAllAsync<BillRow>("SELECT * FROM bills ORDER BY created_at DESC")).map(mapBill); },
  async get(id: string): Promise<Bill | null> { const row = await db.getFirstAsync<BillRow>("SELECT * FROM bills WHERE id = ?", id); return row ? mapBill(row) : null; },
  async listItems(billId: string): Promise<BillItem[]> { return (await db.getAllAsync<BillItemRow>("SELECT * FROM bill_items WHERE bill_id = ? ORDER BY created_at, id", billId)).map(mapBillItem); },
  async setPrintStatus(id: string, status: "not_printed" | "printed" | "failed"): Promise<void> { await db.runAsync("UPDATE bills SET print_status = ? WHERE id = ?", status, id); },
  async setPdfUri(id: string, uri: string): Promise<void> { await db.runAsync("UPDATE bills SET pdf_uri = ? WHERE id = ?", uri, id); },
});
