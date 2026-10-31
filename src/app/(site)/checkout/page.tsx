import type { Metadata } from "next";
import { waLink } from "@/features/admin/contact-links";
import { getOrderWhatsappNumber } from "@/features/admin/whatsapp-settings-data";
import { CheckoutForm } from "@/features/checkout/checkout-form";
import type { CheckoutHelp } from "@/features/checkout/checkout-summary";
import { getCartCatalog } from "@/features/products/catalog";
import { getCatalog } from "@/features/products/catalog-data";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details to place a cash-on-delivery honey order anywhere in Pakistan.",
  robots: { index: false },
};

/** WhatsApp when the shop has set an order number, otherwise the main shop phone. */
function checkoutHelp(whatsappNumber: string | null): CheckoutHelp {
  const whatsapp = whatsappNumber ? waLink(whatsappNumber, "Hi, I need help with my honey order.") : null;
  if (whatsapp) return { href: whatsapp, label: "WhatsApp us", external: true };
  const { phoneHref, phoneDisplay } = siteConfig.contact.primary;
  return { href: phoneHref, label: `Call ${phoneDisplay}`, external: false };
}

export default async function CheckoutPage() {
  const [catalog, whatsappNumber] = await Promise.all([getCatalog(), getOrderWhatsappNumber().catch(() => null)]);
  return (
    <CheckoutForm
      catalog={getCartCatalog(catalog)}
      whatsappEnabled={Boolean(whatsappNumber)}
      help={checkoutHelp(whatsappNumber)}
    />
  );
}
