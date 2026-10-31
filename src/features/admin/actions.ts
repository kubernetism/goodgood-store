"use server";

import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { banners, categories, contentSlots, media, orders, productImages, products } from "@/db/schema";
import { bannerFormSchema } from "@/features/banners/model";
import { getSlotDefinition } from "@/features/content/slots";
import { validateCancellation, validateCourier, type Cancellation, type CourierDetails } from "@/features/orders/cancel-reasons";
import { canTransition, isOrderStatus, restocksOnTransition } from "@/features/orders/status";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { parseYouTubeUrl } from "@/lib/youtube";
import { requireAdmin } from "@/server/auth/session";
import { getMediaStorage } from "@/server/media/storage";
import { storeUploadedImage } from "@/server/media/upload";
import { productFormSchema } from "./product-schema";
import { categoryFormSchema } from "./category-schema";

const value = (form: FormData, name: string) => String(form.get(name) ?? "");
function error(path: string, message: string): never { redirect(`${path}?error=${encodeURIComponent(message)}`); }
function success(path: string): never { redirect(`${path}?saved=1`); }
function validId(id: string) { return z.uuid().safeParse(id).success; }
/** Courier details can be corrected while the parcel is with the courier or delivered. */
const COURIER_EDITABLE = ["dispatched", "shipped", "delivered"] as const;
function isForeignKeyViolation(cause: unknown): boolean {
  for (let current = cause, depth = 0; current && typeof current === "object" && depth < 5; depth++) {
    if ("code" in current && current.code === "23503") return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

export async function saveCategory(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (id && !validId(id)) error("/admin/categories", "Invalid category.");
  const path = id ? `/admin/categories/${id}` : "/admin/categories/new";
  const parsed = categoryFormSchema.safeParse({ ...Object.fromEntries(form.entries()), isActive: value(form, "isActive") === "yes" });
  if (!parsed.success) error(path, parsed.error.issues[0]?.message ?? "Check the category details.");
  const categoryId = id || randomUUID();
  let updated: { id: string }[];
  try {
    updated = id
      ? await db.update(categories).set(parsed.data).where(eq(categories.id, id)).returning({ id: categories.id })
      : await db.insert(categories).values({ id: categoryId, ...parsed.data }).returning({ id: categories.id });
  } catch (cause) {
    console.error("Category save failed", cause);
    error(path, "Could not save the category. Check that its slug is unique and its image exists.");
  }
  if (!updated.length) error("/admin/categories", "Category not found.");
  updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/content");
  success(`/admin/categories/${categoryId}`);
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!validId(id)) error("/admin/categories", "Invalid category.");
  const path = `/admin/categories/${id}`;
  if (value(form, "confirm") !== "yes") error(path, "Confirm category deletion first.");
  let deleted: { id: string }[];
  try {
    deleted = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  } catch (cause) {
    console.error("Category deletion failed", cause);
    error(path, isForeignKeyViolation(cause) ? "Move or delete this category's products first, then try again." : "Could not delete the category. Please try again.");
  }
  if (!deleted.length) error("/admin/categories", "Category not found.");
  updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/content");
  success("/admin/categories");
}

export async function saveProduct(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  const path = id && validId(id) ? `/admin/products/${id}` : "/admin/products/new";
  if (id && !validId(id)) error("/admin/products", "Invalid product.");
  const status = value(form, "active") === "yes" ? "active" : value(form, "inactiveStatus") === "archived" ? "archived" : "draft";
  const parsed = productFormSchema.safeParse({ ...Object.fromEntries(form.entries()), status, tags: form.getAll("tags"), imageIds: form.getAll("imageId").map(String).filter(Boolean) });
  if (!parsed.success) error(path, parsed.error.issues[0]?.message ?? "Check the product details.");
  const { imageIds, ...product } = parsed.data;
  if (new Set(imageIds).size !== imageIds.length) error(path, "Each image can only be selected once.");
  const productId = id || randomUUID();
  try {
    if (id) {
      await db.batch([
        db.update(products).set(product).where(eq(products.id, productId)),
        db.delete(productImages).where(eq(productImages.productId, productId)),
        ...(imageIds.length ? [db.insert(productImages).values(imageIds.map((mediaId, position) => ({ productId, mediaId, position })))] : []),
      ]);
    } else {
      await db.batch([
        db.insert(products).values({ id: productId, ...product }),
        ...(imageIds.length ? [db.insert(productImages).values(imageIds.map((mediaId, position) => ({ productId, mediaId, position })))] : []),
      ]);
    }
  } catch (cause) { console.error("Product save failed", cause); error(path, "Could not save. Check that the slug is unique and selected images exist."); }
  updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/products");
  success(`/admin/products/${productId}`);
}

export async function archiveProduct(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!validId(id) || value(form, "confirm") !== "yes") error("/admin/products", "Confirm the archive action first.");
  await db.update(products).set({ status: "archived" }).where(eq(products.id, id));
  updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/products");
  success("/admin/products");
}

export async function setProductVisibility(id: string, active: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  if (!validId(id) || typeof active !== "boolean") return { error: "Invalid product or visibility." };
  let updated: { id: string }[];
  try {
    updated = await db.update(products).set({ status: active ? "active" : "draft" }).where(eq(products.id, id)).returning({ id: products.id });
  } catch (cause) {
    console.error("Product visibility update failed", cause);
    return { error: "Could not update visibility. Please try again." };
  }
  if (!updated.length) return { error: "Product not found." };
  updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/products");
  return {};
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!validId(id)) error("/admin/products", "Invalid product.");
  const path = `/admin/products/${id}`;
  if (value(form, "confirm") !== "yes") error(path, "Confirm product deletion first.");
  let deleted: { id: string }[];
  try {
    deleted = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  } catch (cause) {
    console.error("Product deletion failed", cause);
    error(path, "Could not delete the product. Please try again.");
  }
  if (!deleted.length) error("/admin/products", "Product not found.");
  updateTag(CACHE_TAGS.catalog);
  updateTag(CACHE_TAGS.banners);
  revalidatePath("/admin/products");
  success("/admin/products");
}

export async function saveBanner(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  const path = id && validId(id) ? `/admin/banners/${id}` : "/admin/banners/new";
  if (id && !validId(id)) error("/admin/banners", "Invalid banner.");
  const parsed = bannerFormSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) error(path, parsed.error.issues[0]?.message ?? "Check the banner details.");
  const bannerId = id || randomUUID();
  try {
    if (id) await db.update(banners).set(parsed.data).where(eq(banners.id, id));
    else await db.insert(banners).values({ id: bannerId, ...parsed.data });
  } catch (cause) { console.error("Banner save failed", cause); error(path, "Could not save the banner. Check the selected image and product."); }
  updateTag(CACHE_TAGS.banners);
  revalidatePath("/admin/banners");
  success(`/admin/banners/${bannerId}`);
}

export async function deleteBanner(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!validId(id) || value(form, "confirm") !== "yes") error("/admin/banners", "Confirm banner deletion first.");
  await db.delete(banners).where(eq(banners.id, id));
  updateTag(CACHE_TAGS.banners);
  revalidatePath("/admin/banners");
  success("/admin/banners");
}

export async function changeOrderStatus(form: FormData) {
  const admin = await requireAdmin();
  const id = value(form, "id");
  const target = value(form, "status");
  if (!validId(id) || !isOrderStatus(target)) error("/admin/orders", "Invalid order status.");
  const returnTo = value(form, "returnTo");
  const resultUrl = (key: "error" | "saved", message: string) => {
    const query = new URLSearchParams({ [key]: message });
    if (returnTo && returnTo.length <= 600) query.set("returnTo", returnTo);
    return `/admin/orders/${id}?${query}`;
  };
  // Validate everything the form carries before touching the database.
  let cancellation: Cancellation | null = null;
  if (target === "cancelled") {
    if (value(form, "confirm") !== "yes") redirect(resultUrl("error", "Confirm cancellation first."));
    const parsed = validateCancellation({ reason: value(form, "reason"), note: value(form, "note") });
    if (!parsed.ok) redirect(resultUrl("error", parsed.error));
    cancellation = parsed.data;
  }
  let courier: CourierDetails = { courierName: null, trackingNumber: null };
  if (target === "dispatched") {
    const parsed = validateCourier({ courierName: value(form, "courierName"), trackingNumber: value(form, "trackingNumber") });
    if (!parsed.ok) redirect(resultUrl("error", parsed.error));
    courier = parsed.data;
  }
  const [order] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || !canTransition(order.status, target)) redirect(resultUrl("error", "This status change is no longer available."));
  const restocks = restocksOnTransition(order.status, target);
  const eventNote = cancellation?.note ?? (([courier.courierName, courier.trackingNumber].filter(Boolean).join(" · ")) || null);
  // One SQL statement makes the status transition, cancel reason or courier
  // details, the audit event and the optional restock atomic. The previous
  // status guards against concurrent changes.
  const result = await db.execute(sql`
    WITH changed AS (
      UPDATE orders SET
        status = ${target}::order_status,
        cancel_reason = ${cancellation?.reason ?? null},
        cancel_note = ${cancellation?.note ?? null},
        courier_name = coalesce(${courier.courierName}::text, courier_name),
        tracking_number = coalesce(${courier.trackingNumber}::text, tracking_number),
        updated_at = now()
      WHERE id = ${id}::uuid AND status = ${order.status}::order_status RETURNING id
    ), restored AS (
      UPDATE products p SET stock = p.stock + item.quantity, updated_at = now()
      FROM (SELECT oi.product_id, sum(oi.quantity)::integer AS quantity FROM order_items oi JOIN changed c ON c.id = oi.order_id WHERE oi.product_id IS NOT NULL GROUP BY oi.product_id) item
      WHERE p.id = item.product_id AND ${restocks} RETURNING p.id
    ), event AS (
      INSERT INTO order_events (order_id, from_status, to_status, actor, reason, note)
      SELECT id, ${order.status}::order_status, ${target}::order_status, ${admin.email}, ${cancellation?.reason ?? null}, ${eventNote} FROM changed RETURNING id
    ) SELECT count(*)::integer AS changed FROM changed
  `);
  if (!Number(result.rows[0]?.changed)) redirect(resultUrl("error", "The order changed elsewhere. Refresh and try again."));
  if (restocks) updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect(resultUrl("saved", "1"));
}

/** Corrects the courier name or tracking number after dispatch (typos happen). */
export async function saveCourierDetails(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!validId(id)) error("/admin/orders", "Invalid order.");
  const path = `/admin/orders/${id}`;
  const parsed = validateCourier({ courierName: value(form, "courierName"), trackingNumber: value(form, "trackingNumber") });
  if (!parsed.ok) error(path, parsed.error);
  let updated: { id: string }[];
  try {
    updated = await db.update(orders)
      .set({ courierName: parsed.data.courierName, trackingNumber: parsed.data.trackingNumber })
      .where(and(eq(orders.id, id), inArray(orders.status, [...COURIER_EDITABLE])))
      .returning({ id: orders.id });
  } catch (cause) { console.error("Courier details save failed", cause); error(path, "Could not save the courier details. Please try again."); }
  if (!updated.length) error(path, "Courier details can only be changed while the order is with the courier.");
  revalidatePath(path);
  redirect(`${path}?courier=1`);
}

export async function uploadMedia(form: FormData) {
  await requireAdmin();
  const result = await storeUploadedImage(form.get("image"), form.get("alt"));
  if (result.error) error("/admin/media", result.error);
  revalidatePath("/admin/media");
  success("/admin/media");
}

export async function uploadImageInline(form: FormData) {
  await requireAdmin();
  const result = await storeUploadedImage(form.get("image"), form.get("alt"));
  if (result.image) revalidatePath("/admin/media");
  return result;
}

export async function deleteMedia(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!validId(id) || value(form, "confirm") !== "yes") error("/admin/media", "Confirm deletion first.");
  // Row first: a dangling row would show a broken image everywhere it is used,
  // while an orphaned storage object is invisible and harmless.
  let deleted: { storageKey: string }[];
  try {
    deleted = await db.delete(media).where(eq(media.id, id)).returning({ storageKey: media.storageKey });
  } catch (cause) { console.error("Media deletion failed", cause); error("/admin/media", "Could not delete the image. Please try again."); }
  const [image] = deleted;
  if (!image) error("/admin/media", "Image not found.");
  try {
    await getMediaStorage().remove(image.storageKey);
  } catch (cause) { console.error("Media object removal failed; the stored file is now orphaned", { storageKey: image.storageKey, cause }); }
  updateTag(CACHE_TAGS.content); updateTag(CACHE_TAGS.catalog); updateTag(CACHE_TAGS.banners); updateTag(CACHE_TAGS.blog);
  revalidatePath("/admin/media");
  success("/admin/media");
}

export async function saveSlot(form: FormData) {
  await requireAdmin();
  const key = value(form, "key");
  const slot = getSlotDefinition(key);
  const mediaId = value(form, "mediaId");
  const youtube = value(form, "youtube").trim();
  if (!slot || (mediaId && !validId(mediaId))) error("/admin/content", "Invalid content selection.");
  const video = youtube ? parseYouTubeUrl(youtube) : null;
  if (youtube && (!video || slot.kind !== "video")) error("/admin/content", "Enter a valid YouTube link for the video slot.");
  try {
    await db.insert(contentSlots).values({ key, mediaId: mediaId || null, youtubeId: video?.id ?? null }).onConflictDoUpdate({ target: contentSlots.key, set: { mediaId: mediaId || null, youtubeId: video?.id ?? null, updatedAt: new Date() } });
  } catch (cause) { console.error("Content save failed", cause); error("/admin/content", "Could not save the slot. Check the selected image."); }
  updateTag(CACHE_TAGS.content);
  revalidatePath("/admin/content");
  success("/admin/content");
}

export async function saveCategoryImage(form: FormData) {
  await requireAdmin();
  const id = value(form, "categoryId");
  const mediaId = value(form, "mediaId");
  if (!validId(id) || (mediaId && !validId(mediaId))) error("/admin/content", "Invalid category image.");
  try {
    await db.update(categories).set({ imageId: mediaId || null }).where(eq(categories.id, id));
  } catch (cause) { console.error("Category image save failed", cause); error("/admin/content", "Could not save the category image."); }
  updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/content");
  success("/admin/content");
}
