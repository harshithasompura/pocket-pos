# PocketPOS UI Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove internal route labels, restore canonical Expo TypeScript configuration, and give PocketPOS screens consistent breathing room without changing the monochrome product identity.

**Architecture:** Keep Expo Router and the existing UI primitives. Configure the root stack explicitly, extend the shared spacing scale, and apply those tokens through current screens instead of adding layout dependencies or parallel component systems.

**Tech Stack:** Expo 57, React Native 0.86, Expo Router 57, TypeScript 6, Vitest, ESLint, pnpm 10.

## Global Constraints

- Keep the interface monochrome and neutral with no gradients or animation.
- Preserve 24-point phone page padding and the existing 820-point tablet max width.
- Add no runtime dependencies.
- Keep billing, receipts, analytics, and backup outside this cleanup.
- Use lowercase Conventional Commits with `Co-authored-by: Codex <noreply@openai.com>`.

---

### Task 1: Expo configuration and navigation labels

**Files:**
- Restore: `expo-env.d.ts`
- Modify: `tsconfig.json`
- Modify: `app/_layout.tsx`

**Interfaces:**
- Consumes: Expo Router's `Stack` and the existing route files.
- Produces: explicit root-stack presentation for setup, tabs, product creation, product detail, and product editing.

- [ ] **Step 1: Restore Expo's committed TypeScript inputs**

Restore `expo-env.d.ts` to:

```ts
/// <reference types="expo/types" />
```

Restore `tsconfig.json` includes to:

```json
"include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
```

- [ ] **Step 2: Configure human-readable stack routes**

Inside the existing `<Stack>`, add:

```tsx
<Stack.Screen name="index" options={{ headerShown: false }} />
<Stack.Screen name="setup" options={{ headerShown: false }} />
<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
<Stack.Screen name="product/new" options={{ title: "Add product" }} />
<Stack.Screen name="product/[id]" options={{ title: "Product details" }} />
<Stack.Screen name="product/[id]/edit" options={{ title: "Edit product" }} />
```

- [ ] **Step 3: Verify configuration and navigation types**

Run: `pnpm typecheck && pnpm lint`

Expected: both commands exit 0 with no errors.

- [ ] **Step 4: Inspect root routes in the iPhone 15 simulator**

Open setup, tabs, product detail, and edit. Confirm no screen displays `(tabs)`, `product/[id]`, or `setup` as a title.

- [ ] **Step 5: Commit**

```bash
git add expo-env.d.ts tsconfig.json app/_layout.tsx
git commit -m "fix: clean up navigation headers" -m "Co-authored-by: Codex <noreply@openai.com>"
```

### Task 2: Shared spacing and screen hierarchy

**Files:**
- Modify: `src/constants/theme.ts`
- Modify: `src/components/ui/screen.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/field.tsx`
- Modify: `src/features/setup/setup-screen.tsx`
- Modify: `src/features/setup/business-form.tsx`
- Modify: `src/features/inventory/inventory-screen.tsx`
- Modify: `src/features/inventory/product-detail-screen.tsx`
- Modify: `app/(tabs)/settings.tsx`

**Interfaces:**
- Consumes: `spacing` tokens and the existing `Screen`, `Card`, and `Field` APIs.
- Produces: a `spacing.xxl` token worth 40 points and consistent page, section, form, and card gaps.

- [ ] **Step 1: Add the shared page-level spacing token**

Change the spacing scale to:

```ts
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 } as const;
```

- [ ] **Step 2: Improve shared primitive spacing**

Keep `Screen` horizontal padding at `spacing.lg`, add bottom padding of `spacing.xxl`, and set scroll indicators to stay within the padded content. Keep cards at `spacing.lg`; use screen-level and section-level gaps rather than inflating every control.

- [ ] **Step 3: Separate setup and settings form sections**

Use `spacing.xl` for the form container gap, `spacing.md` inside field groups, and `spacing.lg` inside toggle cards. Keep paired phone/GST fields responsive through the existing wrapping row.

- [ ] **Step 4: Separate inventory hierarchy**

Use `spacing.lg` between heading, search, filters, and catalogue. Add an explicit product-list container with `spacing.sm` so product cards are visually separate without wasting vertical space.

- [ ] **Step 5: Separate product-detail hierarchy**

Use `spacing.lg` between top-level sections and preserve `spacing.md` inside stock adjustment and movement cards. Keep movement history visible in the first viewport on an iPhone 15 where practical.

- [ ] **Step 6: Verify static quality**

Run: `pnpm test && pnpm typecheck && pnpm lint`

Expected: all Vitest tests pass; TypeScript and ESLint exit 0.

- [ ] **Step 7: Inspect responsive layouts**

In the iPhone 15 simulator, inspect setup, inventory, product detail, and settings at the top and bottom of each scroll view. Confirm no clipped fields, overlapping buttons, double page padding, or inaccessible submit actions.

- [ ] **Step 8: Commit**

```bash
git add src/constants/theme.ts src/components/ui/screen.tsx src/components/ui/card.tsx src/components/ui/field.tsx src/features/setup/setup-screen.tsx src/features/setup/business-form.tsx src/features/inventory/inventory-screen.tsx src/features/inventory/product-detail-screen.tsx 'app/(tabs)/settings.tsx'
git commit -m "style: improve interface spacing" -m "Co-authored-by: Codex <noreply@openai.com>"
```

### Task 3: Refresh visual documentation

**Files:**
- Modify: `docs/screenshots/setup.png`
- Modify: `docs/screenshots/inventory.png`
- Modify: `docs/screenshots/product-detail.png`
- Modify: `docs/screenshots/splash.png` only if the launch presentation changed.
- Modify: `docs/screenshots/README.md` only if capture conditions changed.

**Interfaces:**
- Consumes: the verified iPhone 15 simulator screens and existing demo SQLite data.
- Produces: current 1179 × 2556 README imagery.

- [ ] **Step 1: Capture cleaned screens**

Use `xcrun simctl io booted screenshot <path>` for each state after the route settles. Keep the same simulator device, light appearance, and sample catalogue.

- [ ] **Step 2: Inspect every PNG**

Confirm setup, inventory, and product detail match their labels, show no raw route names, contain no alerts or keyboards, and measure 1179 × 2556.

- [ ] **Step 3: Run full verification**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm export`

Expected: tests, TypeScript, ESLint, and the Android production export all exit 0.

- [ ] **Step 4: Commit**

```bash
git add docs/screenshots/setup.png docs/screenshots/inventory.png docs/screenshots/product-detail.png docs/screenshots/splash.png docs/screenshots/README.md
git commit -m "docs: refresh simulator screenshots" -m "Co-authored-by: Codex <noreply@openai.com>"
```
