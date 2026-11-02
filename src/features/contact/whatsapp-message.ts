/*
 * Text for the floating WhatsApp button (pure, unit tested). The visitor can
 * edit it in WhatsApp before sending.
 */

export const WHATSAPP_GREETING = "Assalam o Alaikum! I'd like to know more about your honey.";

/** Product pages live at /shop/<slug>; the shop listing itself is /shop. */
export function isProductPath(pathname: string): boolean {
  return /^\/shop\/[^/]+\/?$/.test(pathname);
}

/** The greeting, naming the product (and linking it, so the shop sees exactly which jar) when known. */
export function whatsappMessage(product?: { name: string; url: string } | null): string {
  const name = product?.name.trim();
  if (!product || !name) return WHATSAPP_GREETING;
  return `Assalam o Alaikum! I'd like to know more about ${name}: ${product.url}`;
}

/** Adds the prefilled text to a bare https://wa.me/<number> link. */
export function withWhatsappText(baseHref: string, text: string): string {
  return `${baseHref}?text=${encodeURIComponent(text)}`;
}
