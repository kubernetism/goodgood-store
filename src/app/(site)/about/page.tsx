import type { Metadata } from "next";
import { HoneyJarIcon } from "@/components/icons/honey-icons";
import { LatestBlog } from "@/components/sections/latest-blog";
import { Testimonials } from "@/components/sections/testimonials";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/company";
import { AboutCta } from "@/features/about/about-cta";
import { AboutHero } from "@/features/about/about-hero";
import { AboutPromise } from "@/features/about/about-promise";
import { AboutStory } from "@/features/about/about-story";
import { AboutTeam } from "@/features/about/about-team";
import { HiveToJar } from "@/features/about/hive-to-jar";
import { getSiteContent, slotImage } from "@/features/content/content-data";
import { SLOT_KEYS } from "@/features/content/slots";
import { getPublishedTeam } from "@/features/team/team-data";
import { HoneycombParallax } from "@/features/home/honeycomb-parallax";
import "@/features/about/about.css";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Honey by Abdul Sami Enterprises works with Pakistani beekeepers to bring you raw, traceable honey. Meet the team and find answers to common questions.",
  alternates: { canonical: "/about" },
};

/**
 * Brand story, top to bottom: hero with the jar label → how it started →
 * hive-to-jar timeline → promise band → team → reviews → FAQ → shop/contact.
 * Images are admin slots (styled placeholders until uploaded) and the team is
 * managed in admin Team; the copy and
 * any optional figures live in features/about/about-content.ts.
 */
export default async function AboutPage() {
  const [content, team] = await Promise.all([getSiteContent(), getPublishedTeam()]);
  return (
    <>
      <AboutHero />

      <AboutStory founder={slotImage(content, SLOT_KEYS.aboutFounder)} />

      <HiveToJar />

      <AboutPromise />

      <AboutTeam content={content} members={team} />

      <Testimonials background={<HoneycombParallax />} />

      <section id="faq" aria-labelledby="faq-heading" className="py-16 lg:py-28">
        <Container>
          <SectionHeading id="faq-heading" eyebrow="FAQ" title="Questions about honey" className="reveal" />
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <FaqAccordion items={faqs} />
            <MediaImage
              image={slotImage(content, SLOT_KEYS.aboutFaq)}
              sizes="(min-width: 1024px) 560px, 100vw"
              icon={HoneyJarIcon}
              iconSize="xl"
              tone="honey"
              rounded="lg"
              aspect="aspect-[4/3]"
              caption="Photo coming soon"
            />
          </div>
        </Container>
      </section>

      <AboutCta />

      <LatestBlog />
    </>
  );
}
