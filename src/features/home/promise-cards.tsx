import { HoneyDrip } from "@/components/motifs/honey-drip";
import { Container } from "@/components/ui/container";
import { storePromises } from "@/content/store-promises";

/** The four service promises as honey cards with a drip edge (the one drip strip on the page). */
export function PromiseCards() {
  return (
    <section aria-labelledby="promises-heading" className="pt-10 pb-16 lg:pt-14 lg:pb-24">
      <h2 id="promises-heading" className="sr-only">
        Why shop with us
      </h2>
      <Container>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
          {storePromises.map(({ icon: Icon, title, text }) => (
            <li key={title} className="reveal flex flex-col">
              {/* Phones: compact 2x2 with the icon above the text. */}
              <div className="flex h-full flex-col gap-3 rounded-t-lg bg-primary px-4 pt-5 pb-2 text-strong sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:pt-6 sm:pb-3">
                <Icon className="size-8 shrink-0 sm:size-9" strokeWidth={1.5} aria-hidden="true" />
                <span aria-hidden="true" className="hidden h-10 w-px bg-strong/30 sm:block" />
                <div>
                  <h3 className="font-display text-sm leading-snug font-semibold sm:text-base">{title}</h3>
                  <p className="text-meta text-brown-800">{text}</p>
                </div>
              </div>
              <HoneyDrip size="sm" className="-mt-px text-primary" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
