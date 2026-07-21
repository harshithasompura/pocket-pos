# PocketPOS

<p align="center">
  <img src="assets/pocketpos-mark.png" alt="PocketPOS mark" width="96" />
</p>

An offline-first Point of Sale application built with React Native, Expo, and SQLite.

PocketPOS explores how a mobile system can provide transaction-safe local persistence, layered architecture, and reliable billing without requiring a backend.

PocketPOS works entirely offline while providing:

- Billing
- Inventory
- Analytics
- Receipt generation
- Backup & Restore

**Designed for reliability over connectivity.**

## Highlights

- Offline-first mobile application
- SQLite as the single source of truth
- Transactional checkout and inventory updates
- Native receipt generation
- Local analytics powered by SQLite

## Why I built this

PocketPOS was built to explore how a modern mobile application can deliver reliable billing without depending on cloud connectivity. The project focuses on transactional integrity, offline-first design, and a maintainable layered architecture using React Native and SQLite.

## Architecture

```text
Expo Router
     ↓
Feature Screens
     ↓
Services
     ↓
Repositories
     ↓
SQLite
```

Full detail, including the routing and printing boundaries, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Design principles

- Offline-first
- Transactional consistency
- Monochrome UI
- Simple deployment
- No backend required

## Built with

![Expo](https://img.shields.io/badge/Expo-000000?style=flat&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo_Router-000000?style=flat&logo=expo&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat&logo=reacthookform&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=flat)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)

## Features

**Billing**

- Product search, cart quantities, and custom line items with integer-paise currency calculations
- Offline checkout with stock validation and automatic inventory deduction
- Fixed or percentage discounts, cash/UPI/card/other payments
- Sequential invoice numbers, bill history, and completed bill details
- Monochrome 58 mm / 80 mm receipt rendering plus shareable bill PDFs
- Auditable bill voiding with transactional stock restoration

**Inventory**

- Product creation, editing, search, and enable/disable workflow
- Opening stock and manual stock adjustments
- Auditable inventory movement history
- Low-stock filters and warnings

**Analytics**

- Offline Today, 7-day, and 30-day sales dashboard with native charts
- Top products and payment totals
- Recent bills and low-stock summaries

**Reliability**

- Atomic transactions for checkout, voiding, and stock adjustments
- Versioned JSON backup, native sharing, validation, and atomic full restore
- Local SQLite source of truth with transactional, versioned migrations
- First-run business and receipt setup, five-tab phone/tablet navigation
- Development-only idempotent demo data, native Android APK builds via Expo Application Services

Direct ESC/POS printer integration is intentionally reserved for a later phase; PocketPOS currently prints through the device system print sheet and HTML-rendered receipts.

## Requirements

- Node.js 20+
- pnpm 10+
- Android Studio and an Android emulator, or an Android device with Expo Go

## Run locally

```bash
pnpm install
pnpm start
```

Press `a` to open Android, or scan the QR code with Expo Go. PocketPOS does not need internet after the development bundle is loaded.

Useful checks:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm export
```

## Project structure

```text
app/                         Expo Router routes
src/components/              shared monochrome UI and branding
src/db/                      SQLite setup, migrations, repositories
src/features/setup/          business setup and validation
src/features/inventory/      product and stock workflows
src/features/billing/        cart, checkout, and bill history
src/features/analytics/      offline dashboard queries and UI
src/types/                   domain models
src/utils/                   currency, dates, IDs, stock rules
docs/                        architecture and APK guides
```

Most data access is encapsulated in repositories; transaction-oriented services (billing, backup, receipts) coordinate SQL that spans multiple entities. Screen components never issue SQL directly.

## Offline guarantees

Business details, products, stock quantities, movement history, and completed bills are stored in `pocketpos.db`. Checkout validates stock and saves the invoice, item snapshots, stock deductions, and movement records in one transaction. Installing a newer APK with the same Android package name and signing key preserves the database while migrations apply incrementally.

## Android builds

See [APK_BUILD.md](docs/APK_BUILD.md) for development and release APK instructions. Data transfer and recovery are covered in [BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md), and architecture details are in [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Screenshots

Captured from PocketPOS running locally on an iPhone 15 simulator with offline demo data.

| Checkout                                                                            | Dashboard                                                                                        | Inventory                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| <img src="docs/screenshots/sell.png" alt="PocketPOS new bill screen" width="260" /> | <img src="docs/screenshots/dashboard.png" alt="PocketPOS offline sales dashboard" width="260" /> | <img src="docs/screenshots/inventory.png" alt="PocketPOS inventory catalogue" width="260" /> |

| Voided bill                                                                                        | Setup                                                                               | Backup                                                                                                       |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| <img src="docs/screenshots/voided-bill.png" alt="PocketPOS voided bill with reason" width="260" /> | <img src="docs/screenshots/setup.png" alt="PocketPOS business setup" width="260" /> | <img src="docs/screenshots/settings-backup.png" alt="PocketPOS portable data backup controls" width="260" /> |

The [launch screen](docs/screenshots/splash.png) and full capture notes are available in [docs/screenshots](docs/screenshots/README.md).
