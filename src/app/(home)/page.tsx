import type { Metadata } from "next";
import { DealBand } from "@/features/home/deal-band";
import { FeaturedShelf } from "@/features/home/featured-shelf";
import { pickFeaturedProducts, pickHeroProduct } from "@/features/home/featured";
import { HomeHero } from "@/features/home/home-hero";
import { HomeJournal } from "@/features/home/home-journal";
import { HomeNewsletter } from "@/features/home/home-newsletter";
import { HomeTestimonials } from "@/features/home/home-testimonials";
import { StoryTeaser } from "@/features/home/story-teaser";
import { TrustLedger } from "@/features/home/trust-ledger";
import { VarietyRow } from "@/features/home/variety-row";
import { VideoPopupTrigger } from "@/features/home/video-popup-trigger";
import { getActiveBanners } from "@/features/banners/banner-data";
import { SLOT_KEYS } from "@/features/content/slots";
import { getSiteContent, slotImage } from "@/features/content/content-data";
import { getCatalog } from "@/features/products/catalog-data";
import { parseYouTubeUrl } from "@/lib/youtube";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import brandLogo from "../../../images/logo/abdulSamiEnterprisesLogo.png";
import "@/features/home/home.css";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.legalName} | ${siteConfig.titleTagline}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  // All three reads are cached (tags: catalog, banners, content), so the page
  // prerenders into the static shell and refreshes when the admin edits.
  const [catalog, banners, content] = await Promise.all([getCatalog(), getActiveBanners(), getSiteContent()]);
  const story = content[SLOT_KEYS.homeStory];
  const storyVideo = story?.youtubeId ? parseYouTubeUrl(story.youtubeId) : null;
  const featured = pickFeaturedProducts(catalog, 4);
  const heroProduct = pickHeroProduct(catalog, banners.hero?.productSlug);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: siteConfig.contact.businessName,
        url: siteConfig.url,
        image: new URL(brandLogo.src, siteConfig.url).toString(),
        logo: new URL(brandLogo.src, siteConfig.url).toString(),
        telephone: siteConfig.contact.primary.phoneHref.replace("tel:", ""),
        email: siteConfig.contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Branch No. 2, Usman Tower, Shop No. 1, 2, 3, Byco Pump, Main GT Road, Near Nasir Pur Phatak",
          addressLocality: "Peshawar",
          addressCountry: "PK",
        },
      }} />
      <HomeHero banner={banners.hero} slotImage={slotImage(content, SLOT_KEYS.homeHero)} product={heroProduct} />

      <TrustLedger />

      <FeaturedShelf products={featured} />

      <DealBand catalog={catalog} banner={banners.deal} fallbackImage={slotImage(content, SLOT_KEYS.homeDeal)} />

      <VarietyRow catalog={catalog} />

      <StoryTeaser image={slotImage(content, SLOT_KEYS.homeStory)} video={storyVideo} />

      <HomeTestimonials />

      <HomeNewsletter />

      <HomeJournal />

      {banners.popup?.youtubeId && (
        <VideoPopupTrigger
          popup={{
            id: banners.popup.id,
            title: banners.popup.title,
            subtitle: banners.popup.subtitle,
            ctaLabel: banners.popup.ctaLabel,
            ctaHref: banners.popup.ctaHref,
            youtubeId: banners.popup.youtubeId,
          }}
        />
      )}
    </>
  );
}
