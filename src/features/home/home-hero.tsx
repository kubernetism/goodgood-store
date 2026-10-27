import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { BeeIcon } from "@/components/icons/honey-icons";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

const proofPoints = [
  { icon: MapPin, label: "Single-origin" },
  { icon: ShieldCheck, label: "Lab-tested" },
  { icon: BadgeCheck, label: "Never heated" },
] as const;

/**
 * Static hero (no carousel): honey gradient that continues the header colour
 * and melts into the page through the drip edge. All copy is brown on honey
 * (>= 6.8:1). The gradient ends on --color-primary, the drip's colour.
 */
export function HomeHero() {
  return (
    <section aria-labelledby="hero-heading" className="relative">
      <div className="relative isolate overflow-hidden bg-linear-to-b from-honey-300 to-primary">
        <HoneycombPattern fade className="text-strong/[0.07]" />
        <Container className="grid items-center gap-10 pt-8 pb-6 md:grid-cols-[1.15fr_1fr] md:pt-12 lg:gap-16 lg:pt-16 lg:pb-10">
          <div className="animate-fade-up motion-reduce:animate-none">
            <p className="inline-flex items-center gap-2 rounded-full bg-ivory/70 px-3.5 py-1.5 font-display text-meta font-semibold text-strong">
              <BeeIcon className="size-4" strokeWidth={1.75} />
              Raw honey from Pakistani beekeepers
            </p>
            <h1
              id="hero-heading"
              className="mt-6 font-heading text-[2.625rem] leading-[1.08] font-semibold tracking-tight sm:text-display lg:text-[4.5rem] lg:leading-[1.02]"
            >
              Golden by nature, <span className="italic">raw</span> by choice.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-brown-800">
              Small-batch Sidr, Acacia and wildflower honey from apiaries we know by name. Cold-extracted, never
              blended, jarred in Pakistan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop" variant="dark">
                Shop all honey
              </ButtonLink>
              <ButtonLink href="/shop?category=gift-sets" variant="outline">
                Explore gift sets
              </ButtonLink>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-semibold text-strong">
              {proofPoints.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <HeroVisual />
        </Container>
      </div>
      <HoneyDrip size="lg" className="-mt-px text-primary" />
    </section>
  );
}

/** Jar "photograph" on a glowing ivory plate, with a harvest tag. */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[26rem] md:max-w-none">
      <span
        aria-hidden="true"
        className="absolute inset-[-8%] -z-0 rounded-full bg-[radial-gradient(circle,rgb(255_250_240/0.85),rgb(255_250_240/0)_68%)]"
      />
      <div className="relative rounded-full border-[0.75rem] border-ivory/50 p-3 lg:p-4">
        <ImagePlaceholder
          tone="honey"
          rounded="full"
          iconSize="xl"
          caption="Photo coming soon"
          className="shadow-card-hover"
        />
      </div>
      <p className="absolute bottom-[8%] left-0 rounded-full bg-strong px-4 py-2 font-display text-meta font-semibold text-on-dark shadow-card sm:left-[4%]">
        Sidr harvest · Autumn 2026
      </p>
    </div>
  );
}
