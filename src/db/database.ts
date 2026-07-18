import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import { migrations } from "./migrations";

export const DATABASE_NAME = "pocketpos.db";

export const initializeDatabase = async (db: SQLiteDatabase) => {
  await db.execAsync("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);");
  const applied = await db.getAllAsync<{ version: number }>("SELECT version FROM schema_migrations");
  const appliedVersions = new Set(applied.map(({ version }) => version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migration.sql);
      await txn.runAsync(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
        migration.version,
        migration.name,
        new Date().toISOString(),
      );
    });
  }
};

export const openPocketPosDatabase = async () => {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await initializeDatabase(db);
  return db;
};
