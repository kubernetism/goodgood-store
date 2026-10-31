import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { prefillOrderNumber } from "@/features/tracking/model";
import { TrackOrderForm } from "@/features/tracking/track-order-form";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the progress of your honey order with your order number and mobile number.",
  alternates: { canonical: "/track-order" },
  // Shows a customer's order after a lookup: keep it out of search results.
  robots: { index: false, follow: true },
};

export default function TrackOrderPage({ searchParams }: PageProps<"/track-order">) {
  return (
    <>
      <PageHero title="Track Your Order" eyebrow="Where is my honey?" crumbs={[{ label: "Track Your Order" }]} />
      <Container className="py-16 lg:py-24">
        {/* ?order= is request data, so the form streams in behind this boundary.
            Order data itself only ever arrives from the uncached Server Action. */}
        <Suspense fallback={<TrackOrderForm defaultOrder="" />}>
          <PrefilledForm searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function PrefilledForm({ searchParams }: Pick<PageProps<"/track-order">, "searchParams">) {
  const { order } = await searchParams;
  return <TrackOrderForm defaultOrder={prefillOrderNumber(Array.isArray(order) ? order[0] : order)} />;
}
