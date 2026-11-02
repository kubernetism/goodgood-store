import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { getPostBySlug } from "@/features/blog/queries";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { blogCoverImage } from "@/features/content/content-data";
import { getProductBySlug } from "@/features/products/catalog";
import { getCatalog } from "@/features/products/catalog-data";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { siteConfig } from "@/lib/site";
import { BrandCardLayout, ProductCardLayout } from "./card-layouts";
import { CARD_CONTENT_TYPE, CARD_SIZE, productCardModel } from "./card-model";
import { loadCardPhoto, loadCoverJpeg } from "./card-photo";

/** WhatsApp silently drops larger previews. */
const MAX_CARD_BYTES = 280 * 1024;

const ASSETS = join(process.cwd(), "src/features/social-card/assets");

// next/font cannot be used here: Satori needs the raw TTF. Read once per instance.
const assets = Promise.all([
  readFile(join(ASSETS, "Sansation-Regular.ttf")),
  readFile(join(ASSETS, "Sansation-Bold.ttf")),
  readFile(join(ASSETS, "logo.png")),
]).then(([regular, bold, logo]) => ({
  fonts: [
    { name: "Sansation", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Sansation", data: bold, weight: 700 as const, style: "normal" as const },
  ],
  logo: `data:image/png;base64,${logo.toString("base64")}`,
}));

async function renderCardPng(element: ReactElement) {
  const { fonts } = await assets;
  return new ImageResponse(element, { ...CARD_SIZE, fonts });
}

/** Photos make PNG large, so the card is delivered as JPEG, under WhatsApp's limit. */
async function renderCardJpeg(element: ReactElement): Promise<Uint8Array<ArrayBuffer>> {
  const { default: sharp } = await import("sharp");
  const png = Buffer.from(await (await renderCardPng(element)).arrayBuffer());
  let jpeg = Buffer.alloc(0);
  for (const quality of [84, 76, 66, 56]) {
    jpeg = await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer();
    if (jpeg.byteLength <= MAX_CARD_BYTES) break;
  }
  return new Uint8Array(jpeg);
}

async function brandCardElement() {
  const { logo } = await assets;
  return <BrandCardLayout logo={logo} tagline={siteConfig.tagline} />;
}

async function brandCardJpeg(): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("max");
  return renderCardJpeg(await brandCardElement());
}

/**
 * Cached under the catalog tag, which every admin product, category and image
 * edit (and every order, for stock) already invalidates, so a card follows its
 * product. Null when no active product has this slug.
 */
async function productCardJpeg(slug: string): Promise<Uint8Array<ArrayBuffer> | null> {
  "use cache";
  cacheTag(CACHE_TAGS.catalog);

  const product = getProductBySlug(await getCatalog(), slug);
  if (!product) {
    cacheLife("max");
    return null;
  }

  const photoUrl = product.images[0]?.url;
  const photo = photoUrl ? await loadCardPhoto(photoUrl) : null;
  // A download that failed should be retried soon, not baked in until the next edit.
  if (photoUrl && !photo) cacheLife({ revalidate: 300, expire: 3600 });
  else cacheLife("max");

  const { logo } = await assets;
  return renderCardJpeg(<ProductCardLayout model={productCardModel(product)} photo={photo} logo={logo} />);
}

/** Null when the post is gone, has no cover, or the cover cannot be loaded. */
async function blogCoverJpeg(slug: string): Promise<Uint8Array<ArrayBuffer> | null> {
  "use cache";
  cacheTag(CACHE_TAGS.blog, CACHE_TAGS.content);

  const post = getPostBySlug(await getPublishedBlogPosts(), slug);
  const cover = post && blogCoverImage(post);
  const jpeg = cover ? await loadCoverJpeg(cover.url) : null;
  if (cover && !jpeg) cacheLife({ revalidate: 300, expire: 3600 });
  else cacheLife("max");
  return jpeg;
}

function jpegResponse(body: Uint8Array<ArrayBuffer>): Response {
  return new Response(body, {
    headers: {
      "Content-Type": CARD_CONTENT_TYPE,
      // Browsers and crawlers re-check hourly, so an edited product's card shows up the same day.
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function brandCardResponse(): Promise<Response> {
  try {
    return jpegResponse(await brandCardJpeg());
  } catch (cause) {
    console.error("Link preview card: JPEG encoding failed, sending PNG", cause);
    return renderCardPng(await brandCardElement());
  }
}

/** Always answers with a card: a preview must not fail because of one product. */
export async function productCardResponse(slug: string): Promise<Response> {
  try {
    const card = await productCardJpeg(slug);
    return card ? jpegResponse(card) : brandCardResponse();
  } catch (cause) {
    console.error("Link preview card: could not render the product card", slug, cause);
    return brandCardResponse();
  }
}

export async function blogCoverResponse(slug: string): Promise<Response> {
  try {
    const cover = await blogCoverJpeg(slug);
    return cover ? jpegResponse(cover) : brandCardResponse();
  } catch (cause) {
    console.error("Link preview: could not load the blog cover", slug, cause);
    return brandCardResponse();
  }
}
