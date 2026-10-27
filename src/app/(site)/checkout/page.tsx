import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/features/checkout/checkout-form";
import { getCartCatalog } from "@/features/products/catalog";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details and choose a payment method to place your honey order.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHero
        title="Checkout"
        eyebrow="Almost there"
        crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]}
      />
      <Container className="py-16 lg:py-24">
        <CheckoutForm catalog={getCartCatalog()} />
      </Container>
    </>
  );
}
