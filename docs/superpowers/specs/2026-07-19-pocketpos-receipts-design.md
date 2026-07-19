# PocketPOS Receipts, PDF, and Printing Design

## Scope

PocketPOS will turn every saved bill into a reusable monochrome thermal receipt, generate a shareable PDF, and open the Android or iOS system print interface. Checkout will expose both **Save bill** and **Save & print**. Bill details will expose **Print receipt** and **Share PDF** so staff can retry either operation later.

Direct Bluetooth and ESC/POS integration is excluded from this phase. The implementation will use Expo Print and Expo Sharing behind small service boundaries so a hardware-specific printer can replace the system printer later without changing billing persistence or receipt rendering.

## Receipt Rendering

A pure `renderReceiptHtml` function will accept a business, bill, and saved bill-item snapshots. It will return self-contained HTML with inline CSS and escaped user-entered text.

The receipt will include:

- business name, address, phone, and optional GST number;
- bill number, date and time, and payment method;
- wrapped item names, quantities, unit prices, and line totals;
- subtotal, discount, tax, grand total, and total item count;
- the configured receipt footer.

The business `receiptWidth` selects either a 58 mm or 80 mm page width. Height remains content-driven. The output stays black and white, uses system monospace fonts, and avoids images in this phase so printing works consistently offline.

## Services and Persistence

Receipt work happens only after the bill transaction succeeds. A receipt service will load the saved bill, its item snapshots, and business settings, render the HTML, and delegate to Expo Print.

- `printBillReceipt` opens the system print interface. On success it stores `print_status = 'printed'`; on failure it stores `print_status = 'failed'` and rethrows a readable error.
- `createBillPdf` uses Expo Print's file generation and stores the returned local URI in `pdf_uri`.
- `shareBillPdf` reuses an existing `pdf_uri` when present, otherwise creates the PDF, verifies that sharing is available, and opens the system share sheet.

The bill repository will provide narrow methods for updating print status and PDF URI. A print or PDF failure never deletes or rolls back a bill, its items, stock deductions, or inventory movements.

## User Flow

The Sell screen keeps **Save bill** as the safe primary action and adds **Save & print** as a secondary action. Both complete the exact same atomic bill transaction and clear the cart. Save & print then opens the saved bill detail screen and starts printing. If printing is cancelled or fails, the saved bill remains visible with a retry action.

Bill details show the current print status and PDF readiness. **Print receipt** can be used repeatedly. **Share PDF** creates the file on first use and reuses it later. Buttons show a busy state and prevent duplicate operations. Failures appear in a native alert with an explicit statement that the bill remains saved.

## Error Handling

Missing bills, items, or business settings produce readable errors before invoking platform APIs. Print cancellation or platform failure marks printing as failed without affecting the sale. Unsupported sharing displays a readable message and preserves any generated PDF URI. Repository update failures surface to the caller instead of reporting a false success.

## Testing and Verification

Unit tests will cover HTML escaping, 58/80 mm selection, optional business fields, wrapped item structure, currency totals, and repository status updates. Service tests will use injected print/share adapters to verify PDF reuse and success/failure persistence without invoking native UI.

Project verification requires the full Vitest suite, TypeScript, ESLint, and Android Expo export. Simulator QA will cover both checkout actions, bill-detail status, PDF creation, and opening the print/share interfaces. Physical thermal-paper sizing remains a final Android printer-device check.

## Dependencies

Use Expo SDK 57-compatible versions of `expo-print` and `expo-sharing`. No chart, Bluetooth, filesystem, or receipt-template dependency is introduced in this phase.
