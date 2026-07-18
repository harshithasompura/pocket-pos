# PocketPOS

PocketPOS is a practical offline-first Android billing and inventory app for small businesses. This repository contains the foundation release: local business setup, product catalogue management, stock auditing, versioned SQLite migrations, and a five-tab shell ready for billing, receipts, and analytics.

![PocketPOS mark](assets/pocketpos-mark.png)

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

## Foundation features

- First-run business and receipt setup
- Five-tab phone/tablet navigation
- Product creation, editing, search, and enable/disable workflow
- Opening stock and manual stock adjustments
- Auditable inventory movement history
- Low-stock filters and warnings
- Integer-paise currency calculations
- Local SQLite source of truth with transactional, versioned migrations
- Development-only idempotent demo data
- Android development, preview, and release APK profiles

Billing, printing, PDF sharing, bill history actions, dashboard analytics, and backup/restore are intentionally reserved for later phases.

## Requirements

- Node.js 20+
- pnpm 10+
- Android Studio and an Android emulator, or an Android device with Expo Go
- An Expo account only when creating cloud APK builds

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
src/types/                   domain models
src/utils/                   currency, dates, IDs, stock rules
docs/                        architecture and APK guides
```

Database queries stay inside repositories. Screen components use repository methods and never issue SQL directly.

## Offline guarantees

Business details, products, stock quantities, and movement history are stored in `pocketpos.db`. Product stock changes are transactional and always create movement records. Installing a newer APK with the same Android package name and signing key preserves the database while migrations apply incrementally.

## Android builds

See [APK_BUILD.md](docs/APK_BUILD.md) for development and release APK instructions. Architecture and data-boundary details are in [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Screenshots

Verified Android screenshots will be added after the first emulator/device capture. See [screenshots/README.md](docs/screenshots/README.md) for the capture checklist and current status.
