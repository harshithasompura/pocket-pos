# PocketPOS APK Build Guide

PocketPOS uses the stable Android package name `com.harshithasompura.pocketpos`. Do not change this identifier after client installation; Android treats a different package as a separate app.

## Local Android development

```bash
pnpm install
pnpm android
```

This opens Expo Go on an available emulator/device. If Expo Go cannot support a future native printer package, switch to a development build.

## Configure EAS once

```bash
pnpm dlx eas-cli login
pnpm dlx eas-cli build:configure
```

Keep the existing `eas.json` profiles. All three Android profiles explicitly produce APK files.

## Development APK

```bash
pnpm dlx eas-cli build --platform android --profile development
```

Use this profile when native modules or direct thermal-printer testing are introduced. It includes the Expo development client.

## Internal test APK

```bash
pnpm dlx eas-cli build --platform android --profile preview
```

This is the simplest installable APK for client testing without development menus.

## Release APK

```bash
pnpm dlx eas-cli build --platform android --profile production
```

Download the APK from the EAS build page and retain the signing credentials managed by EAS.

## Install manually

1. Transfer the APK to the Android device.
2. Open it from Files or Downloads.
3. Allow installation from that source when Android prompts.
4. Install and open PocketPOS.

With Android platform tools installed, USB installation is also available:

```bash
adb install path/to/pocketpos.apk
```

## Update without losing data

Export a PocketPOS backup from Settings before every update. This provides a portable recovery copy even though an in-place update normally keeps the local database.

Build with the same package name and signing key, then install over the existing app:

```bash
adb install -r path/to/pocketpos-new.apk
```

Do not uninstall the old app first. Uninstalling removes its private SQLite database. On first launch after an in-place update, PocketPOS runs any new versioned migrations before rendering the application.

## Client handoff

Before sending a client build:

1. Complete every command under Pre-release checks.
2. Install the production APK on a clean Android device.
3. Create a business and product, complete and void a test bill, then export a backup.
4. Print both 58 mm and 80 mm receipts with the client's actual printer.
5. Give the client the APK, the saved backup, and [BACKUP_RESTORE.md](BACKUP_RESTORE.md).

Physical Android installation and printer output are release gates because neither is fully represented by an iOS simulator.

## Pre-release checks

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm export
pnpm dlx expo-doctor
```
