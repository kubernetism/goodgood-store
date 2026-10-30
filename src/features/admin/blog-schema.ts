import { z } from "zod";
import { blogCategories } from "@/features/blog/data";
import { parseBlogBody } from "@/features/blog/editor-body";

const required = (label: string, max: number) => z.string().trim().min(1, `${label} is required.`).max(max);
export const blogFormSchema = z.object({
  title: required("Title", 200),
  slug: required("Slug", 120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for the slug."),
  excerpt: required("Excerpt", 1000),
  category: z.enum(blogCategories.map((item) => item.slug) as [typeof blogCategories[number]["slug"], ...typeof blogCategories[number]["slug"][]]),
  author: required("Author", 150),
  publishedOn: z.iso.date(),
  tags: z.string().max(1000).transform((value) => [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))]).refine((tags) => tags.length <= 20 && tags.every((tag) => tag.length <= 50), "Use up to 20 tags, each no more than 50 characters."),
  body: required("Article", 50000).transform(parseBlogBody).refine((blocks) => blocks.length > 0 && blocks.every((block) => block.type === "list" ? block.items.length > 0 : block.text.length > 0), "Article content cannot be empty."),
  coverId: z.union([z.uuid(), z.literal("").transform(() => null)]),
  isPublished: z.boolean(),
});
