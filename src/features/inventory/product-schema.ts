import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  sku: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default(""),
  sellingPricePaise: z.number().int().nonnegative(),
  stockQuantity: z.number().int(),
  lowStockThreshold: z.number().int().nonnegative().default(0),
  trackInventory: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const stockAdjustmentSchema = z.object({
  movementType: z.enum(["stock_added", "manual_correction", "damaged", "other"]),
  quantityChange: z.number().int().refine((value) => value !== 0, "Quantity cannot be zero"),
  note: z.string().trim().optional().default(""),
});

export type ProductValues = z.output<typeof productSchema>;
export type StockAdjustmentValues = z.output<typeof stockAdjustmentSchema>;
