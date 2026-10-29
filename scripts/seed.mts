/**
 * Loads the original catalogue (7 categories, 26 products) into the database.
 * Idempotent and non-destructive: rows that already exist (matched by slug)
 * are left untouched, so re-running never overwrites admin edits.
 *
 * Usage: npm run db:seed
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inArray } from "drizzle-orm";
import { categories, products } from "../src/db/schema";
import {
  categories as seedCategories,
  categoryHighlights,
  products as seedProducts,
} from "../src/db/seed/catalog-seed";

/** Placeholder opening stock; the owner sets real counts in /admin/products. */
const OPENING_STOCK = 25;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL must be set (see .env.example).");
  process.exit(1);
}
const db = drizzle({ client: neon(url) });

const insertedCategories = await db
  .insert(categories)
  .values(
    seedCategories.map((category, index) => ({
      slug: category.slug,
      name: category.name,
      blurb: category.blurb,
      highlights: [...categoryHighlights[category.slug]],
      sortOrder: index,
    })),
  )
  .onConflictDoNothing({ target: categories.slug })
  .returning({ slug: categories.slug });

const categoryIds = new Map(
  (
    await db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(inArray(categories.slug, seedCategories.map((c) => c.slug)))
  ).map((row) => [row.slug, row.id]),
);

const insertedProducts = await db
  .insert(products)
  .values(
    seedProducts.map((product, index) => {
      const categoryId = categoryIds.get(product.category);
      if (!categoryId) throw new Error(`Missing category ${product.category}`);
      return {
        slug: product.slug,
        name: product.name,
        categoryId,
        status: "active" as const,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        stock: OPENING_STOCK,
        rating: product.rating,
        reviewCount: product.reviewCount,
        unit: product.unit,
        origin: product.origin,
        harvest: product.harvest,
        floralSource: product.floralSource,
        tasteNotes: product.tasteNotes,
        summary: product.summary,
        description: product.description,
        tags: [...product.tags],
        listedOn: product.listedOn,
        sortOrder: index,
      };
    }),
  )
  .onConflictDoNothing({ target: products.slug })
  .returning({ slug: products.slug });

console.log(
  `Seed complete: ${insertedCategories.length}/${seedCategories.length} categories and ` +
    `${insertedProducts.length}/${seedProducts.length} products inserted (existing rows kept).`,
);
