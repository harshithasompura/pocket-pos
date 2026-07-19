# PocketPOS Billing Core Design

## Goal

Turn the Sell and Bills tabs into a complete offline billing workflow. Staff can build a cart, calculate discounts and configured tax, select a payment method, save the bill atomically, reduce tracked stock, and reopen the saved bill from history.

Printing, receipt PDF generation, sharing, reprinting, voiding, and analytics remain separate follow-up phases. A saved bill never depends on those later operations.

## User flow

### Sell

The Sell screen loads active products from SQLite and supports name/SKU search. Tapping a product adds it to the current cart or increases its quantity. Each cart row shows the item name, unit price, quantity controls, line total, and removal action.

Staff can add a custom item with a required name, positive price, and positive integer quantity. Custom items have no product ID and never affect inventory.

The cart supports either a fixed rupee discount or a percentage discount. Tax uses the business's configured tax toggle and default percentage. Payment methods are Cash, UPI, Card, and Other. Completing a bill requires at least one item and sufficient stock for every tracked product.

The primary action saves the bill without printing. After completion, PocketPOS clears the cart and opens the saved bill detail screen.

### Bills

The Bills tab lists completed bills newest first with bill number, date/time, total units, total amount, payment method, and status. Search matches bill number. Opening a row shows item snapshots, subtotal, discount, tax, grand total, payment method, and saved timestamp.

## Cart state and calculations

Zustand owns temporary cart state only. SQLite remains the durable source of truth. A cart line contains a stable line ID, optional product ID, name snapshot, optional SKU snapshot, unit price in integer paise, positive integer quantity, and whether the line affects inventory.

Cart actions are small and deterministic: add a product, add a custom item, increment, decrement, remove, set discount, set payment method, and clear. Adding the same product again increases the existing line. Custom items remain separate lines.

All money calculations use integer paise:

1. `subtotal = sum(unitPricePaise × quantity)`
2. Fixed discount is parsed to paise and capped at subtotal.
3. Percentage discount is constrained to 0–100 and rounded to the nearest paise.
4. `taxable = subtotal − discount`
5. Tax is zero when disabled; otherwise `round(taxable × taxPercentage / 100)`.
6. `total = taxable + tax`

The calculation module is pure and covered through red-green-refactor tests before UI work.

## Persistence and transaction

A billing service owns bill completion. It receives the cart snapshot, business settings, and payment method, then runs one exclusive SQLite transaction:

1. Re-read every referenced product.
2. Aggregate required quantities by product ID.
3. Reject missing, inactive, or insufficient tracked products.
4. Increment an `app_settings` bill sequence and format `INV-000001`, `INV-000002`, and so on.
5. Insert the bill totals and metadata.
6. Insert immutable bill-item snapshots.
7. Reduce stock for tracked product lines.
8. Insert linked `sale` inventory movements with before/change/after values.

Any error rolls back the complete transaction. A retry therefore cannot leave a bill without items or stock changes without a bill. The unique bill number constraint protects sequence mistakes.

The existing schema already stores required bill and bill-item snapshots, so no new migration is required for this phase. Discount type and entered value are temporary UI concerns; completed bills store the resulting discount amount. The applied tax is preserved as `tax_paise`.

## Repository boundaries

- `billing-calculations.ts` provides pure subtotal, discount, tax, total, and unit calculations.
- `cart-store.ts` owns temporary Zustand state and exposes typed cart actions.
- `billing-service.ts` owns the atomic completion transaction.
- `bill-repository.ts` provides read-only bill history and bill-detail queries.
- Repository mappers convert SQLite rows to `Bill` and `BillItem` domain objects.
- Screens call these APIs and do not issue SQL directly.

## Error handling

The UI disables completion for an empty cart and shows a clear error for invalid custom items or discounts. Transaction errors are translated into actionable messages such as `Filter Coffee only has 4 in stock`. The cart remains intact after a failed save so staff can correct it.

The completion button is locked while saving to prevent double submission. Bill history handles empty and loading states without fake data.

## Testing and verification

Test-first coverage includes:

- fixed and percentage discounts, caps, rounding, and configured tax;
- adding the same product twice, decrement/removal, and cart clearing;
- sequence formatting and bill-number progression;
- successful atomic bill creation with item snapshots and stock movements;
- insufficient stock rollback;
- custom items that do not alter inventory;
- bill and bill-item row mapping.

Final verification requires the full Vitest suite, TypeScript, ESLint, Android export, and iPhone 15 simulator inspection of product search, cart controls, completion, bill history, and bill detail.

## Commit sequence

1. Billing design and implementation plan.
2. Pure calculations and cart state with tests.
3. Atomic billing persistence and history queries with tests.
4. Sell screen and checkout interaction.
5. Bill history and bill detail screens.
6. Documentation and refreshed simulator screenshots.
