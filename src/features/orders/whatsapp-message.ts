import { formatPrice } from "@/lib/format";
import type { BillingDetails } from "@/features/checkout/validation";
import type { CartTotals } from "@/features/cart/pricing";
import type { PurchasableProduct } from "./prepare";

export function orderWhatsappUrl(number: string, orderNumber: string, details: BillingDetails, totals: CartTotals<PurchasableProduct>): string {
  const message = [
    `New order: ${orderNumber}`,
    "",
    "Customer details",
    `First name: ${details.firstName}`,
    `Last name: ${details.lastName}`,
    `Mobile number: ${details.phone}`,
    `Email: ${details.email || "Not provided"}`,
    "",
    "Delivery address",
    `House number and street: ${details.street}`,
    `Area or landmark: ${details.apartment || "Not provided"}`,
    `City: ${details.city}`,
    `Province / territory: ${details.province}`,
    `Postal code: ${details.postalCode || "Not provided"}`,
    "Country: Pakistan",
    `Order notes: ${details.notes || "None"}`,
    "",
    "Items",
    ...totals.lines.map((line) => `${line.product.name} (${line.product.unit}) × ${line.quantity} — ${formatPrice(line.product.price)} each — ${formatPrice(line.lineTotal)}`),
    `Subtotal: ${formatPrice(totals.subtotal)}`,
    `Shipping: ${totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}`,
    `Order total: ${formatPrice(totals.total)}`,
    "Payment method: Cash on delivery",
  ].join("\n");
  return `https://wa.me/${number.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}
