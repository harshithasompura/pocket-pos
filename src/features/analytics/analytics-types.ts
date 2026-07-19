import type { Bill, PaymentMethod } from "@/src/types/domain";
export type DashboardRange = "today" | "7d" | "30d";
export type DashboardRangeDefinition = { startIso: string; endIso: string; days: { key: string; label: string }[] };
export type SalesDay = { date: string; salesPaise: number };
export type PaymentTotal = { method: PaymentMethod; salesPaise: number };
export type ProductSales = { key: string; productId: string | null; name: string; units: number; revenuePaise: number };
export type LowStockProduct = { id: string; name: string; stockQuantity: number; lowStockThreshold: number };
export type DashboardAnalytics = { totalSalesPaise: number; billCount: number; totalUnits: number; averageBillPaise: number; lowStockCount: number; salesByDay: SalesDay[]; payments: PaymentTotal[]; topProducts: ProductSales[]; recentBills: Bill[]; lowStockProducts: LowStockProduct[] };

