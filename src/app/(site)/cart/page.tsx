import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CartHeader } from "@/features/cart/components/cart-header";
import { CartView } from "@/features/cart/components/cart-view";
import { getCartCatalog } from "@/features/products/catalog";
import { getCatalog } from "@/features/products/catalog-data";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review the honey in your cart before checkout.",
  robots: { index: false },
};

export default async function CartPage() {
  return (
    <>
      <CartHeader />
      <Container className="pt-6 pb-12 lg:pt-10 lg:pb-20">
        <CartView catalog={getCartCatalog(await getCatalog())} />
      </Container>
    </>
  );
}
