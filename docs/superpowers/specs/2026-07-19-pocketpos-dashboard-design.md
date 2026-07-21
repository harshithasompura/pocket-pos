# PocketPOS Offline Dashboard Design

## Scope

PocketPOS will replace the Dashboard placeholder with a compact offline analytics view calculated directly from SQLite. The dashboard supports three fixed ranges: **Today**, **7 days**, and **30 days**. Custom ranges, product-detail analytics, CSV export, and cached aggregate tables are excluded from this phase.

## Data Model and Range Semantics

A typed analytics repository will own every dashboard query. It receives a start timestamp and an exclusive end timestamp in ISO format and returns one `DashboardAnalytics` object.

Ranges use the device's local calendar:

- **Today** starts at local midnight and ends at the next local midnight.
- **7 days** includes today plus the preceding six local calendar days.
- **30 days** includes today plus the preceding twenty-nine local calendar days.

Queries use `created_at >= ? AND created_at < ?`. Only bills with `status = 'completed'` count toward sales metrics. This makes the repository correct when voiding is implemented later without requiring dashboard changes.

## Metrics

The summary area shows:

- total sales;
- completed bill count;
- total units sold;
- average bill value;
- low-stock product count.

Average bill value is zero when the range contains no completed bills. Low stock is a current inventory measure rather than a historical range measure: active, inventory-tracked products whose stock is at or below their threshold.

## Dashboard Sections

The selected range drives all sales sections:

1. **Sales trend** — one row per local calendar day, including zero-sale days. Each row shows a short date label, amount, and a proportional black bar.
2. **Payment breakdown** — Cash, UPI, Card, and Other totals in a stable order. Zero-value methods remain visible for easy scanning.
3. **Top products** — the five highest-selling bill-item snapshots ranked by units, with revenue as a secondary value. Items are grouped by saved product ID when available and otherwise by saved name.
4. **Recent bills** — the five newest completed bills in the range. Tapping a row opens its bill details.
5. **Low stock** — up to five active low-stock products, ordered by lowest stock first. Tapping a row opens product details.

Least-selling products are excluded because small datasets make that ranking misleading. A later product-analytics phase can add richer inventory and sales history.

## UI

The screen remains monochrome and uses existing cards, spacing, type, and rounded controls. The range selector is a three-option pill group. Summary metrics use a responsive two-column card grid on phones and naturally expand on tablets.

Charts use native `View` elements only. Bar widths are derived from each value relative to the largest value in the section, with a small visible minimum for nonzero values. No gradients, animation, chart library, or horizontal scrolling are introduced.

The screen reloads when it gains focus and whenever the selected range changes. A loading state prevents stale range labels. If no sales exist, summary cards show zero, sales sections show a clear empty message, and current low-stock information still appears.

## Repository Interfaces

`src/features/analytics/analytics-types.ts` will define:

```ts
export type DashboardRange = "today" | "7d" | "30d";
export type SalesDay = { date: string; salesPaise: number };
export type PaymentTotal = { method: PaymentMethod; salesPaise: number };
export type ProductSales = {
  key: string;
  productId: string | null;
  name: string;
  units: number;
  revenuePaise: number;
};
export type LowStockProduct = {
  id: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
};
export type DashboardAnalytics = {
  totalSalesPaise: number;
  billCount: number;
  totalUnits: number;
  averageBillPaise: number;
  lowStockCount: number;
  salesByDay: SalesDay[];
  payments: PaymentTotal[];
  topProducts: ProductSales[];
  recentBills: Bill[];
  lowStockProducts: LowStockProduct[];
};
```

`getDashboardRange(range, now)` will calculate local boundaries and daily buckets. `createAnalyticsRepository(db).getDashboardAnalytics(rangeDefinition)` will execute parameterized aggregate queries and fill missing days/payment methods in TypeScript.

## Error Handling

Repository failures do not crash navigation. The dashboard displays a concise retry state and preserves the selected range. Navigation targets use durable bill and product IDs only. Invalid or empty aggregate values normalize to zero.

## Testing and Verification

Unit tests cover local range boundaries, number of daily buckets, payment ordering, and missing-day normalization. Repository tests use an in-memory Expo SQLite database seeded with completed and void bills, multiple payment methods, product/custom-item snapshots, and low-stock products. They verify totals, exclusions, rankings, and empty ranges.

Project verification requires the full Vitest suite, TypeScript, ESLint, and Android Expo export. Simulator QA on iPhone 15 covers each range, zero data, long product names, scrolling, and navigation from recent/low-stock rows.
