import { normalizeWhatsappNumber } from "./whatsapp-settings";

/*
 * Call and WhatsApp links for customer phone numbers (pure, unit tested).
 * Pakistani COD orders are usually confirmed by phone or WhatsApp.
 */

/** `tel:` href with only digits and a leading plus. */
export function telHref(phone: string): string | null {
  const digits = phone.trim().replace(/[^+\d]/g, "");
  return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : null;
}

/** https://wa.me link; local "03xx…" numbers become "923xx…". Null when the number cannot be used. */
export function waLink(phone: string, text?: string): string | null {
  const e164 = normalizeWhatsappNumber(phone);
  if (!e164) return null;
  const base = `https://wa.me/${e164.slice(1)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
