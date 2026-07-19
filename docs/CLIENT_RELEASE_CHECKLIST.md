# PocketPOS Client Release Checklist

## Automated gates

- [ ] `pnpm test`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm export`
- [ ] `pnpm dlx expo-doctor`
- [ ] Production APK built from the committed `main` revision

## Android device gates

- [ ] Fresh APK install opens without Expo Go
- [ ] Business setup survives a full app restart
- [ ] Product create/edit and stock adjustment work offline
- [ ] Completed bill deducts tracked stock and increments the bill number
- [ ] Voided bill restores tracked stock and remains visible with its reason
- [ ] Dashboard totals match the tested bills
- [ ] Backup exports, restores after a disposable edit, and preserves the next bill number
- [ ] APK update installs over the previous version without uninstalling or losing data

## Printer gates

- [ ] 58 mm receipt is legible, aligned, and cuts without clipping
- [ ] 80 mm receipt is legible and aligned
- [ ] Business name, tax, discount, payment method, and footer are correct
- [ ] PDF/share fallback works when the printer is unavailable

## Handoff

- [ ] Client receives the production APK and build date
- [ ] Client receives backup/restore instructions and creates the first external backup
- [ ] Signing credentials remain controlled by the project owner
- [ ] Known limitation recorded: direct Bluetooth/USB ESC/POS transport is not included
