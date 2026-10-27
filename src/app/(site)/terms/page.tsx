import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { PageHero } from "@/components/layout/page-hero";
import { LegalDocument } from "@/components/sections/legal-document";
import { Container } from "@/components/ui/container";
import { LEGAL_UPDATED_ON, termsIntro, termsSections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms that apply when you shop with ${siteConfig.legalName}, including delivery, returns and claims.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms & Conditions" eyebrow="Legal" crumbs={[{ label: "Terms & Conditions" }]} />
      <Container className="py-16 lg:py-24">
        <LegalDocument intro={termsIntro} updatedOn={LEGAL_UPDATED_ON} sections={termsSections} />
      </Container>
    </>
  );
}
