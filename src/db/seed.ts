import type { SQLiteDatabase } from "expo-sqlite";
import { businessSchema } from "@/src/features/setup/business-schema";
import { productSchema } from "@/src/features/inventory/product-schema";
import { createBusinessRepository } from "./repositories/business-repository";
import { createProductRepository } from "./repositories/product-repository";

export const seedDemoData = async (db: SQLiteDatabase) => {
  const businesses = createBusinessRepository(db); let business = await businesses.get();
  if (!business) business = await businesses.save(businessSchema.parse({ name: "PocketPOS Demo", currency: "INR", receiptWidth: 58 }));
  const products = createProductRepository(db); if ((await products.list()).length > 0) return { created: 0 };
  const samples = [
    { name: "Masala Tea", sku: "TEA-001", category: "Beverages", sellingPricePaise: 3000, stockQuantity: 18, lowStockThreshold: 5, trackInventory: true, isActive: true },
    { name: "Filter Coffee", sku: "COF-001", category: "Beverages", sellingPricePaise: 4500, stockQuantity: 4, lowStockThreshold: 5, trackInventory: true, isActive: true },
    { name: "Paper Bag", sku: "BAG-001", category: "Packaging", sellingPricePaise: 500, stockQuantity: 60, lowStockThreshold: 10, trackInventory: true, isActive: true },
  ];
  for (const sample of samples) await products.create(business.id, productSchema.parse(sample));
  return { created: samples.length };
};
