import { Headset, LockKeyhole, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart/pricing";
import { formatPrice } from "@/lib/format";

export type StorePromise = { icon: LucideIcon; title: string; text: string };

/** The four service promises shown under the home hero and above the footer. */
export const storePromises: ReadonlyArray<StorePromise> = [
  {
    icon: Truck,
    title: "Delivery across Pakistan",
    text: `Free on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}, 2–5 working days`,
  },
  { icon: ShieldCheck, title: "Purity promise", text: "Lab-tested, never heated, never blended" },
  { icon: Headset, title: "Real people", text: "Phone and WhatsApp support, Mon–Sat" },
  { icon: LockKeyhole, title: "Secure checkout", text: "Cash on delivery or card, your choice" },
];
