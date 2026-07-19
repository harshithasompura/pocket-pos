# PocketPOS Backup and Restore

PocketPOS stores its working data only on the device. A backup is the portable recovery copy for moving to another device, protecting an upgrade, or recovering after loss.

## Create a backup

1. Open **Settings** and scroll to **Data backup**.
2. Tap **Export & share backup**.
3. Save the JSON file to a secure location outside the phone, such as the client's private cloud drive or an encrypted computer folder.

Create a backup at the end of each business day and immediately before installing an update. Keep more than one dated copy. The file contains business details, products, stock history, bills, and app settings, so treat it as confidential business data.

## Restore a backup

1. Put the `pocketpos-backup-YYYY-MM-DD.json` file on the destination device.
2. Open **Settings**, tap **Restore backup**, and select the file.
3. Review the export date and record counts in the confirmation.
4. Tap **Replace all data**, then close and reopen PocketPOS.
5. Confirm the business name, product stock, recent completed and voided bills, and the next bill number before trading.

Restore replaces all current PocketPOS data; it does not merge two devices. PocketPOS validates the file before replacement and performs the database change atomically, so a failed restore leaves the existing database intact.

## Move to another device

Export from the old device, transfer the JSON file securely, install the same or newer PocketPOS version on the new device, and restore there. Keep the old device and original backup unchanged until the verification in step 5 succeeds.

## Limitations

- Only PocketPOS version 1 JSON backups are accepted.
- Backups are not encrypted by the app; protection depends on the storage or transfer method.
- Uninstalling PocketPOS deletes its private working database. Export first.
- A physical receipt printer is separate from the backup and must be configured and tested again on a replacement device.
