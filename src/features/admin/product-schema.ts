import { z } from "zod";
import { productTags } from "@/features/products/types";

const text = (label: string, max = 300) => z.string().trim().min(1, `${label} is required.`).max(max);
const rupees = z.string().trim().regex(/^\d{1,7}(?:\.\d{1,2})?$/, "Enter a valid rupee amount.").transform((v) => Math.round(Number(v) * 100));

export const productFormSchema = z.object({
  name: text("Name", 150), slug: text("Slug", 120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  categoryId: z.uuid(), status: z.enum(["active", "draft", "archived"]), price: rupees.refine((v) => v > 0, "Price must be greater than zero."),
  compareAtPrice: z.union([rupees, z.literal("").transform(() => null)]),
  stock: z.coerce.number().int().min(0).max(1000000), rating: z.coerce.number().min(0).max(5), reviewCount: z.coerce.number().int().min(0).max(10000000),
  unit: text("Unit", 80), origin: text("Origin", 150), harvest: text("Harvest", 150), floralSource: text("Floral source", 150), tasteNotes: text("Taste notes", 300),
  summary: text("Summary", 1000), description: text("Description", 10000), listedOn: z.iso.date(), sortOrder: z.coerce.number().int().min(0).max(1000000),
  tags: z.array(z.enum(productTags)), imageIds: z.array(z.uuid()).max(20),
}).refine((value) => value.compareAtPrice === null || value.compareAtPrice > value.price, { path: ["compareAtPrice"], message: "Compare-at price must be higher than the price." });
