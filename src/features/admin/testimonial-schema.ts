import { z } from "zod";

export const testimonialFormSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required.").max(150),
  role: z.string().trim().max(150),
  quote: z.string().trim().min(1, "Testimonial text is required.").max(2000),
  rating: z.coerce.number().min(1).max(5).multipleOf(0.5),
  sortOrder: z.coerce.number().int().min(0).max(1000000),
  isActive: z.boolean(),
});
