import type { Metadata } from "next";
import { FlaskConical, MapPin, ShieldCheck, User, Users } from "lucide-react";
import { BeeIcon, HoneyJarIcon } from "@/components/icons/honey-icons";
import { PageHero } from "@/components/layout/page-hero";
import { SocialLinks } from "@/components/layout/social-links";
import { LatestBlog } from "@/components/sections/latest-blog";
import { Testimonials } from "@/components/sections/testimonials";
import { HoneycombParallax } from "@/features/home/honeycomb-parallax";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { faqs, teamMembers } from "@/content/company";
import { SLOT_KEYS, teamMemberSlotKey } from "@/features/content/slots";
import { getSiteContent, slotImage } from "@/features/content/content-data";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { FaqAccordion } from "@/components/sections/faq-accordion";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Honey by Abdul Sami Enterprises works with Pakistani beekeepers to bring you raw, traceable honey. Meet the team and find answers to common questions.",
  alternates: { canonical: "/about" },
};

const reasons = [
  {
    icon: MapPin,
    title: "Traceable to the apiary",
    text: "Every jar carries a batch number that leads back to one region, one season and one beekeeper.",
  },
  {
    icon: FlaskConical,
    title: "Tested before jarring",
    text: "We test each batch for moisture and common adulterants. If it fails, it never reaches our shelves.",
  },
  {
    icon: ShieldCheck,
    title: "Raw, never heated",
    text: "Cold-extracted and cloth-strained. No heating, no blending, no syrups, ever.",
  },
] as const;

export default async function AboutPage() {
  const content = await getSiteContent();
  return (
    <>
      <PageHero title="About Us" crumbs={[{ label: "About Us" }]} />

      {/* About block */}
      <section aria-labelledby="about-heading" className="py-16 lg:py-30">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-6">
          <div className="grid grid-cols-2 gap-6 lg:mr-10 lg:gap-8">
            <MediaImage
              image={slotImage(content, SLOT_KEYS.aboutApiaries)}
              sizes="(min-width: 1024px) 270px, 50vw"
              icon={BeeIcon}
              iconSize="lg"
              rounded="lg"
              aspect="aspect-[3/5]"
              caption="Our apiaries"
            />
            <MediaImage
              image={slotImage(content, SLOT_KEYS.aboutTeam)}
              sizes="(min-width: 1024px) 270px, 50vw"
              icon={User}
              iconSize="lg"
              rounded="lg"
              aspect="aspect-[3/5]"
              caption="Our team"
              className="mt-8"
            />
          </div>
          <div>
            <Eyebrow decorated="leading">Our story</Eyebrow>
            <h2 id="about-heading" className="mt-3 text-h3 font-semibold lg:text-cta">
              Honest honey, from hive to jar
            </h2>
            <p className="mt-8 border-l-2 border-primary pl-5 text-base text-strong">
              Abdul Sami started with a handful of hives and a simple promise: honey that is raw, traceable and sold
              exactly as the bees made it.
            </p>
            <p className="mt-6 lg:pl-3">
              Today we work with beekeepers across Khyber Pakhtunkhwa, Punjab and Gilgit-Baltistan, paying fairly for
              each season&apos;s harvest and testing every batch before it is jarred.
            </p>
            <div className="mt-8 flex flex-wrap items-baseline gap-x-3">
              <p className="font-display text-base font-semibold text-strong">Abdul Sami</p>
              <p aria-hidden="true" className="font-script text-h3 text-primary-ink">
                Abdul Sami
              </p>
              <p className="w-full text-meta">Founder &amp; beekeeper</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why choose us */}
      <section aria-labelledby="why-heading" className="bg-cream py-16 lg:py-24">
        <Container>
          <SectionHeading id="why-heading" eyebrow="Our promise" title="Why choose us" className="reveal" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-lg border border-border bg-surface p-6">
                <div className="flex items-center gap-3">
                  <Icon className="size-11 shrink-0 text-primary-ink" strokeWidth={1.25} aria-hidden="true" />
                  <h3 className="text-h4 font-semibold">{title}</h3>
                </div>
                <p className="mt-5">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Team */}
      <section aria-labelledby="team-heading" className="py-16 lg:py-30">
        <Container>
          <SectionHeading id="team-heading" eyebrow="The people" title="Meet the team" className="reveal" />
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <li key={member.name} className="overflow-hidden rounded-lg border border-border text-center">
                <MediaImage
                  image={slotImage(content, teamMemberSlotKey(member.name))}
                  alt=""
                  sizes="(min-width: 1024px) 270px, 50vw"
                  icon={Users}
                  iconSize="lg"
                  aspect="aspect-[9/10]"
                />
                <div className="px-3 py-5">
                  <Eyebrow decorated="both">{member.role}</Eyebrow>
                  <h3 className="mt-2 text-base font-semibold sm:text-h4">{member.name}</h3>
                  <SocialLinks
                    className="mt-1 justify-center text-strong"
                    iconClassName="size-3.5"
                    labelPrefix={`${member.name} on`}
                    networks={[
                      { network: "facebook", label: "Facebook", href: "https://facebook.com" },
                      { network: "x", label: "X (Twitter)", href: "https://x.com" },
                      { network: "instagram", label: "Instagram", href: "https://instagram.com" },
                    ]}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Testimonials background={<HoneycombParallax />} />

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading" className="py-16 lg:py-30">
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

      {/* Newsletter band */}
      <section aria-labelledby="inbox-heading" className="on-dark bg-brown-950 py-16 text-center lg:py-24">
        <Container>
          <h2 id="inbox-heading" className="text-h2-sm font-semibold text-on-dark lg:text-h2">
            Join The Hive Letter
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-semibold text-on-dark-muted">
            Harvest news, limited releases and honey recipes, about once a month.
          </p>
          <div className="mx-auto mt-8 max-w-xl text-left">
            <NewsletterForm variant="wide" tone="dark" source="about" />
          </div>
        </Container>
      </section>

      <LatestBlog />
    </>
  );
}
