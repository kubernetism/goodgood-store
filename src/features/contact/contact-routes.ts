import { waLink } from "@/features/admin/contact-links";
import { normalizeWhatsappNumber } from "@/features/admin/whatsapp-settings";
import { topicPhrase } from "./contact-topics";
import type { ContactService } from "./validation";

/*
 * Outbound contact links for the contact page (pure, unit tested).
 */

/** Google Maps search link for an address; opens the app on phones. */
export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Google Maps directions to an address from the visitor's location. */
export function googleMapsDirectionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** Address line Maps resolves best: tower, road, landmark and city, without the shop numbers. */
export function mapsQuery(businessName: string, shortAddress: string): string {
  return `${businessName}, ${shortAddress}`;
}

/** Prefilled WhatsApp text; the customer can edit it before sending. */
export function whatsappGreeting(service?: ContactService): string {
  return `Assalam-o-Alaikum! I have a question about ${(service && topicPhrase(service)) ?? "Abdul Sami Honey"}.`;
}

/** "+92 316 0912345" for Pakistani mobiles; other numbers as normalised E.164. Null when unusable. */
export function formatWhatsappNumber(number: string): string | null {
  const e164 = normalizeWhatsappNumber(number);
  if (!e164) return null;
  const pakistan = /^\+92(3\d{2})(\d{7})$/.exec(e164);
  return pakistan ? `+92 ${pakistan[1]} ${pakistan[2]}` : e164;
}

/** wa.me link with a prefilled greeting, or null when no usable number is set. */
export function whatsappContactLink(number: string | null | undefined, service?: ContactService): string | null {
  return number ? waLink(number, whatsappGreeting(service)) : null;
}
