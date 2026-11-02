import { waLink } from "@/features/admin/contact-links";
import { getOrderWhatsappNumber } from "@/features/admin/whatsapp-settings-data";
import { siteConfig } from "@/lib/site";
import { WhatsAppFabLink } from "./whatsapp-fab-link";
// Styles: whatsapp-fab.css, inlined into globals.css (it shows on every public page).

/**
 * Floating "Chat with us on WhatsApp" button for the public layouts. The
 * number is the admin's order WhatsApp setting (the same one the contact and
 * checkout pages use), falling back to the primary shop phone. Cached read,
 * so the layouts stay in the static shell.
 */
export async function WhatsAppFab() {
  const configured = await getOrderWhatsappNumber().catch(() => null);
  const baseHref = (configured && waLink(configured)) || waLink(siteConfig.contact.primary.phoneHref.replace("tel:", ""));
  if (!baseHref) return null;
  return <WhatsAppFabLink baseHref={baseHref} />;
}
