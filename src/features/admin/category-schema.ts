import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(150),
  slug: z.string().trim().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for the slug."),
  blurb: z.string().trim().max(1000),
  sortOrder: z.coerce.number().int().min(0).max(1000000),
  imageId: z.union([z.uuid(), z.literal("").transform(() => null)]),
  isActive: z.boolean(),
});
