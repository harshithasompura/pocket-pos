# PocketPOS Architecture

## Boundaries

PocketPOS uses Expo Router for navigation and Expo SQLite as its durable source of truth. Routes compose feature screens; screens call typed repositories; only repositories execute SQL.

```text
route → feature screen → repository → SQLite
                         ↓
                 transaction + audit log
```

Pure utilities and Zod schemas are independent of React Native and covered by fast Vitest tests.

## Local database

`src/db/database.ts` opens the stable `pocketpos.db` filename, enables foreign keys and WAL, then applies unapplied migrations in order. Each migration runs transactionally and is recorded in `schema_migrations` only after success.

The foundation schema includes:

- `businesses`
- `products`
- `inventory_movements`
- `bills`
- `bill_items`
- `app_settings`

Bill tables are created now to establish safe migration and snapshot conventions, but billing behavior is not implemented in this phase.

## Repository responsibilities

- `business-repository.ts`: read and save the device’s business configuration.
- `product-repository.ts`: list, read, create, edit, enable/disable, and adjust stock.
- `inventory-repository.ts`: read a product’s chronological stock audit history.

Creating a tracked product with opening stock inserts the product and opening movement inside one transaction. Adjusting stock reads the previous quantity, updates stock, and inserts the matching movement inside one exclusive transaction.

## Money and history

Money is stored as integer paise. UI formatting divides only at display time. Completed bills will store product names, SKU values, and prices as snapshots so later product edits cannot change historical receipts.

Products are disabled rather than deleted. Stock is never changed without a movement record.

## Printing boundary

Future receipt printing will live behind a `ReceiptPrinter` interface. Bill persistence and inventory changes will complete before printing begins, ensuring printer failure never removes a valid bill.

## State

SQLite owns persistent state. React component state handles forms and filters. Zustand is installed for a future temporary cart; it is not used as a second persistent database.
