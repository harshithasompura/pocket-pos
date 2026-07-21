export type BackupRow = Record<string, unknown>;
export type BackupV1 = {
  version: 1;
  exportedAt: string;
  businesses: BackupRow[];
  products: BackupRow[];
  bills: BackupRow[];
  billItems: BackupRow[];
  inventoryMovements: BackupRow[];
  appSettings: BackupRow[];
};
