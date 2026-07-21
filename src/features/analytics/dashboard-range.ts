import type { PaymentMethod } from "@/src/types/domain";
import type {
  DashboardRange,
  DashboardRangeDefinition,
  PaymentTotal,
  SalesDay,
} from "./analytics-types";
const key = (d: Date) =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
export const getDashboardRange = (
  range: DashboardRange,
  now = new Date(),
): DashboardRangeDefinition => {
  const count = range === "today" ? 1 : range === "7d" ? 7 : 30;
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - count);
  const days = Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      key: key(d),
      label: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d),
    };
  });
  return { startIso: start.toISOString(), endIso: end.toISOString(), days };
};
export const fillSalesDays = (
  definition: DashboardRangeDefinition,
  rows: SalesDay[],
): SalesDay[] => {
  const values = new Map(rows.map((x) => [x.date, Number(x.salesPaise)]));
  return definition.days.map((x) => ({ date: x.label, salesPaise: values.get(x.key) ?? 0 }));
};
const methods: PaymentMethod[] = ["cash", "upi", "card", "other"];
export const fillPaymentTotals = (rows: PaymentTotal[]): PaymentTotal[] => {
  const values = new Map(rows.map((x) => [x.method, Number(x.salesPaise)]));
  return methods.map((method) => ({ method, salesPaise: values.get(method) ?? 0 }));
};
