import { Container } from "@/components/ui/container";
import { storePromises } from "@/content/store-promises";

/**
 * The four store promises (delivery, purity, support, cash on delivery) set
 * like the printed panel on a jar label: double rules top and bottom, a
 * honey cell per promise. Copy comes from content/store-promises only.
 */
export function TrustLedger() {
  return (
    <section aria-labelledby="promises-heading" className="pt-6 pb-4 lg:pt-8">
      <h2 id="promises-heading" className="sr-only">
        Why shop with us
      </h2>
      <Container>
        <ul className="home-ledger grid grid-cols-1 gap-x-8 py-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0">
          {storePromises.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="home-ledger__item flex items-start gap-4 py-5"
            >
              <span aria-hidden="true" className="home-hex flex size-12 shrink-0 items-center justify-center bg-primary text-strong">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-subtitle text-base leading-snug font-bold text-strong">{title}</h3>
                <p className="mt-0.5 text-meta text-body">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
