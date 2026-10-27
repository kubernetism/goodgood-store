import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { PageHero } from "@/components/layout/page-hero";
import { LegalDocument } from "@/components/sections/legal-document";
import { Container } from "@/components/ui/container";
import { LEGAL_UPDATED_ON, privacyIntro, privacySections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.legalName} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" eyebrow="Legal" crumbs={[{ label: "Privacy Policy" }]} />
      <Container className="py-16 lg:py-24">
        <LegalDocument intro={privacyIntro} updatedOn={LEGAL_UPDATED_ON} sections={privacySections} />
      </Container>
    </>
  );
}
