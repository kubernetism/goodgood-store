import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/features/checkout/checkout-form";
import { getCartCatalog } from "@/features/products/catalog";
import { getCatalog } from "@/features/products/catalog-data";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details to place a cash-on-delivery honey order anywhere in Pakistan.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  return (
    <>
      <PageHero
        title="Checkout"
        eyebrow="Almost there"
        crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]}
      />
      <Container className="py-16 lg:py-24">
        <CheckoutForm catalog={getCartCatalog(await getCatalog())} />
      </Container>
    </>
  );
}
