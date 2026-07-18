# PocketPOS Foundation Design

## Scope

PocketPOS is an offline-first Android billing and inventory app for small businesses. This first delivery establishes the production-ready foundation described in the proposal: Expo Router navigation, local SQLite persistence, versioned migrations, business setup, product and stock management, seed data, a monochrome brand system, and Android build documentation.

Billing, receipt printing, PDF sharing, bill history, analytics, and backup workflows are represented by navigation-ready screens and stable domain boundaries, but their complete behavior belongs to later delivery phases. Native Bluetooth or ESC/POS integration is explicitly excluded.

## Product and Visual Direction

PocketPOS uses a functional black-and-white interface optimized for Android phones and tablets. The system uses neutral surfaces, high contrast, generous whitespace, `rounded-xl` controls, large touch targets, and Lucide icons. It avoids gradients, decorative color, dense dashboards, and unnecessary animation.

The original PocketPOS logo combines a simplified pocket and receipt motif. It will be delivered as the Android app icon, adaptive icon foreground, splash asset, and reusable in-app mark. Billing and receipt surfaces remain monochrome to match thermal-print output.

## Architecture

The app uses Expo, React Native, Expo Router, TypeScript, and pnpm. Expo Router owns navigation. SQLite is the durable source of truth. Zustand is reserved for temporary UI state such as a future active cart. React Hook Form and Zod provide form state and validation.

Database access is implemented as a lightweight typed repository layer over explicit SQL. This keeps SQL visible and transactions predictable while preventing queries from leaking into UI components. It is intentionally smaller than adopting an ORM for this foundation.

The main layers are:

- `app/`: route composition and screen entry points.
- `src/components/`: reusable visual primitives and feature components.
- `src/db/`: database connection, migration runner, schema SQL, and repositories.
- `src/features/`: business setup, products, inventory, and future domain modules.
- `src/services/`: orchestration boundaries for billing, printing, PDF, and backup features.
- `src/utils/`: currency, identifiers, validation helpers, and dates.
- `src/types/`: shared domain types.

UI components call feature hooks or services. Services call repositories. Repositories alone issue SQL. No database query is placed directly in a route component.

## Navigation and Screens

The root navigator checks whether a business record exists after migrations finish. A first-time user is routed to Business Setup; returning users enter the tab shell.

The tab shell contains Sell, Bills, Inventory, Dashboard, and Settings. In this foundation:

- Sell, Bills, and Dashboard are polished foundation states that explain the upcoming workflow without fake functionality.
- Inventory provides searchable product listing, low-stock visibility, product creation, product editing, enable/disable behavior, and manual stock adjustment.
- Settings shows saved business details and allows them to be edited.
- Product detail exposes stock and inventory movement history.

Phone layouts use a single column. Wider screens constrain content sensibly and allow list/detail or grid-friendly spacing without creating a separate tablet application.

## Local Data Model

The initial versioned migration creates:

- `businesses` for local business and receipt configuration.
- `products` for price, stock, tracking, activity, and low-stock thresholds.
- `inventory_movements` for all explicit stock changes.
- `bills` and `bill_items` as forward-compatible billing tables.
- `app_settings` for lightweight persisted configuration and bill sequence state.
- `schema_migrations` for safe incremental upgrades.

Money is stored as integer paise. Timestamps use ISO-8601 strings. IDs are locally generated strings. Completed bills will never be deleted. Product changes never rewrite historical bill-item snapshots.

Migrations run in order and each migration is recorded only after its transaction succeeds. Application upgrades reuse the same SQLite filename, preserving existing data.

## Repository and Transaction Boundaries

Repositories expose narrow typed operations for business settings, products, and inventory movements. Product creation with opening stock and every manual stock adjustment run transactionally and write an inventory movement. Stock is never changed silently.

Future bill completion will be owned by a billing service that atomically increments the bill sequence, creates bill and bill-item snapshots, decrements tracked inventory, and writes movements. Printing remains outside this transaction behind a `ReceiptPrinter` interface, so printing failure can never roll back a saved bill.

## Validation and Error Handling

Zod schemas enforce required business name, supported currency and receipt width, valid non-negative prices, integer stock quantities, and coherent stock thresholds. Repository errors are translated into user-facing messages at feature boundaries.

Database initialization has explicit loading and failure states. Empty product lists offer a direct add-product action. Destructive actions such as disabling a product or replacing local data require confirmation; routine saves do not.

## Testing Strategy

Development follows red-green-refactor for domain behavior. Unit tests cover currency parsing and formatting, validation, migration ordering, product mapping, low-stock rules, and stock movement calculations. Repository integration tests use an isolated SQLite database where supported by the Expo SQLite test environment. Focused component tests cover critical form states without testing implementation details.

Verification requires a clean TypeScript check, lint run, complete test suite, and Expo export/config validation. Android APK generation is documented and configured, but a cloud EAS build may require the owner’s Expo credentials and network access.

## Deliverables and Commit Sequence

1. Design specification.
2. Scaffold: Expo Router, test tooling, tab navigation, monochrome theme, and PocketPOS assets.
3. Data foundation: versioned migrations, models, repositories, and tests.
4. Features: business setup, product CRUD, stock adjustments, and seed helper.
5. Documentation: local development, development APK, release APK, sideloading, and safe upgrades.

Every commit uses a lowercase Conventional Commit description and includes the required Codex co-author trailer.

## Explicit Non-Goals

This delivery does not implement complete billing, printing, PDF generation, bill history actions, dashboard analytics, backup restore, cloud sync, authentication, multi-device support, supplier management, or Play Store publishing. The architecture includes clean seams for these phases without speculative implementations.

## Acceptance Criteria

- A new user can complete business setup entirely offline.
- A returning user reaches the five-tab application shell.
- Business settings persist locally and can be edited.
- Products can be created, edited, searched, disabled, and assigned opening stock.
- Manual stock changes create auditable inventory movements.
- Low-stock status is visible and calculated consistently.
- Seed data can be added deliberately for development.
- Database migrations are versioned and preserve data across application upgrades.
- PocketPOS branding is original, monochrome, and included in Android and in-app assets.
- The repository includes tests and clear local/APK build instructions.
