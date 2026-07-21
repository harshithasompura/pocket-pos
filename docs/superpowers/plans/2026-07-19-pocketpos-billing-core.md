# PocketPOS Billing Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver offline cart creation, atomic bill completion, stock deduction, bill history, and bill detail.

**Architecture:** Zustand owns the temporary cart, pure functions calculate integer-paise totals, and a billing service owns the single SQLite completion transaction. Read repositories map durable bill snapshots into typed domain objects; screens never issue SQL.

**Tech Stack:** Expo 57, React Native 0.86, Expo Router 57, TypeScript 6, SQLite, Zustand 5, Vitest, pnpm 10.

## Global Constraints

- Work directly on `main` as explicitly requested.
- Use integer paise for every persisted and calculated money value.
- Block negative tracked stock and preserve the cart after save failures.
- Custom items never affect inventory.
- Printing, PDF generation, voiding, and analytics are outside this plan.
- Add no dependencies.
- Use lowercase Conventional Commits with `Co-authored-by: Codex <noreply@openai.com>`.

---

### Task 1: Billing calculations and cart state

**Files:**

- Create: `src/features/billing/billing-types.ts`
- Create: `src/features/billing/billing-calculations.ts`
- Create: `src/features/billing/billing-calculations.test.ts`
- Create: `src/features/billing/cart-store.ts`
- Create: `src/features/billing/cart-store.test.ts`

**Interfaces:**

- Produces: `CartLine`, `Discount`, `PaymentMethod`, `BillTotals`.
- Produces: `calculateBillTotals(lines, discount, taxEnabled, taxPercentage): BillTotals`.
- Produces: `useCartStore` with `addProduct`, `addCustomItem`, `increment`, `decrement`, `remove`, `setDiscount`, `setPaymentMethod`, and `clear`.

- [ ] **Step 1: Write failing calculation tests**

Cover empty totals, quantity multiplication, fixed discount caps, percentage rounding, disabled tax, and enabled tax on the discounted subtotal.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/billing/billing-calculations.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement types and pure calculations**

Use these contracts:

```ts
export type PaymentMethod = "cash" | "upi" | "card" | "other";
export type Discount =
  { type: "none" } | { type: "fixed"; value: number } | { type: "percentage"; value: number };
export type CartLine = {
  id: string;
  productId: string | null;
  name: string;
  sku: string | null;
  unitPricePaise: number;
  quantity: number;
  affectsInventory: boolean;
};
export type BillTotals = {
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  totalUnits: number;
};
```

- [ ] **Step 4: Verify calculation GREEN**

Run: `pnpm vitest run src/features/billing/billing-calculations.test.ts`

Expected: all calculation tests pass.

- [ ] **Step 5: Write failing cart tests**

Cover merging the same product, separate custom lines, decrement-to-remove, explicit removal, payment/discount updates, and clear-to-default.

- [ ] **Step 6: Verify cart RED, implement store, and verify GREEN**

Run before implementation: `pnpm vitest run src/features/billing/cart-store.test.ts`

Expected: FAIL because `cart-store.ts` does not exist.

Use a vanilla Zustand store factory for isolated tests and export a React-bound `useCartStore` for screens.

Run after implementation: `pnpm vitest run src/features/billing/cart-store.test.ts`

Expected: all cart tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/features/billing
git commit -m "feat: add billing cart foundation" -m "Co-authored-by: Codex <noreply@openai.com>"
```

### Task 2: Atomic billing persistence and history reads

**Files:**

- Modify: `src/types/domain.ts`
- Modify: `src/db/repositories/repository-mappers.ts`
- Modify: `src/db/repositories/repository-mappers.test.ts`
- Create: `src/db/repositories/bill-repository.ts`
- Create: `src/features/billing/billing-service.ts`
- Create: `src/features/billing/billing-service.test.ts`

**Interfaces:**

- Produces: `Bill` and `BillItem` domain types.
- Produces: `createBillRepository(db)` with `list()`, `get(id)`, and `listItems(billId)`.
- Produces: `completeBill(db, input): Promise<Bill>`.

- [ ] **Step 1: Write failing mapper tests for bill rows and item rows**

Assert snake_case SQLite fields map to camelCase domain objects, booleans map from integers, and nullable snapshots remain null.

- [ ] **Step 2: Verify mapper RED, implement domain types/mappers, verify GREEN**

Run: `pnpm vitest run src/db/repositories/repository-mappers.test.ts`

Expected before implementation: FAIL on missing bill mapper exports. Expected after implementation: PASS.

- [ ] **Step 3: Write failing billing-service tests with a transaction-capable fake database**

Cover bill sequence formatting, immutable items, tracked stock reduction, sale movement creation, custom items, and insufficient-stock rollback behavior.

- [ ] **Step 4: Verify service RED, implement transaction, verify GREEN**

Run: `pnpm vitest run src/features/billing/billing-service.test.ts`

Expected before implementation: FAIL because `completeBill` is missing. Expected after implementation: all service tests pass.

Bill numbers use the `app_settings` key `next_bill_sequence`; missing means the first bill is sequence 1 and the stored next value becomes 2.

- [ ] **Step 5: Implement bill read repository and run the full suite**

Run: `pnpm test && pnpm typecheck && pnpm lint`

Expected: all checks pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/domain.ts src/db/repositories src/features/billing
git commit -m "feat: add atomic bill completion" -m "Co-authored-by: Codex <noreply@openai.com>"
```

### Task 3: Sell and checkout experience

**Files:**

- Create: `src/features/billing/sell-screen.tsx`
- Create: `src/features/billing/cart-line-row.tsx`
- Create: `src/features/billing/custom-item-form.tsx`
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**

- Consumes: `useCartStore`, `calculateBillTotals`, product/business repositories, and `completeBill`.
- Produces: searchable product catalogue, cart editor, discount/payment controls, and save action.

- [ ] **Step 1: Build the searchable catalogue and cart rows**

Show active products only. Tapping adds/merges a product. Provide increment, decrement, and remove actions with accessible labels.

- [ ] **Step 2: Build custom item and discount controls**

Validate trimmed name, positive rupee price, and positive integer quantity. Offer None/Fixed/% discount modes and keep entered values temporary.

- [ ] **Step 3: Build payment and completion flow**

Offer Cash/UPI/Card/Other, show subtotal/discount/tax/total, disable empty-cart checkout, lock while saving, preserve cart on failure, and route to `/bill/<id>` after success.

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm typecheck && pnpm lint`

Expected: all checks pass.

- [ ] **Step 5: Commit**

```bash
git add 'app/(tabs)/index.tsx' src/features/billing
git commit -m "feat: add offline checkout flow" -m "Co-authored-by: Codex <noreply@openai.com>"
```

### Task 4: Bill history and bill detail

**Files:**

- Create: `src/features/billing/bills-screen.tsx`
- Create: `src/features/billing/bill-detail-screen.tsx`
- Modify: `app/(tabs)/bills.tsx`
- Create: `app/bill/[id].tsx`
- Modify: `app/_layout.tsx`

**Interfaces:**

- Consumes: bill repository and currency/date formatters.
- Produces: searchable newest-first bill history and immutable bill-detail presentation.

- [ ] **Step 1: Implement history states and search**

Show loading, empty, and list states. Each row includes bill number, date, payment method, total units, total, and status.

- [ ] **Step 2: Implement bill detail**

Show item snapshots and totals. Configure the stack route title as `Bill details`.

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`

```bash
git add app src/features/billing
git commit -m "feat: add bill history" -m "Co-authored-by: Codex <noreply@openai.com>"
```

### Task 5: Documentation, simulator QA, and export

**Files:**

- Modify: `README.md`
- Create: `docs/screenshots/checkout.png`
- Create: `docs/screenshots/bill-detail.png`
- Modify: `docs/screenshots/README.md`

- [ ] **Step 1: Complete a bill in the iPhone 15 simulator**

Confirm quantities, totals, payment selection, stock deduction, bill history, and bill detail. Trigger insufficient stock once and verify the cart remains intact.

- [ ] **Step 2: Capture and inspect screenshots**

Save native 1179 × 2556 captures with no keyboard or alert visible.

- [ ] **Step 3: Run final verification**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: all tests and static checks pass; Android export writes `dist/metadata.json`.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/screenshots
git commit -m "docs: document billing flow" -m "Co-authored-by: Codex <noreply@openai.com>"
```
