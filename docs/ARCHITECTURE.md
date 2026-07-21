# PocketPOS Architecture

## Design principles

PocketPOS is built around a few core principles:

- Offline-first operation
- SQLite as the single source of truth
- Transactional consistency for billing and inventory
- Immutable historical records
- Layered architecture separating UI, business logic, and persistence

## Boundaries

PocketPOS uses Expo Router for navigation and Expo SQLite as its durable source of truth. Routes compose feature screens; screens call typed repositories for simple reads and writes. Transaction-oriented services (billing, backup, receipts) coordinate multi-step operations across entities.

```text
Expo Router
   ↓
Feature Screens
   ↓
Services (Billing, Backup, Receipts)
   ↓
Repositories
   ↓
SQLite
```

Most data access is encapsulated in repositories. Transaction-oriented services execute coordinated SQL where a single transaction spans multiple entities — for example, a checkout writing a bill, its line items, and stock deductions together.

Pure utilities and Zod schemas are independent of React Native and covered by fast Vitest tests.

## Local database

`src/db/database.ts` opens the stable `pocketpos.db` filename, enables foreign keys and WAL, then applies unapplied migrations in order. Each migration runs transactionally and is recorded in `schema_migrations` only after success.

The schema includes:

- `businesses`
- `products`
- `inventory_movements`
- `bills`
- `bill_items`
- `app_settings`

Checkout executes within a single database transaction. Bill records, line items, stock deductions, and inventory movements are committed atomically, ensuring either the entire checkout succeeds or no changes are persisted.

## Repositories and services

**Repositories**

- `business-repository.ts`: read and save the device's business configuration.
- `product-repository.ts`: list, read, create, edit, enable/disable, and adjust stock.
- `inventory-repository.ts`: read a product's chronological stock audit history.

**Services**

- Billing: validates stock, computes discounts and totals, and persists a checkout (bill, bill items, stock deductions, movement records) in one transaction. Also handles bill voiding with transactional stock restoration.
- Backup: exports and validates versioned JSON backups, and applies restores atomically.
- Receipts: renders 58 mm and 80 mm receipts and generates shareable bill PDFs.

Creating a tracked product with opening stock inserts the product and opening movement inside one transaction. Adjusting stock reads the previous quantity, updates stock, and inserts the matching movement inside one exclusive transaction.

## Money and history

Money is stored as integer paise. UI formatting divides only at display time. Completed bills store product names, SKU values, and prices as snapshots at time of sale, so **later product edits do not change historical receipts or bill history.**

Products are disabled rather than deleted. Stock is never changed without a movement record.

## Printing boundary

PocketPOS renders receipts as HTML for 58 mm and 80 mm paper widths using Expo Print, and can also generate a shareable bill PDF locally. The printing layer sits behind its own module so it can be swapped for direct ESC/POS printer support later without changing billing logic.

## State

SQLite is the single source of truth for persistent data. React state manages view-local UI state, while Zustand manages transient checkout state (the active cart). No business data is duplicated outside SQLite.

## Analytics

Sales analytics (today / 7-day / 30-day) are generated entirely from local SQLite queries and rendered with native charts; no server round-trip is required.

## Backup and restore

Business data can be exported to a versioned JSON backup and shared natively. Restore validates the backup file before applying it, and applies it as a single atomic operation.

## Why this architecture?

The project intentionally separates presentation, business logic, and persistence so that features such as receipt printing, backup & restore, and future printer integrations can evolve independently without affecting billing correctness or historical data integrity.
