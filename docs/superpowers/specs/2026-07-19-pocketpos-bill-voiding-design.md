# PocketPOS Bill Voiding and Stock Reversal Design

## Scope

PocketPOS will let an owner void a completed bill without deleting its audit history. Voiding changes the bill status, records a required reason and timestamp, restores inventory for tracked product lines, and writes compensating inventory movements in one exclusive SQLite transaction.

Refunds, partial voids, exchanges, negative replacement bills, and payment-provider refunds are excluded from this client MVP.

## Eligibility and Validation

Only bills with `status = 'completed'` can be voided. The owner must enter a trimmed reason of at least three characters and confirm a destructive warning before the service runs.

The service rejects:

- a missing bill;
- an already voided bill;
- an empty or too-short reason;
- a tracked bill item whose product no longer exists;
- malformed tracked quantities.

A rejected void changes nothing. Duplicate attempts cannot restore stock twice.

## Transaction

`voidBill(db, { billId, reason })` owns one exclusive transaction:

1. Re-read the bill inside the transaction and confirm it is completed.
2. Load all saved bill-item snapshots.
3. Aggregate tracked quantities by product ID.
4. Re-read every affected product.
5. For each product, calculate `quantityAfter = quantityBefore + soldQuantity`.
6. Update the product stock.
7. Insert one `bill_void` inventory movement containing before, positive change, after, bill ID, and a note referencing the bill number.
8. Update the bill to `status = 'void'` with the trimmed reason and void timestamp.

The bill update occurs last. Any SQL failure rolls back the bill status, product quantities, and movements together. Custom items and non-inventory lines are preserved but never alter stock.

## History and Analytics

Voided bills remain in bill history and retain their original number, item snapshots, totals, payment method, print/PDF state, and creation time. Their detail screen clearly shows **VOID**, the reason, and the void timestamp.

The dashboard already filters for completed bills, so voided totals disappear automatically. Inventory movement history shows the original sale movement and the positive `bill_void` reversal.

Printing and PDF sharing are disabled for voided bills to prevent staff from issuing them as active receipts. Previously generated PDF files are not deleted from storage, but the UI no longer offers sharing.

## User Interface

Bill details adds a **Void bill** danger action only for completed bills. Pressing it opens a small form or native prompt for the required reason, followed by a destructive confirmation that explicitly says stock will be restored and the action cannot be undone.

During voiding, receipt and void actions are disabled. On success, the screen reloads in place and shows the void state. On failure, a readable alert confirms that the bill and stock were not changed.

Bills list rows show a visible `VOID` label for voided bills. Search remains unchanged in this phase; date/payment/status filters belong to the next bill-history enhancement.

## Service and Repository Boundaries

The void transaction lives in `src/features/billing/bill-void-service.ts`. UI components never issue SQL. Existing bill repositories remain responsible for read operations; the service performs the coupled transaction directly because bill state, products, and movements must succeed or fail together.

The service returns the updated `Bill` so the caller can refresh immediately.

## Testing

Service tests use a deterministic transaction fake and cover:

- restoring one tracked product;
- aggregating repeated product lines;
- ignoring custom/non-tracked lines;
- creating correct `bill_void` movements;
- trimming and persisting the reason;
- rejecting short reasons;
- rejecting missing and already voided bills;
- rejecting missing tracked products;
- propagating SQL failure without reporting success.

UI behavior is verified with TypeScript, ESLint, Android export, and iPhone 15 simulator inspection of confirmation, successful void state, disabled receipt actions, bill-list label, restored product stock, and reversal movement history.

## Client Acceptance

A client-ready void flow must preserve the original bill, restore stock exactly once, create a visible audit movement, disappear from dashboard sales totals, and survive app restart entirely offline.

