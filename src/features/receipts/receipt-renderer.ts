import type { Bill, BillItem, Business } from "@/src/types/domain";
import { formatCurrency } from "@/src/utils/currency";
import { formatDateTime } from "@/src/utils/dates";

type ReceiptInput = { business: Business; bill: Bill; items: BillItem[] };

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const line = (label: string, value: string) =>
  `<div class="row"><span>${label}</span><span>${value}</span></div>`;

export const renderReceiptHtml = ({ business, bill, items }: ReceiptInput): string => {
  const width = business.receiptWidth === 80 ? 80 : 58;
  const currency = (paise: number) => escapeHtml(formatCurrency(paise, business.currency));
  const details = [
    business.address ? `<div>Address: ${escapeHtml(business.address)}</div>` : "",
    business.phone ? `<div>Phone: ${escapeHtml(business.phone)}</div>` : "",
    business.gstNumber ? `<div>GST: ${escapeHtml(business.gstNumber)}</div>` : "",
  ].join("");
  const itemRows = items
    .map(
      (item) => `
    <div class="item">
      <div class="item-name">${escapeHtml(item.name)}</div>
      <div class="row">
        <span>${item.quantity} × ${currency(item.unitPricePaise)}</span>
        <strong>${currency(item.lineTotalPaise)}</strong>
      </div>
    </div>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: ${width}mm auto; margin: 3mm; }
    * { box-sizing: border-box; }
    body { width: ${width - 6}mm; margin: 0; color: #000; background: #fff; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; line-height: 1.35; }
    .center { text-align: center; }
    .business { font-size: 15px; font-weight: 800; overflow-wrap: anywhere; }
    .rule { border-top: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; gap: 8px; }
    .row > :last-child { text-align: right; }
    .item { margin: 7px 0; }
    .item-name { font-weight: 700; overflow-wrap: anywhere; }
    .total { font-size: 13px; font-weight: 800; margin-top: 5px; }
    .receipt-footer { margin-top: 10px; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <header class="center">
    <div class="business">${escapeHtml(business.name)}</div>
    ${details}
  </header>
  <div class="rule"></div>
  ${line("Bill", escapeHtml(bill.billNumber))}
  ${line("Date", escapeHtml(formatDateTime(bill.createdAt)))}
  ${line("Payment", bill.paymentMethod.toUpperCase())}
  <div class="rule"></div>
  ${itemRows}
  <div class="rule"></div>
  ${line("Subtotal", currency(bill.subtotalPaise))}
  ${bill.discountPaise > 0 ? line("Discount", `− ${currency(bill.discountPaise)}`) : ""}
  ${bill.taxPaise > 0 ? line("Tax", currency(bill.taxPaise)) : ""}
  <div class="row total"><span>Grand total</span><span>${currency(bill.totalPaise)}</span></div>
  <div class="center">${bill.totalUnits} ${bill.totalUnits === 1 ? "item" : "items"}</div>
  ${business.receiptFooter ? `<div class="receipt-footer center">${escapeHtml(business.receiptFooter)}</div>` : ""}
</body>
</html>`;
};
