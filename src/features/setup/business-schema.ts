import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().trim().min(1, "Business name is required"),
  address: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  gstNumber: z.string().trim().optional().default(""),
  currency: z.string().trim().min(3).max(3).default("INR"),
  receiptWidth: z.union([z.literal(58), z.literal(80)]).default(58),
  receiptFooter: z.string().trim().optional().default("Thank you for your business"),
  taxEnabled: z.boolean().default(false),
  defaultTaxPercentage: z.number().min(0).max(100).default(0),
  inventoryTrackingEnabled: z.boolean().default(true),
});

export type BusinessInput = z.input<typeof businessSchema>;
export type BusinessValues = z.output<typeof businessSchema>;
