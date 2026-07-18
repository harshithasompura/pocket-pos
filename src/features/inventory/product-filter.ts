import type { Product } from "@/src/types/domain";
import { isLowStock } from "@/src/utils/stock";

export type ProductFilterMode = "all" | "low" | "inactive";

export const filterProducts = (products: readonly Product[], query: string, mode: ProductFilterMode) => {
  const search = query.trim().toLocaleLowerCase();
  return products.filter((product) => {
    const matchesSearch = !search || product.name.toLocaleLowerCase().includes(search) || product.sku?.toLocaleLowerCase().includes(search);
    const matchesMode = mode === "all" ? product.isActive : mode === "low" ? product.isActive && isLowStock(product) : !product.isActive;
    return matchesSearch && matchesMode;
  });
};
