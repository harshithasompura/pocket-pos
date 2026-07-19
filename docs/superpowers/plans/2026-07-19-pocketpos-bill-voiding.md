# PocketPOS Bill Voiding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auditable one-time bill voiding that restores tracked inventory atomically and clearly marks voided bills throughout the UI.

**Architecture:** A focused service owns the exclusive SQLite transaction because bill state, product stock, and movement history must commit together. Bill details collects and validates the reason before invoking the service; lists and details remain read-only consumers of durable state.

**Tech Stack:** Expo SDK 57, TypeScript, Expo SQLite, React Native, Expo Router, Vitest.

## Global Constraints

- Work directly on `main`; do not create a branch.
- Never delete a completed bill.
- Only completed bills can be voided.
- Require a trimmed reason of at least three characters.
- Restore inventory and mark the bill void in one exclusive transaction.
- Restore tracked product quantities exactly once.
- Insert `bill_void` inventory movements for every restored product.
- Disable receipt output for voided bills.
- Every commit uses a lowercase Conventional Commit subject and Codex co-author trailer.

---

### Task 1: Atomic Void Service

**Files:**
- Create: `src/features/billing/bill-void-service.ts`
- Test: `src/features/billing/bill-void-service.test.ts`

**Interfaces:**
- Consumes: `SQLiteDatabase`, bill/bill-item/product rows, `createId`, and `nowIso`.
- Produces: `voidBill(db: SQLiteDatabase, input: { billId: string; reason: string }): Promise<Bill>`.

- [ ] **Step 1: Write failing service tests**

Build a transaction fake that returns a completed bill, tracked and custom item rows, and product rows while recording SQL calls. Assert:

```ts
const bill = await voidBill(db, { billId: "b1", reason: "  Customer cancelled  " });
expect(bill.status).toBe("void");
expect(bill.voidReason).toBe("Customer cancelled");
expect(calls).toContainEqual(expect.objectContaining({
  sql: expect.stringContaining("UPDATE products"),
  args: expect.arrayContaining([12]),
}));
expect(calls).toContainEqual(expect.objectContaining({
  sql: expect.stringContaining("INSERT INTO inventory_movements"),
  args: expect.arrayContaining(["bill_void"]),
}));
```

Add tests for aggregation of repeated tracked lines, ignored custom/non-tracked lines, short reason, already voided bill, missing bill, and missing tracked product.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/billing/bill-void-service.test.ts`

Expected: FAIL because the void service is missing.

- [ ] **Step 3: Implement the transaction**

Validate the trimmed reason before opening the transaction. Inside `withExclusiveTransactionAsync`, select the bill by ID, require `status === "completed"`, load its item rows, aggregate positive tracked quantities by non-null product ID, then update each current product and insert one reversal movement.

```ts
await txn.runAsync(
  "UPDATE products SET stock_quantity = ?, updated_at = ? WHERE id = ?",
  after,
  voidedAt,
  productId,
);
await txn.runAsync(
  "INSERT INTO inventory_movements (...) VALUES (?,?,?,?,?,?,?,?,?)",
  createId(), productId, bill.id, "bill_void", before, quantity, after,
  `Voided ${bill.bill_number}: ${reason}`, voidedAt,
);
```

Update the bill last:

```ts
await txn.runAsync(
  "UPDATE bills SET status = 'void', void_reason = ?, voided_at = ? WHERE id = ? AND status = 'completed'",
  reason,
  voidedAt,
  bill.id,
);
```

Return a mapped bill with status, reason, and timestamp updated.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/billing/bill-void-service.test.ts && pnpm test && pnpm typecheck`

Expected: focused and full suites PASS; TypeScript exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/features/billing/bill-void-service.ts src/features/billing/bill-void-service.test.ts
git commit -m "feat: add atomic bill voiding"
```

### Task 2: Void UI and History State

**Files:**
- Modify: `src/features/billing/bill-detail-screen.tsx`
- Modify: `src/features/billing/bills-screen.tsx`

**Interfaces:**
- Consumes: `voidBill(db, { billId, reason })`.
- Produces: reason entry, destructive confirmation, durable void detail state, and list labels.

- [ ] **Step 1: Add void form state to bill details**

Add `showVoidForm`, `voidReason`, and `voiding` state. For completed bills, render a danger **Void bill** button. When expanded, render a labeled multiline `TextInput`, Cancel, and **Confirm void** actions inside a card.

- [ ] **Step 2: Add validation and destructive confirmation**

Reject reasons shorter than three trimmed characters with `Alert.alert("Reason required", ...)`. Otherwise use an Android-compatible confirmation alert:

```ts
Alert.alert(
  "Void this bill?",
  "Tracked stock will be restored. This cannot be undone.",
  [
    { text: "Cancel", style: "cancel" },
    { text: "Void bill", style: "destructive", onPress: confirmVoid },
  ],
);
```

`confirmVoid` invokes the service, clears the form, reloads the bill, and displays a failure alert saying nothing changed when the transaction rejects.

- [ ] **Step 3: Render the void state**

For a voided bill, replace output status/actions with a visible danger card containing **VOID**, the reason, and formatted void timestamp. Do not render Print receipt, Share PDF, or Void bill actions.

- [ ] **Step 4: Label voided history rows**

In `BillsScreen`, render a compact danger-colored `VOID` label when `bill.status === "void"`. Preserve search, amount, item count, and navigation.

- [ ] **Step 5: Verify**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: tests PASS, static checks exit 0, and Expo reports `Exported: dist`.

- [ ] **Step 6: Commit**

```bash
git add src/features/billing/bill-detail-screen.tsx src/features/billing/bills-screen.tsx
git commit -m "feat: add bill void controls"
```

### Task 3: Simulator Audit and Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/screenshots/README.md`
- Create: `docs/screenshots/voided-bill.png`

**Interfaces:**
- Consumes: completed void workflow and simulator demo data.
- Produces: visual/audit evidence and updated feature documentation.

- [ ] **Step 1: Create a disposable completed simulator bill**

Use the existing demo business and tracked product. Record its starting stock, bill total, dashboard total, and sale movement.

- [ ] **Step 2: Void it through the UI**

Enter a clear reason, confirm the destructive action, and verify the bill shows VOID after reload. Reopen it and confirm the state persists.

- [ ] **Step 3: Verify all downstream effects**

Confirm product stock is restored exactly once, movement history contains `bill_void`, Bills shows VOID, Dashboard excludes the bill, and receipt actions are absent.

- [ ] **Step 4: Capture the voided bill**

Save and inspect `docs/screenshots/voided-bill.png`. Confirm reason and status are readable with no clipping or overlapping controls.

- [ ] **Step 5: Update docs and run final verification**

Add bill voiding and atomic stock reversal to README features and screenshot notes.

Run: `git diff --check && pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: clean diff, all tests PASS, static checks exit 0, Android export succeeds.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/screenshots/README.md docs/screenshots/voided-bill.png
git commit -m "docs: document bill voiding"
```

