import { ArrowRight } from "lucide-react";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { Container } from "@/components/ui/container";
import { neverList } from "./about-content";

/** Honey band with the page's second (and last) drip: what we refuse to do, struck through. */
export function AboutPromise() {
  return (
    <>
      <section aria-labelledby="promise-heading" className="relative isolate overflow-clip bg-primary pt-16 pb-12 text-strong lg:pt-24 lg:pb-16">
        <HoneycombPattern fade className="text-strong/[0.07]" />
        <Container className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-3 font-subtitle text-eyebrow font-bold text-strong uppercase">
              <span aria-hidden="true" className="h-px w-6 bg-current opacity-60" />
              Our promise
            </p>
            <h2 id="promise-heading" className="mt-3 text-h2-sm font-semibold lg:text-cta">
              Only <span className="font-script text-[1.35em] leading-none font-normal">honey</span> goes in the jar.
            </h2>
            <p className="mt-5 max-w-md font-subtitle text-base text-strong">
              Raw, traceable and tested, every batch. Turned solid in winter? That&apos;s natural for raw honey, and a good
              sign it hasn&apos;t been heated.
            </p>
            <a
              href="#faq"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm font-semibold text-strong underline decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-transparent"
            >
              How to tell pure honey
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <div className="lg:col-span-7 lg:pl-10">
            <h3 className="font-subtitle text-eyebrow font-bold text-strong uppercase">What we never do</h3>
            <ul className="mt-4 border-t-2 border-strong">
              {neverList.map((item) => (
                <li key={item} className="border-b border-strong/25 py-3 sm:py-4">
                  <span className="about-strike font-heading text-promo font-semibold text-strong sm:text-promo-lg lg:text-cta">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
      <HoneyDrip size="lg" className="relative z-10 -mt-px text-primary" />
    </>
  );
}
