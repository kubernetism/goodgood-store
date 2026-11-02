/**
 * What the link-preview cards say, and how big. Pure, so the clamping that
 * keeps a long name or price inside the card can be tested without rendering.
 */
import { discountPercent } from "@/components/ui/price";
import type { Product } from "@/features/products/types";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";

/** 1.91:1, the shape WhatsApp and Facebook show large. */
export const CARD_SIZE = { width: 1200, height: 630 } as const;

/** Width of the text column in the honey panel. */
export const PANEL_TEXT_WIDTH = 536;

export const CARD_CONTENT_TYPE = "image/jpeg";

export const BRAND_CARD_PATH = "/brand-card.jpg";

export type CardImageMetadata = {
  url: string;
  width: number;
  height: number;
  type: string;
  alt: string;
};

export const brandCardImage: CardImageMetadata = {
  url: BRAND_CARD_PATH,
  ...CARD_SIZE,
  type: CARD_CONTENT_TYPE,
  alt: `${siteConfig.legalName}: ${siteConfig.tagline}`,
};

export function productCardPath(slug: string): string {
  return `/shop/${encodeURIComponent(slug)}/card.jpg`;
}

/** A post's cover, resized for messaging apps by the route beside the post. */
export function blogCoverCardImage(slug: string, alt: string): CardImageMetadata {
  return { url: `/blog/${encodeURIComponent(slug)}/cover.jpg`, ...CARD_SIZE, type: CARD_CONTENT_TYPE, alt };
}

type CardProduct = Pick<Product, "name" | "summary" | "price" | "compareAtPrice" | "stock">;

export function productCardImage(product: CardProduct & Pick<Product, "slug">): CardImageMetadata {
  const availability = product.stock === 0 ? "sold out" : formatPrice(product.price);
  return {
    url: productCardPath(product.slug),
    ...CARD_SIZE,
    type: CARD_CONTENT_TYPE,
    alt: `${product.name}, ${availability}. ${siteConfig.legalName}.`,
  };
}

export type ProductCardModel = {
  name: string;
  nameSize: number;
  line: string | null;
  price: string;
  priceSize: number;
  oldPrice: string | null;
  percentOff: number | null;
  soldOut: boolean;
};

const NAME_MAX = 72;
/** About what fits on one line of the panel, at the short line's size. */
const LINE_CHARS = 36;
/** Room for name lines plus short-line lines in the panel, with and without the sale row. */
const TEXT_LINES = { regular: 4, onSale: 3 } as const;

/**
 * Keeps what Sansation can draw. Anything else (Urdu, emoji) makes the renderer
 * fetch another font over the network, and Arabic-script shaping can crash it.
 */
const UNDRAWABLE = /[^\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}\p{N}\p{P}\p{Zs}\p{Sc}\p{Sm}]/gu;

/** Cuts at a word boundary, so a clamped name never ends mid-word. */
export function clampText(text: string, max: number): string {
  const clean = text.replace(UNDRAWABLE, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  // A single very long word has no boundary worth keeping.
  const end = lastSpace > max * 0.5 ? lastSpace : cut.length;
  return `${cut.slice(0, end).replace(/[\s,.;:–—-]+$/, "")}…`;
}

function nameSizeFor(length: number): number {
  if (length <= 22) return 62;
  if (length <= 40) return 50;
  if (length <= 56) return 44;
  return 38;
}

/** Rough line count: Sansation Bold averages about 0.48em per character. The panel has spare room if it runs over. */
function nameLines(length: number, size: number): number {
  return Math.ceil((length * size * 0.48) / PANEL_TEXT_WIDTH);
}

function priceSizeFor(length: number): number {
  if (length <= 9) return 66;
  if (length <= 14) return 54;
  return 42;
}

export function productCardModel(product: CardProduct): ProductCardModel {
  const name = clampText(product.name, NAME_MAX) || siteConfig.name;
  const percentOff = discountPercent(product.price, product.compareAtPrice);
  const nameSize = nameSizeFor(name.length);
  const room = (percentOff === null ? TEXT_LINES.regular : TEXT_LINES.onSale) - nameLines(name.length, nameSize);
  const line = room > 0 ? clampText(product.summary, Math.min(room, 2) * LINE_CHARS) : "";
  const price = formatPrice(product.price);
  return {
    name,
    nameSize,
    line: line || null,
    price,
    priceSize: priceSizeFor(price.length),
    oldPrice: percentOff !== null && product.compareAtPrice !== undefined ? formatPrice(product.compareAtPrice) : null,
    percentOff,
    soldOut: product.stock === 0,
  };
}
