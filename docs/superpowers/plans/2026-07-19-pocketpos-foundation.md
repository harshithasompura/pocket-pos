# PocketPOS Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tested, offline-first Expo foundation for PocketPOS with monochrome branding, business setup, product CRUD, stock auditing, five-tab navigation, and Android APK documentation.

**Architecture:** Expo Router composes screens while focused feature modules own behavior. Expo SQLite is the source of truth behind typed repositories and versioned SQL migrations; React components never issue SQL directly. Domain utilities and schemas remain framework-independent so they can be developed test-first with Vitest.

**Tech Stack:** Expo SDK 53+, React Native, Expo Router, TypeScript, pnpm, Expo SQLite, React Hook Form, Zod, Zustand, Lucide React Native, Vitest, React Native Testing Library.

## Global Constraints

- Product name is `PocketPOS`; Android package is `com.nodori.pocketpos`.
- Use TypeScript, functional components, named exports, pnpm, and no Redux.
- Store currency as integer paise and timestamps as ISO-8601 strings.
- Use explicit versioned SQLite migrations and transactions for stock changes.
- Keep persistent data out of AsyncStorage.
- Use a minimal black-and-white interface with no gradients, large touch targets, and rounded-xl surfaces.
- Keep billing and printer implementations outside this foundation; expose honest foundation states rather than fake behavior.
- Every logical step gets a lowercase Conventional Commit with `Co-Authored-By: Codex GPT-5 <noreply@anthropic.com>`.

---

## File Map

- `app/`: Expo Router route entries only.
- `src/components/ui/`: buttons, fields, cards, empty/loading/error states, and layout primitives.
- `src/components/brand/`: PocketPOS logo and wordmark components.
- `src/db/`: SQLite initialization and migration execution.
- `src/db/repositories/`: typed persistence interfaces for business, products, and stock movements.
- `src/features/setup/`: business form schema, screen, and persistence hook.
- `src/features/inventory/`: product schemas, list/form/detail screens, stock adjustment behavior.
- `src/features/foundation/`: honest placeholder screens for later billing, bills, and analytics phases.
- `src/utils/`: pure currency, stock, identifier, and date utilities.
- `assets/`: app icon, adaptive icon, splash, and brand image assets.
- `docs/`: design, plan, APK guide, and later verified screenshots.

### Task 1: Expo Scaffold and Test Harness

**Files:**
- Create: `package.json`, `app.json`, `eas.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `.gitignore`
- Create: `app/_layout.tsx`, `app/index.tsx`
- Create: `src/constants/theme.ts`, `src/utils/currency.ts`, `src/utils/currency.test.ts`

**Interfaces:**
- Produces: `formatCurrency(paise: number, currency?: string): string`
- Produces: runnable `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm export` scripts.

- [ ] **Step 1: Create project configuration and install compatible Expo dependencies**

Use `create-expo-app` with the blank TypeScript template in a temporary directory, copy only required configuration, then install exact Expo-compatible packages with `pnpm expo install`. Add Vitest and ESLint as development dependencies.

- [ ] **Step 2: Write the failing currency test**

```ts
import { describe, expect, it } from "vitest";
import { formatCurrency } from "./currency";

describe("formatCurrency", () => {
  it("formats integer paise without floating-point drift", () => {
    expect(formatCurrency(12_550, "INR")).toBe("₹125.50");
  });
});
```

- [ ] **Step 3: Run the test and verify RED**

Run: `pnpm vitest run src/utils/currency.test.ts`
Expected: FAIL because `./currency` does not exist.

- [ ] **Step 4: Add the minimal formatter and root layout**

Implement `formatCurrency` with `Intl.NumberFormat` and `paise / 100`. Add a root `Stack` route using the monochrome theme and a temporary index screen.

- [ ] **Step 5: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all commands exit 0.

Commit: `chore: scaffold pocketpos app`

### Task 2: Brand Assets and UI Foundation

**Files:**
- Create: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`, `assets/pocketpos-mark.png`
- Create: `src/components/brand/pocketpos-logo.tsx`
- Create: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/field.tsx`, `src/components/ui/screen.tsx`, `src/components/ui/empty-state.tsx`
- Modify: `app.json`, `app/index.tsx`

**Interfaces:**
- Produces: `PocketPosLogo`, `Button`, `Card`, `Field`, `Screen`, and `EmptyState` named components.

- [ ] **Step 1: Generate and inspect the monochrome logo source**

Generate a square, vector-friendly black pocket/receipt mark on white with no gradients, shadows, mockup framing, tagline, or extra text. Copy the accepted project-bound image into `assets/pocketpos-mark.png` and inspect it before deriving app assets.

- [ ] **Step 2: Add reusable primitives**

Use `Pressable`, `TextInput`, `View`, `Text`, `SafeAreaView`, and shared tokens. Controls must have at least 48px touch height, visible focus/error treatment, black primary actions, white surfaces, and neutral borders.

- [ ] **Step 3: Configure icons and splash**

Derive square app, adaptive foreground, and splash assets from the accepted mark. Reference them in `app.json`; keep backgrounds white.

- [ ] **Step 4: Verify and commit**

Run: `pnpm typecheck && pnpm lint && pnpm expo config --type public`
Expected: all commands exit 0 and config reports `PocketPOS` with package `com.nodori.pocketpos`.

Commit: `feat: add pocketpos brand system`

### Task 3: Domain Models, Validation, and Stock Rules

**Files:**
- Create: `src/types/domain.ts`
- Create: `src/features/setup/business-schema.ts`, `src/features/setup/business-schema.test.ts`
- Create: `src/features/inventory/product-schema.ts`, `src/features/inventory/product-schema.test.ts`
- Create: `src/utils/stock.ts`, `src/utils/stock.test.ts`, `src/utils/id.ts`, `src/utils/dates.ts`

**Interfaces:**
- Produces: `Business`, `Product`, `InventoryMovement`, `ReceiptWidth`, `MovementType`.
- Produces: `businessSchema`, `productSchema`, `stockAdjustmentSchema`.
- Produces: `isLowStock(product: Pick<Product, "trackInventory" | "stockQuantity" | "lowStockThreshold">): boolean`.

- [ ] **Step 1: Write failing schema and stock tests**

Cover trimmed required business name, receipt widths 58/80, non-negative integer paise, integer stock, and low-stock only for tracked products at or below threshold.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `pnpm vitest run src/features/setup/business-schema.test.ts src/features/inventory/product-schema.test.ts src/utils/stock.test.ts`
Expected: FAIL because schemas and stock helper do not exist.

- [ ] **Step 3: Implement minimal domain types, schemas, and helpers**

Use Zod transforms only for form strings; repository/domain values remain typed numbers and booleans. Generate IDs with `expo-crypto.randomUUID()` and ISO dates with `new Date().toISOString()`.

- [ ] **Step 4: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all commands exit 0.

Commit: `feat: define pocketpos domain rules`

### Task 4: SQLite Migrations and Repositories

**Files:**
- Create: `src/db/database.ts`, `src/db/migrations.ts`, `src/db/migrations.test.ts`
- Create: `src/db/repositories/business-repository.ts`
- Create: `src/db/repositories/product-repository.ts`
- Create: `src/db/repositories/inventory-repository.ts`
- Create: `src/db/repositories/repository-mappers.ts`, `src/db/repositories/repository-mappers.test.ts`
- Create: `src/db/database-provider.tsx`

**Interfaces:**
- Produces: `initializeDatabase(db: SQLiteDatabase): Promise<void>`.
- Produces: `businessRepository.get/save`, `productRepository.list/get/create/update/setActive/adjustStock`, and `inventoryRepository.listForProduct`.
- Produces: `DatabaseProvider` and `useDatabaseReady()`.

- [ ] **Step 1: Write failing migration and mapping tests**

Assert migrations are strictly ordered and include `schema_migrations`, `businesses`, `products`, `inventory_movements`, `bills`, `bill_items`, and `app_settings`. Assert SQLite integer booleans map to domain booleans.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run src/db/migrations.test.ts src/db/repositories/repository-mappers.test.ts`
Expected: FAIL because migrations and mappers do not exist.

- [ ] **Step 3: Implement versioned migrations**

Run each unapplied migration inside `withTransactionAsync`; insert its version into `schema_migrations` only after SQL succeeds. Enable foreign keys and WAL. Create indexes for product name, bill number/date, and movement product/date.

- [ ] **Step 4: Implement typed repositories**

Use parameterized SQL. Product creation with nonzero opening stock creates an `opening_stock` movement in the same transaction. `adjustStock` reads the current quantity, calculates the new quantity, updates the product, and inserts a movement atomically.

- [ ] **Step 5: Wire database readiness**

Open one stable database filename, `pocketpos.db`. Render explicit loading and retryable error states while migrations initialize.

- [ ] **Step 6: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all commands exit 0.

Commit: `feat: add offline data foundation`

### Task 5: Setup Flow and Tab Navigation

**Files:**
- Create: `app/setup.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/bills.tsx`, `app/(tabs)/inventory.tsx`, `app/(tabs)/dashboard.tsx`, `app/(tabs)/settings.tsx`
- Create: `src/features/setup/business-form.tsx`, `src/features/setup/setup-screen.tsx`
- Create: `src/features/foundation/foundation-screen.tsx`
- Modify: `app/_layout.tsx`, `app/index.tsx`

**Interfaces:**
- Consumes: `businessSchema`, `businessRepository`, `DatabaseProvider`.
- Produces: first-run routing and five stable tab routes.

- [ ] **Step 1: Write a failing first-run decision test**

Extract `getInitialRoute(hasBusiness: boolean): "/setup" | "/(tabs)"` and assert false routes to setup while true routes to tabs.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm vitest run src/features/setup/initial-route.test.ts`
Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement setup and navigation**

Build a scroll-safe business form for name, address, phone, optional GST, currency, receipt width, footer, tax toggle/percentage, and inventory tracking. Save one local business and replace the route with tabs. Use Lucide tab icons and honest foundation screens for unimplemented later phases.

- [ ] **Step 4: Implement settings editing**

Reuse `BusinessForm` with existing values. Saving updates the same business record and returns clear inline success/error feedback.

- [ ] **Step 5: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all commands exit 0.

Commit: `feat: add business setup and navigation`

### Task 6: Product CRUD, Stock Adjustments, and Seed Data

**Files:**
- Create: `app/product/new.tsx`, `app/product/[id].tsx`, `app/product/[id]/edit.tsx`
- Create: `src/features/inventory/inventory-screen.tsx`, `src/features/inventory/product-form.tsx`, `src/features/inventory/product-detail-screen.tsx`, `src/features/inventory/stock-adjustment-form.tsx`
- Create: `src/features/inventory/product-filter.ts`, `src/features/inventory/product-filter.test.ts`
- Create: `src/db/seed.ts`
- Modify: `app/(tabs)/inventory.tsx`, `app/(tabs)/settings.tsx`

**Interfaces:**
- Consumes: product and inventory repositories, product schemas, `isLowStock`.
- Produces: `filterProducts(products, query, mode)` and development-only `seedDemoData()`.

- [ ] **Step 1: Write failing product filter tests**

Cover case-insensitive name/SKU search, low-stock filtering, and active/inactive filtering without mutating input arrays.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm vitest run src/features/inventory/product-filter.test.ts`
Expected: FAIL because `filterProducts` does not exist.

- [ ] **Step 3: Implement inventory listing and product form**

Add search, All/Low stock/Inactive filters, accessible list rows, empty state, add button, and refresh-on-focus. Product form supports name, optional SKU/category, selling price, opening/current stock, low-stock threshold, tracking toggle, and active state.

- [ ] **Step 4: Implement product detail and adjustments**

Show price, status, current stock, movement history, edit action, enable/disable action, and adjustment form with movement type, signed integer quantity, and optional note. Confirm disabling; never delete.

- [ ] **Step 5: Add idempotent development seed helper**

Seed a demo business and several products only when the relevant tables are empty. Expose it from Settings in development mode with confirmation and clear completion feedback.

- [ ] **Step 6: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all commands exit 0.

Commit: `feat: add product and stock management`

### Task 7: Documentation, Screenshots, and Release Verification

**Files:**
- Create: `README.md`, `docs/APK_BUILD.md`, `docs/ARCHITECTURE.md`, `docs/screenshots/README.md`
- Create after app verification: `docs/screenshots/setup.png`, `docs/screenshots/inventory.png`, `docs/screenshots/product-detail.png`
- Modify: `docs/superpowers/plans/2026-07-19-pocketpos-foundation.md`

**Interfaces:**
- Produces: reproducible local, emulator, development APK, release APK, sideload, and upgrade instructions.

- [ ] **Step 1: Write concise project documentation**

README includes product scope, screenshots, prerequisites, install/run/test commands, project structure, offline guarantees, and current limitations. APK guide includes EAS login/configure/build commands, `android.buildType: apk`, device installation, and update-in-place guidance using the unchanged package name and signing key.

- [ ] **Step 2: Run the app and capture verified screenshots**

Start Expo for Android or web preview, exercise first-run setup and product flows, then capture real screens. Do not use generated mockups as documentation screenshots. Record capture environment and date in `docs/screenshots/README.md`.

- [ ] **Step 3: Run full verification**

Run: `pnpm test`
Expected: all tests pass with zero failures.

Run: `pnpm typecheck`
Expected: TypeScript exits 0.

Run: `pnpm lint`
Expected: ESLint exits 0 with no errors.

Run: `pnpm expo export --platform android`
Expected: Android export completes and writes `dist/`.

Run: `pnpm expo-doctor`
Expected: dependency and Expo configuration checks pass.

- [ ] **Step 4: Review acceptance criteria and mark this plan**

Re-read the design acceptance criteria, confirm each implemented item against a screen, test, repository method, migration, asset, or documentation section, and check completed task boxes in this file.

- [ ] **Step 5: Commit documentation and verified screenshots**

Commit: `docs: add pocketpos setup and build guide`

- [ ] **Step 6: Commit any verification-only fixes separately**

If verification required code changes, rerun the complete command set and commit those fixes as `fix: resolve release verification issues`. Do not claim completion without fresh successful output.
