# PocketPOS Backup and Restore Design

## Scope

PocketPOS will export and restore one complete, versioned JSON backup entirely offline. The backup includes businesses, products, bills, bill items, inventory movements, and app settings. CSV reports and raw SQLite-file copying are excluded from this client milestone.

## Format

The root object contains `version: 1`, `exportedAt`, and arrays named after each durable table. Rows use database column names and preserve IDs, integer paise, timestamps, statuses, and foreign keys exactly. The filename is `pocketpos-backup-YYYY-MM-DD.json`.

## Export

A pure builder reads every durable table in dependency-safe order and returns the envelope. The native service serializes it with readable indentation, writes it under the app document directory using Expo FileSystem legacy, then opens Expo Sharing with `application/json`. If sharing is unavailable, the durable local URI remains available and the UI reports it.

## Restore Validation

Restore parses the chosen JSON before opening a transaction. It requires version 1, arrays for every table, exactly one business, unique IDs, valid foreign-key references, non-negative monetary values, integer quantities, recognized bill and movement statuses, and valid timestamps. Unknown root fields are ignored; missing required fields or future versions are rejected.

The system document picker accepts JSON and copies the selected file to cache so FileSystem can read it immediately.

## Atomic Restore

After destructive confirmation, one exclusive transaction disables foreign-key checks only if supported by the transaction connection, deletes data from child to parent, then inserts parent to child: businesses, products, bills, bill items, inventory movements, app settings. Foreign keys are checked before success. Any parse, validation, SQL, or integrity failure leaves current data unchanged.

Restore never merges data. It replaces the local dataset, which keeps IDs, bill numbers, stock, and audit history coherent.

## UI

Settings gains a **Data backup** section with Export & share backup and Restore backup actions. Restore first picks and validates the file, shows its export date and record counts, then requires a destructive confirmation. Buttons share one busy state. Success prompts the user to restart PocketPOS so all screens reload from restored data.

## Testing and Client Acceptance

Pure validation tests cover valid backups, future versions, duplicate IDs, broken references, malformed values, and JSON parse failures. Service tests verify table reads, deletion/insertion order, and that validation happens before the transaction. Full checks include tests, TypeScript, lint, Android export, Expo Doctor, and simulator export/restore using a disposable dataset.

Client acceptance requires a shared JSON file that restores business settings, products, stock, bills, void states, movements, and bill sequence exactly after app restart.

