import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { CartView } from "@/features/cart/components/cart-view";
import { getCartCatalog } from "@/features/products/catalog";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review the honey in your cart before checkout.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <>
      <PageHero title="Shopping Cart" eyebrow="Almost there" crumbs={[{ label: "Shop", href: "/shop" }, { label: "Cart" }]} />
      <Container className="py-16 lg:py-24">
        <CartView catalog={getCartCatalog()} />
      </Container>
    </>
  );
}
