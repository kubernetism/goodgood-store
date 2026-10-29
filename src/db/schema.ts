import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { CategoryHighlight } from "@/features/products/types";

/*
 * Database schema. Money is integer paisa (Rs 1 = 100 paisa), timestamps are
 * timestamptz, and integrity rules live in the database (CHECK, FK, UNIQUE)
 * so a bug in the app can never oversell stock or store a negative price.
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const productStatus = pgEnum("product_status", ["active", "draft", "archived"]);
export const orderStatus = pgEnum("order_status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]);
export const bannerPlacement = pgEnum("banner_placement", ["hero", "deal", "announcement"]);

/** Uploaded images. `url` is the public URL at upload time; `storageKey` locates the object. */
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("media_storage_key_unique").on(t.storageKey),
    index("media_created_at_idx").on(t.createdAt),
    check("media_alt_not_blank", sql`length(trim(${t.alt})) > 0`),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    blurb: text("blurb").notNull().default(""),
    /** "Why you'll love it" bullets on every product page in the category. */
    highlights: jsonb("highlights").$type<CategoryHighlight[]>().notNull().default([]),
    imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("categories_slug_unique").on(t.slug),
    check("categories_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    status: productStatus("status").notNull().default("draft"),
    /** Paisa. */
    price: integer("price").notNull(),
    /** Paisa; the "was" price, only when on sale. */
    compareAtPrice: integer("compare_at_price"),
    stock: integer("stock").notNull().default(0),
    rating: doublePrecision("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    unit: text("unit").notNull(),
    origin: text("origin").notNull(),
    harvest: text("harvest").notNull(),
    floralSource: text("floral_source").notNull(),
    tasteNotes: text("taste_notes").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    /** Drives "Sort by latest". */
    listedOn: date("listed_on", { mode: "string" }).notNull(),
    /** Catalogue ("Default sorting") order. */
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_unique").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_status_idx").on(t.status),
    check("products_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("products_price_positive", sql`${t.price} > 0`),
    check("products_compare_at_above_price", sql`${t.compareAtPrice} is null or ${t.compareAtPrice} > ${t.price}`),
    // The last line of defence against overselling: an order that would take
    // stock below zero fails and its whole transaction rolls back.
    check("products_stock_non_negative", sql`${t.stock} >= 0`),
    check("products_rating_range", sql`${t.rating} >= 0 and ${t.rating} <= 5`),
    check("products_review_count_non_negative", sql`${t.reviewCount} >= 0`),
  ],
);

/** Ordered gallery; position 0 is the primary image. */
export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (t) => [
    index("product_images_product_idx").on(t.productId, t.position),
    index("product_images_media_idx").on(t.mediaId),
  ],
);

/** Named image/video slots on the storefront (keys are defined in code). */
export const contentSlots = pgTable("content_slots", {
  key: text("key").primaryKey(),
  mediaId: uuid("media_id").references(() => media.id, { onDelete: "set null" }),
  /** YouTube video id (11 chars) for video slots. */
  youtubeId: text("youtube_id"),
  ...timestamps,
});

export const banners = pgTable(
  "banners",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placement: bannerPlacement("placement").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
    ctaLabel: text("cta_label").notNull().default(""),
    ctaHref: text("cta_href").notNull().default(""),
    /** Deal banners: the product whose price and link are shown. */
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    isActive: boolean("is_active").notNull().default(true),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("banners_placement_idx").on(t.placement, t.isActive, t.sortOrder),
    check("banners_dates_ordered", sql`${t.startsAt} is null or ${t.endsAt} is null or ${t.endsAt} > ${t.startsAt}`),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Human order number, shown as AS-1001. */
    number: integer("number").notNull().generatedAlwaysAsIdentity({ startWith: 1001 }),
    status: orderStatus("status").notNull().default("pending"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    /** E.164, e.g. +923001234567. */
    phone: text("phone").notNull(),
    email: text("email"),
    province: text("province").notNull(),
    city: text("city").notNull(),
    street: text("street").notNull(),
    apartment: text("apartment"),
    postalCode: text("postal_code"),
    notes: text("notes"),
    paymentMethod: text("payment_method").notNull().default("cod"),
    subtotal: integer("subtotal").notNull(),
    shipping: integer("shipping").notNull(),
    total: integer("total").notNull(),
    itemCount: integer("item_count").notNull(),
    /** HMAC of the client IP, for per-IP checkout rate limiting (no raw IPs stored). */
    ipHash: text("ip_hash"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_number_unique").on(t.number),
    index("orders_status_created_idx").on(t.status, t.createdAt),
    index("orders_created_idx").on(t.createdAt),
    index("orders_ip_hash_created_idx").on(t.ipHash, t.createdAt),
    check("orders_totals_consistent", sql`${t.total} = ${t.subtotal} + ${t.shipping}`),
    check("orders_payment_method_cod", sql`${t.paymentMethod} = 'cod'`),
  ],
);

/** Line snapshot: name and price as sold, so later catalogue edits don't rewrite history. */
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    unit: text("unit").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
    check("order_items_line_total", sql`${t.lineTotal} = ${t.unitPrice} * ${t.quantity}`),
  ],
);

/** Status history (who changed what, when). */
export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatus("from_status"),
    toStatus: orderStatus("to_status").notNull(),
    actor: text("actor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId, t.createdAt)],
);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stored lower-cased. */
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("admin_users_email_unique").on(t.email)],
);

/** Server-side sessions. `id` is an HMAC of the cookie token, so a DB leak can't be replayed as cookies. */
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId), index("admin_sessions_expires_idx").on(t.expiresAt)],
);

/** Login attempts for rate limiting and lockout. `ipHash` is an HMAC, not the raw IP. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    ipHash: text("ip_hash").notNull(),
    succeeded: boolean("succeeded").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("login_attempts_email_created_idx").on(t.email, t.createdAt),
    index("login_attempts_ip_created_idx").on(t.ipHash, t.createdAt),
  ],
);
