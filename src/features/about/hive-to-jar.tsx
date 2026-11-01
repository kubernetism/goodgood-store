import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { processSteps } from "./about-content";

/**
 * Hive → jar as a vertical timeline. A honey "thread" fills the rail as the
 * reader scrolls (CSS scroll-driven animation, no JS); each hexagon node
 * fills as the honey reaches it. Without support, or with reduced motion,
 * the thread is simply full. Steps alternate sides from lg up.
 */
export function HiveToJar() {
  return (
    <section aria-labelledby="process-heading" className="relative isolate overflow-clip bg-cream py-16 lg:py-28">
      <Container>
        <SectionHeading
          id="process-heading"
          eyebrow="From hive to jar"
          title="Five steps, no shortcuts"
          description="What happens between the flowers and your breakfast table, and why it takes a little longer."
          className="reveal"
        />

        <div className="about-thread relative mx-auto mt-14 max-w-4xl lg:mt-20">
          <span aria-hidden="true" className="about-thread__rail">
            <span className="about-thread__fill" />
          </span>
          <ol className="relative space-y-10 lg:space-y-4">
            {processSteps.map(({ label, title, text, icon: Icon }, index) => (
              <li key={label} className="about-step relative">
                <span aria-hidden="true" className="about-step__node about-hex">
                  <span className="about-step__honey about-hex" />
                  <Icon className="relative size-5" strokeWidth={1.75} />
                </span>
                <div className="about-step__card reveal">
                  <p className="flex items-baseline gap-3 about-step__meta">
                    <span className="font-serif text-4xl leading-none text-primary-ink tabular-nums italic">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-subtitle text-eyebrow font-bold text-primary-ink uppercase">{label}</span>
                  </p>
                  <h3 className="mt-3 text-h4 font-semibold lg:text-xl">{title}</h3>
                  <p className="mt-2 text-pretty">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
