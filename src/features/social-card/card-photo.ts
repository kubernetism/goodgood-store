import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import { localImages } from "@/content/local-images";
import { CARD_PHOTO_SIZE } from "./card-layouts";
import { CARD_SIZE } from "./card-model";

/**
 * Range photographs bundled with the site (see withLocalCatalogImages). Their
 * URLs are served by the CDN, which is not reachable while prerendering, so
 * read the source files instead. Traced into the function in next.config.ts.
 */
const BUNDLED_PHOTOS = new Map<string, string>([
  [localImages.honey.url, "images/products/Honey_Product.png"],
  [localImages.wildHoney.url, "images/products/Wild-Honey-product.png"],
  [localImages.honeyNuts.url, "images/products/Honey-Soaked-Nuts-in-Rustic-Jar-product.png"],
  [localImages.saffron.url, "images/products/Zafran_product.png"],
]);

const FETCH_TIMEOUT_MS = 5_000;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

async function readPhotoBytes(url: string): Promise<Buffer | null> {
  const bundled = BUNDLED_PHOTOS.get(url);
  if (bundled) return readFile(join(process.cwd(), bundled));

  if (url.startsWith("/")) {
    // Development's local storage adapter serves uploads from public/.
    // normalize() on a rooted path drops any "..", so this stays inside public/.
    return readFile(join(process.cwd(), "public", normalize(url.split("?")[0] ?? url)));
  }

  if (!/^https?:\/\//.test(url)) return null;
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Photo request returned ${response.status}`);
  if (Number(response.headers.get("content-length") ?? 0) > MAX_PHOTO_BYTES) throw new Error("Photo is too large");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_PHOTO_BYTES) throw new Error("Photo is too large");
  return bytes;
}

/** Any failure gives null: a preview without its photo beats no preview at all. */
async function photoAsJpeg(url: string, size: { width: number; height: number }, quality: number): Promise<Buffer | null> {
  try {
    const bytes = await readPhotoBytes(url);
    if (!bytes) return null;
    const { default: sharp } = await import("sharp");
    return await sharp(bytes)
      .rotate()
      .resize({ ...size, fit: "cover" })
      .flatten({ background: "#fff3d6" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  } catch (cause) {
    console.error("Link preview: could not load the photo", url, cause);
    return null;
  }
}

/**
 * The product photo cropped to the card's photo area, as a data URL Satori can
 * draw. Satori reads neither WebP nor AVIF, so everything goes through sharp.
 */
export async function loadCardPhoto(url: string): Promise<string | null> {
  const jpeg = await photoAsJpeg(url, CARD_PHOTO_SIZE, 84);
  return jpeg && `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

/** A blog cover at card size, small enough for WhatsApp. Originals can run to megabytes. */
export async function loadCoverJpeg(url: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const jpeg = await photoAsJpeg(url, CARD_SIZE, 78);
  return jpeg && new Uint8Array(jpeg);
}
