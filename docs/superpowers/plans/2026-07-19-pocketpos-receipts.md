# PocketPOS Receipts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 58/80 mm receipt rendering, system printing, PDF creation and sharing, plus Save & print checkout.

**Architecture:** A pure renderer owns safe receipt HTML. A receipt service loads durable bill snapshots and delegates to injected print/share adapters, while repository methods persist output status. Screens invoke output only after bill completion, so native failures never affect the saved sale.

**Tech Stack:** Expo SDK 57, TypeScript, Expo Print, Expo Sharing, Expo SQLite, Vitest, React Native.

## Global Constraints

- Work directly on `main`; do not create a branch.
- Keep receipt output monochrome with no gradients.
- Support exactly 58 mm and 80 mm widths with dynamic height.
- Output failures must never undo a saved bill or stock movement.
- Install Expo SDK 57-compatible modules through `pnpm expo install`.
- Use lowercase Conventional Commit subjects and the Codex co-author trailer.

---

### Task 1: Thermal Receipt Renderer

**Files:**

- Create: `src/features/receipts/receipt-renderer.ts`
- Test: `src/features/receipts/receipt-renderer.test.ts`

**Interfaces:**

- Consumes: `Business`, `Bill`, and `BillItem`.
- Produces: `renderReceiptHtml(input: { business: Business; bill: Bill; items: BillItem[] }): string`.

- [ ] **Step 1: Write failing renderer tests**

Cover escaped business/item/footer text, `@page { size: 58mm auto; }`, the 80 mm variant, metadata, quantities, totals, payment method, and omitted empty optional fields.

```ts
expect(renderReceiptHtml({ business, bill, items })).toContain("@page { size: 58mm auto;");
expect(renderReceiptHtml({ business: { ...business, name: "Som & Sons" }, bill, items })).toContain(
  "Som &amp; Sons",
);
expect(renderReceiptHtml({ business, bill, items })).toContain("2 × ₹ 30.00");
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/receipts/receipt-renderer.test.ts`

Expected: FAIL because the renderer module is missing.

- [ ] **Step 3: Implement the renderer**

Add a private HTML escaper for `& < > " '`. Return one self-contained document with inline CSS, system monospace, tabular numbers, wrapped names, all required business/bill/item/total fields, and `business.receiptWidth`.

```ts
export const renderReceiptHtml = ({ business, bill, items }: ReceiptInput): string => {
  const width = business.receiptWidth === 80 ? 80 : 58;
  return `<!doctype html><html><head><style>@page { size: ${width}mm auto; margin: 3mm; }</style></head>…</html>`;
};
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/receipts/receipt-renderer.test.ts && pnpm test`

Expected: focused and full suites PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/receipts/receipt-renderer.ts src/features/receipts/receipt-renderer.test.ts
git commit -m "feat: add thermal receipt renderer"
```

### Task 2: Receipt Persistence and Native Service

**Files:**

- Modify: `src/db/repositories/bill-repository.ts`
- Test: `src/db/repositories/bill-repository.test.ts`
- Create: `src/features/receipts/receipt-service.ts`
- Test: `src/features/receipts/receipt-service.test.ts`
- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**

- Produces repository methods `setPrintStatus(id, status)` and `setPdfUri(id, uri)`.
- Produces `createReceiptService(db, adapters?)` with `printBillReceipt`, `createBillPdf`, and `shareBillPdf`.

- [ ] **Step 1: Install native modules**

Run: `pnpm expo install expo-print expo-sharing`

Expected: SDK-compatible dependencies and updated lockfile.

- [ ] **Step 2: Write failing repository and service tests**

Repository tests assert parameterized updates. Service tests inject:

```ts
type ReceiptAdapters = {
  printToFileAsync: (options: { html: string }) => Promise<{ uri: string }>;
  printAsync: (options: { html: string }) => Promise<void>;
  isSharingAvailableAsync: () => Promise<boolean>;
  shareAsync: (uri: string, options: { mimeType: string; dialogTitle: string }) => Promise<void>;
};
```

Assert printed/failed persistence, PDF URI persistence, existing PDF reuse, missing data errors, and unavailable sharing.

- [ ] **Step 3: Verify RED**

Run: `pnpm vitest run src/db/repositories/bill-repository.test.ts src/features/receipts/receipt-service.test.ts`

Expected: FAIL because update methods and service are absent.

- [ ] **Step 4: Implement persistence and service**

```ts
async setPrintStatus(id, status) {
  await db.runAsync("UPDATE bills SET print_status = ? WHERE id = ?", status, id);
},
async setPdfUri(id, uri) {
  await db.runAsync("UPDATE bills SET pdf_uri = ? WHERE id = ?", uri, id);
}
```

The service loads business, bill, and items, renders once, invokes the adapter, and persists output. Print failure stores `failed` then rethrows. PDF creation stores URI. Sharing reuses `bill.pdfUri` or creates one, checks availability, then opens the sheet.

- [ ] **Step 5: Verify GREEN**

Run: `pnpm vitest run src/db/repositories/bill-repository.test.ts src/features/receipts/receipt-service.test.ts && pnpm test`

Expected: focused and full suites PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/db/repositories/bill-repository.ts src/db/repositories/bill-repository.test.ts src/features/receipts
git commit -m "feat: add receipt output service"
```

### Task 3: Bill Detail Receipt Actions

**Files:**

- Modify: `src/features/billing/bill-detail-screen.tsx`

**Interfaces:**

- Consumes: `createReceiptService(db).printBillReceipt(id)` and `.shareBillPdf(id)`.
- Produces: print/share actions and durable status feedback.

- [ ] **Step 1: Add a reusable `load` callback plus independent `printing` and `sharing` states.**

- [ ] **Step 2: Add handlers that call the service, reload on success, and show explicit native alerts on failure.**

```ts
try {
  await createReceiptService(db).printBillReceipt(id);
  await load();
} catch (error) {
  Alert.alert("Printing failed", `${message(error)} Your bill remains saved.`);
}
```

- [ ] **Step 3: Add Print receipt and Share PDF buttons plus `PRINTED`, `PRINT FAILED`, `NOT PRINTED`, and conditional `PDF READY` copy.**

- [ ] **Step 4: Verify**

Run: `pnpm typecheck && pnpm lint`

Expected: both exit 0 without warnings.

- [ ] **Step 5: Commit**

```bash
git add src/features/billing/bill-detail-screen.tsx
git commit -m "feat: add bill receipt actions"
```

### Task 4: Save and Print Checkout

**Files:**

- Modify: `src/features/billing/sell-screen.tsx`

**Interfaces:**

- Consumes: `completeBill` and `createReceiptService(db).printBillReceipt(bill.id)`.
- Produces: Save bill and Save & print paths sharing one durable completion function.

- [ ] **Step 1: Change checkout to accept `shouldPrint: boolean`. Complete the bill, clear the cart, and navigate before optional printing. Catch output failure separately so the sale is reported as saved.**

```ts
const bill = await completeBill(db, input);
cart.clear();
router.push(`/bill/${bill.id}`);
if (shouldPrint) await createReceiptService(db).printBillReceipt(bill.id);
```

- [ ] **Step 2: Keep Save bill primary and add Save & print secondary, sharing one busy state to prevent duplicate bills.**

- [ ] **Step 3: Verify**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: tests PASS, checks exit 0, and Expo reports `Exported: dist`.

- [ ] **Step 4: Commit**

```bash
git add src/features/billing/sell-screen.tsx
git commit -m "feat: add save and print checkout"
```

### Task 5: Simulator QA and Documentation

**Files:**

- Modify: `README.md`
- Modify: `docs/screenshots/README.md`
- Create: `docs/screenshots/receipt-actions.png`

**Interfaces:**

- Consumes: completed receipt output UI.
- Produces: real simulator evidence and updated feature documentation.

- [ ] **Step 1: Run `pnpm start`, open a saved bill on iPhone 15, and inspect receipt actions and status spacing.**

- [ ] **Step 2: Open and cancel system printing, confirming the bill remains. Open Share PDF, confirm the share sheet, return, and confirm `PDF READY`.**

- [ ] **Step 3: Capture `docs/screenshots/receipt-actions.png` and inspect for clipping or overlap.**

- [ ] **Step 4: Update README feature/screenshot sections and document that direct ESC/POS testing remains a real-device milestone.**

- [ ] **Step 5: Final verification**

Run: `git diff --check && pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: clean diff, tests PASS, checks exit 0, Android export succeeds.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/screenshots/README.md docs/screenshots/receipt-actions.png
git commit -m "docs: document receipt output"
```
