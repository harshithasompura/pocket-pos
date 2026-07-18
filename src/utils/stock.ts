import type { Product } from "@/src/types/domain";

type StockState = Pick<Product, "trackInventory" | "stockQuantity" | "lowStockThreshold">;

export const isLowStock = ({ trackInventory, stockQuantity, lowStockThreshold }: StockState) =>
  trackInventory && stockQuantity <= lowStockThreshold;
