# PocketPOS Backup and Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export, share, validate, and atomically restore a complete versioned PocketPOS JSON backup.

**Architecture:** Pure backup validation protects the database boundary. A database service reads and replaces durable tables in dependency order, while a native adapter owns FileSystem, DocumentPicker, and Sharing. Settings coordinates explicit destructive confirmation.

**Tech Stack:** Expo SDK 57, TypeScript, Expo SQLite, Expo FileSystem legacy, Expo DocumentPicker, Expo Sharing, Vitest.

## Global Constraints

- Work directly on `main`.
- Backup version is exactly 1.
- Include businesses, products, bills, bill items, inventory movements, and app settings.
- Validate before opening the restore transaction.
- Restore replaces rather than merges.
- Any restore failure leaves current data unchanged.
- Use SDK-compatible packages installed by `pnpm expo install`.
- Every commit uses a lowercase Conventional Commit subject and Codex co-author trailer.

---

### Task 1: Backup Envelope and Validation

**Files:** Create `src/features/backup/backup-types.ts`, `backup-validation.ts`, and `backup-validation.test.ts`.

**Interfaces:** Produce `BackupV1`, `parseBackupJson(text): BackupV1`, and `validateBackup(value): BackupV1`.

- [ ] Write failing tests for a valid envelope, invalid JSON, future version, missing arrays, duplicate IDs, broken business/product/bill references, invalid quantities, and invalid bill status.
- [ ] Run `pnpm vitest run src/features/backup/backup-validation.test.ts`; expect missing module failure.
- [ ] Implement structural guards, unique-ID checks, numeric/integer checks, timestamp checks, recognized enum checks, and foreign-key checks. Return the original typed envelope only after every check passes.
- [ ] Run the focused test and `pnpm test && pnpm typecheck`; expect all PASS.
- [ ] Commit `feat: add backup validation`.

### Task 2: Database and Native Backup Services

**Files:** Create `src/features/backup/backup-service.ts`, `backup-service.test.ts`, and `native-backup-service.ts`; modify `package.json`, `pnpm-lock.yaml`, and `app.json`.

**Interfaces:** Produce `createBackup(db): Promise<BackupV1>`, `restoreBackup(db, backup): Promise<void>`, `exportAndShareBackup(db): Promise<string>`, and `pickAndReadBackup(): Promise<BackupV1 | null>`.

- [ ] Install `expo-file-system` and `expo-document-picker` with `pnpm expo install`.
- [ ] Write failing service tests using a typed SQLite fake. Assert all table reads, child-to-parent deletes, parent-to-child inserts, validation before transaction, and correct row argument order.
- [ ] Implement export reads with `Promise.all`; include `version: 1` and current ISO timestamp.
- [ ] Implement restore with one exclusive transaction: delete movements, items, bills, products, settings, businesses; insert businesses, products, bills, items, movements, settings. Run `PRAGMA foreign_key_check` and reject any rows.
- [ ] Implement native file export using `FileSystem.documentDirectory`, `writeAsStringAsync`, and Sharing; implement import using DocumentPicker `copyToCacheDirectory: true` and `readAsStringAsync`.
- [ ] Run focused/full tests, typecheck, lint, and Android export; expect success.
- [ ] Commit `feat: add portable data backups`.

### Task 3: Settings UI, Simulator Restore, and Docs

**Files:** Modify `app/(tabs)/settings.tsx`, `README.md`, and `docs/APK_BUILD.md`; create `docs/BACKUP_RESTORE.md`.

- [ ] Add a Data backup card with Export & share backup and Restore backup buttons, one busy state, native error alerts, and no development-only gating.
- [ ] After file selection and validation, show export date and record counts in the destructive confirmation. On confirmation call `restoreBackup`; on success tell the user to restart PocketPOS.
- [ ] In the simulator export the current dataset, mutate disposable data, restore the file, restart, and verify business, stock, completed/void bills, movements, and bill sequence.
- [ ] Document backup frequency, secure storage, restore replacement behavior, and client transfer steps.
- [ ] Run `git diff --check && pnpm test && pnpm typecheck && pnpm lint && pnpm export && pnpm dlx expo-doctor`.
- [ ] Commit `docs: document backup restore`.

