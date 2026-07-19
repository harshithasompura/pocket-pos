# PocketPOS Offline Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Dashboard placeholder with fast offline sales, payment, product, recent-bill, and low-stock analytics for Today, 7 days, and 30 days.

**Architecture:** Pure range and normalization helpers own local-calendar boundaries and complete display buckets. A narrow SQLite repository runs parameterized aggregate queries and returns one typed dashboard object. A single responsive screen renders existing UI primitives and native proportional bars without adding a chart dependency.

**Tech Stack:** Expo SDK 57, React Native, TypeScript, Expo SQLite, Expo Router, Vitest.

## Global Constraints

- Work directly on `main`; do not create a branch.
- Support only Today, 7 days, and 30 days.
- Use device-local calendar boundaries with an exclusive end timestamp.
- Count only bills with `status = 'completed'`.
- Query SQLite directly; do not add cached aggregate tables.
- Add no chart or date-picker dependency.
- Keep the dashboard monochrome, responsive, and scroll-safe.
- Use integer paise for all money.
- Every commit uses a lowercase Conventional Commit subject and Codex co-author trailer.

---

### Task 1: Range and Analytics Types

**Files:**
- Create: `src/features/analytics/analytics-types.ts`
- Create: `src/features/analytics/dashboard-range.ts`
- Test: `src/features/analytics/dashboard-range.test.ts`

**Interfaces:**
- Produces the exact `DashboardRange`, `DashboardRangeDefinition`, `SalesDay`, `PaymentTotal`, `ProductSales`, `LowStockProduct`, and `DashboardAnalytics` types from the approved spec.
- Produces `getDashboardRange(range: DashboardRange, now?: Date): DashboardRangeDefinition`.
- Produces `fillSalesDays(definition, rows): SalesDay[]` and `fillPaymentTotals(rows): PaymentTotal[]`.

- [ ] **Step 1: Write failing pure-helper tests**

Use a local-noon `Date` fixture. Assert Today begins at local midnight and has one bucket; 7d has seven buckets; 30d has thirty buckets; end is next local midnight; missing sales days become zero; payments always return cash, UPI, card, other.

```ts
const definition = getDashboardRange("7d", new Date(2026, 6, 19, 12));
expect(definition.days).toHaveLength(7);
expect(definition.start.getHours()).toBe(0);
expect(definition.end.getDate()).toBe(20);
expect(fillPaymentTotals([{ method: "upi", salesPaise: 5000 }])).toEqual([
  { method: "cash", salesPaise: 0 },
  { method: "upi", salesPaise: 5000 },
  { method: "card", salesPaise: 0 },
  { method: "other", salesPaise: 0 },
]);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/analytics/dashboard-range.test.ts`

Expected: FAIL because the helper module is missing.

- [ ] **Step 3: Implement types and helpers**

`DashboardRangeDefinition` contains `startIso`, `endIso`, and `days: { key: string; label: string }[]`. Build dates with local `setHours(0,0,0,0)`, clone before subtraction, and serialize only after boundaries are calculated. Normalize database date keys to `YYYY-MM-DD`.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/analytics/dashboard-range.test.ts && pnpm test`

Expected: focused and full suites PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/analytics
git commit -m "feat: add dashboard range foundation"
```

### Task 2: SQLite Analytics Repository

**Files:**
- Create: `src/features/analytics/analytics-repository.ts`
- Test: `src/features/analytics/analytics-repository.test.ts`

**Interfaces:**
- Consumes: `DashboardRangeDefinition`, `fillSalesDays`, `fillPaymentTotals`, bill mappers.
- Produces: `createAnalyticsRepository(db).getDashboardAnalytics(definition): Promise<DashboardAnalytics>`.

- [ ] **Step 1: Write failing repository tests**

Use a typed fake `SQLiteDatabase` that routes `getFirstAsync` and `getAllAsync` by query marker and records arguments. Return aggregate rows containing completed data, product/custom-item rankings, recent bill rows, and low-stock rows.

Assert:
- totals normalize nulls and average rounds to integer paise;
- daily gaps and payment methods are filled;
- top products, recent bills, and low-stock values map correctly;
- every ranged query receives `definition.startIso` and `definition.endIso`;
- SQL includes `b.status = 'completed'`;
- an empty dataset returns zero totals and empty lists.

```ts
const analytics = await createAnalyticsRepository(db).getDashboardAnalytics(definition);
expect(analytics).toMatchObject({
  totalSalesPaise: 12000,
  billCount: 2,
  totalUnits: 4,
  averageBillPaise: 6000,
  lowStockCount: 1,
});
expect(calls.some(({ sql }) => sql.includes("b.status = 'completed'"))).toBe(true);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/analytics/analytics-repository.test.ts`

Expected: FAIL because the repository is missing.

- [ ] **Step 3: Implement parameterized aggregate queries**

Run the following independent reads with `Promise.all`:
- summary from `bills`;
- daily totals grouped by `date(created_at, 'localtime')`;
- payment totals grouped by `payment_method`;
- top five bill-item snapshots joined to completed bills, grouped by `COALESCE(product_id, product_name_snapshot)`;
- five recent completed bill rows;
- current low-stock count;
- five current low-stock product rows.

Use `mapBill` for recent bills. Normalize all nullable numeric aggregates with `Number(value ?? 0)`.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/analytics/analytics-repository.test.ts && pnpm test && pnpm typecheck`

Expected: repository and full suites PASS; TypeScript exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/features/analytics/analytics-repository.ts src/features/analytics/analytics-repository.test.ts
git commit -m "feat: add offline analytics queries"
```

### Task 3: Dashboard UI

**Files:**
- Create: `src/features/analytics/dashboard-screen.tsx`
- Modify: `app/(tabs)/dashboard.tsx`

**Interfaces:**
- Consumes: `getDashboardRange`, `createAnalyticsRepository`, `DashboardAnalytics`.
- Produces: a focus-aware, range-selectable, responsive dashboard.

- [ ] **Step 1: Build the focus-aware data flow**

Keep `range`, `analytics`, `loading`, and `error` state. A memoized `load` builds the range definition, calls the repository, and ignores stale completion with an active flag inside `useFocusEffect`. Range changes trigger a reload.

```ts
const definition = useMemo(() => getDashboardRange(range), [range]);
useFocusEffect(useCallback(() => {
  let active = true;
  setLoading(true);
  createAnalyticsRepository(db).getDashboardAnalytics(definition)
    .then((value) => { if (active) setAnalytics(value); })
    .catch(() => { if (active) setError("Dashboard could not be loaded."); })
    .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
}, [db, definition]));
```

- [ ] **Step 2: Add title, range pills, and responsive summary cards**

Render Today / 7 days / 30 days pills. Use `flexBasis: "47%"`, wrapping, existing cards, and labels for Sales, Bills, Units, Average bill, and Low stock.

- [ ] **Step 3: Add native bar sections**

Create file-local `BarRow` and `SectionTitle` components. Bar width is `value === 0 ? "0%" : `${Math.max(6, Math.round(value / max * 100))}%``. Render sales trend and stable payment breakdown with currency values.

- [ ] **Step 4: Add product, recent-bill, and low-stock lists**

Top products show units and revenue. Recent bill rows navigate to `/bill/[id]`. Low-stock rows navigate to `/product/[id]`. Show concise empty cards when a section has no rows.

- [ ] **Step 5: Add loading and retry states**

During initial loading, display one neutral loading card. On error, show the message and a Retry button. Preserve the selected range.

- [ ] **Step 6: Wire the route and verify**

Replace the placeholder route with a named export/import of `DashboardScreen`.

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: all tests PASS, static checks exit 0, and Expo reports `Exported: dist`.

- [ ] **Step 7: Commit**

```bash
git add src/features/analytics/dashboard-screen.tsx app/(tabs)/dashboard.tsx
git commit -m "feat: add offline sales dashboard"
```

### Task 4: Simulator QA and Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/screenshots/README.md`
- Create: `docs/screenshots/dashboard.png`

**Interfaces:**
- Consumes: completed dashboard and simulator demo data.
- Produces: real visual evidence and current project documentation.

- [ ] **Step 1: Seed representative simulator analytics data**

Use the existing demo business/products and create completed demo bills across Today, 7 days, and 30 days with cash, UPI, and card payments. Keep seed data confined to the simulator SQLite database.

- [ ] **Step 2: Inspect all three ranges on iPhone 15**

Verify cards wrap correctly; zero and nonzero bars render; long product names do not clip; the full screen scrolls above the tab bar; recent and low-stock rows target valid routes.

- [ ] **Step 3: Capture the dashboard**

Save a real simulator capture as `docs/screenshots/dashboard.png` and inspect it before committing.

- [ ] **Step 4: Update project documentation**

Move dashboard analytics into implemented README features, update the screenshot table, and document Today / 7 / 30 ranges and native no-dependency charts.

- [ ] **Step 5: Final verification**

Run: `git diff --check && pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: clean diff, all tests PASS, static checks exit 0, Android export succeeds.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/screenshots/README.md docs/screenshots/dashboard.png
git commit -m "docs: document offline dashboard"
```

