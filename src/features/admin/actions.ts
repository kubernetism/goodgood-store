"use server";

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { banners, categories, contentSlots, media, orders, productImages, products } from "@/db/schema";
import { bannerFormSchema } from "@/features/banners/model";
import { getSlotDefinition } from "@/features/content/slots";
import { canTransition, isOrderStatus, restocksOnTransition } from "@/features/orders/status";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { parseYouTubeUrl } from "@/lib/youtube";
import { requireAdmin } from "@/server/auth/session";
import { checkImageUpload, extensionFor, MAX_UPLOAD_BYTES } from "@/server/media/image-file";
import { getMediaStorage } from "@/server/media/storage";
import { productFormSchema } from "./product-schema";

const value = (form: FormData, name: string) => String(form.get(name) ?? "");
function error(path: string, message: string): never { redirect(`${path}?error=${encodeURIComponent(message)}`); }
function success(path: string): never { redirect(`${path}?saved=1`); }
function validId(id: string) { return z.uuid().safeParse(id).success; }

export async function saveProduct(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  const path = id && validId(id) ? `/admin/products/${id}` : "/admin/products/new";
  if (id && !validId(id)) error("/admin/products", "Invalid product.");
  const parsed = productFormSchema.safeParse({ ...Object.fromEntries(form.entries()), tags: form.getAll("tags"), imageIds: form.getAll("imageId").map(String).filter(Boolean) });
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
  const [order] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || !canTransition(order.status, target)) error(`/admin/orders/${id}`, "This status change is no longer available.");
  if (target === "cancelled" && value(form, "confirm") !== "yes") error(`/admin/orders/${id}`, "Confirm cancellation first.");
  // One SQL statement makes the status transition, audit event and optional
  // restock atomic. The previous status guards against concurrent changes.
  const result = await db.execute(sql`
    WITH changed AS (
      UPDATE orders SET status = ${target}::order_status, updated_at = now()
      WHERE id = ${id}::uuid AND status = ${order.status}::order_status RETURNING id
    ), restored AS (
      UPDATE products p SET stock = p.stock + item.quantity, updated_at = now()
      FROM (SELECT oi.product_id, sum(oi.quantity)::integer AS quantity FROM order_items oi JOIN changed c ON c.id = oi.order_id WHERE oi.product_id IS NOT NULL GROUP BY oi.product_id) item
      WHERE p.id = item.product_id AND ${restocksOnTransition(order.status, target)} RETURNING p.id
    ), event AS (
      INSERT INTO order_events (order_id, from_status, to_status, actor)
      SELECT id, ${order.status}::order_status, ${target}::order_status, ${admin.email} FROM changed RETURNING id
    ) SELECT count(*)::integer AS changed FROM changed
  `);
  if (!Number(result.rows[0]?.changed)) error(`/admin/orders/${id}`, "The order changed elsewhere. Refresh and try again.");
  if (restocksOnTransition(order.status, target)) updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/orders");
  success(`/admin/orders/${id}`);
}

export async function uploadMedia(form: FormData) {
  await requireAdmin();
  const file = form.get("image");
  const alt = value(form, "alt").trim();
  if (!(file instanceof File) || file.size > MAX_UPLOAD_BYTES || !alt || alt.length > 250) error("/admin/media", "Choose an image under 4 MB and provide alt text (up to 250 characters).");
  const checked = checkImageUpload(new Uint8Array(await file.arrayBuffer()));
  if (!checked.ok) error("/admin/media", checked.message);
  const key = `images/${randomUUID()}.${extensionFor[checked.type]}`;
  try {
    const stored = await getMediaStorage().put(key, checked.bytes, checked.type);
    await db.insert(media).values({ storageKey: stored.key, url: stored.url, alt, contentType: checked.type, sizeBytes: checked.bytes.length, width: checked.size?.width, height: checked.size?.height });
  } catch (cause) { console.error("Media upload failed", cause); error("/admin/media", "Upload failed. Check image storage configuration and try again."); }
  revalidatePath("/admin/media");
  success("/admin/media");
}

export async function deleteMedia(form: FormData) {
  await requireAdmin();
  const id = value(form, "id");
  if (!validId(id) || value(form, "confirm") !== "yes") error("/admin/media", "Confirm deletion first.");
  const [image] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!image) error("/admin/media", "Image not found.");
  try {
    await getMediaStorage().remove(image.storageKey);
    await db.delete(media).where(eq(media.id, id));
  } catch (cause) { console.error("Media deletion failed", cause); error("/admin/media", "Could not delete the image. Please try again."); }
  updateTag(CACHE_TAGS.content); updateTag(CACHE_TAGS.catalog); updateTag(CACHE_TAGS.banners);
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
