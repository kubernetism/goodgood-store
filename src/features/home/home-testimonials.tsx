import { RatingStars } from "@/components/ui/rating-stars";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { HoneyDivider } from "@/components/motifs/honey-divider";
import { getVisibleTestimonials } from "@/features/testimonials/testimonial-data";

type Testimonial = Awaited<ReturnType<typeof getVisibleTestimonials>>[number];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

/**
 * Customer reviews, as managed in the admin (first in the admin's order is
 * set as the large pull quote). Renders nothing until a review is published.
 */
export async function HomeTestimonials() {
  const testimonials = await getVisibleTestimonials();
  const [featured, ...others] = testimonials;
  if (!featured) return null;
  const rest = others.slice(0, 4);

  return (
    <section aria-labelledby="testimonials-heading" className="overflow-clip py-16 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className={rest.length ? "reveal lg:col-span-6" : "reveal lg:col-span-8 lg:col-start-3 lg:text-center"}>
          <Eyebrow decorated="leading">Kind words</Eyebrow>
          <h2 id="testimonials-heading" className="mt-3 text-h2-sm font-semibold lg:text-h2">
            Loved in kitchens across Pakistan
          </h2>
          <HoneyDivider className={rest.length ? "mt-4" : "mt-4 lg:mx-auto"} />
          <figure className="mt-8">
            <span aria-hidden="true" className="home-quote__mark block text-[5rem] text-primary-ink">
              &ldquo;
            </span>
            <blockquote className="home-quote -mt-4 text-[1.375rem] leading-[1.45] text-strong sm:text-[1.625rem]">
              <p>{featured.quote}</p>
            </blockquote>
            <figcaption className={rest.length ? "mt-6" : "mt-6 lg:flex lg:flex-col lg:items-center"}>
              <Reviewer testimonial={featured} />
            </figcaption>
          </figure>
        </div>

        {rest.length > 0 && (
          <div className="home-rail -mx-4 sm:mx-0 lg:col-span-6 lg:self-center">
            <ul
              aria-label="More customer reviews"
              className="scrollbar-none reveal flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0"
            >
              {rest.map((testimonial) => (
                <li key={testimonial.id} className="w-[80%] max-w-[19rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
                  <figure className="flex h-full flex-col rounded-lg border border-border bg-tile p-5">
                    <blockquote className="flex-1 text-sm leading-relaxed text-strong">
                      <p>&ldquo;{testimonial.quote}&rdquo;</p>
                    </blockquote>
                    <figcaption className="mt-5">
                      <Reviewer testimonial={testimonial} compact />
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}

function Reviewer({ testimonial, compact = false }: { testimonial: Testimonial; compact?: boolean }) {
  return (
    <span className="flex items-center gap-3 text-left">
      <span
        aria-hidden="true"
        className={`home-hex flex shrink-0 items-center justify-center bg-primary font-bold text-strong ${compact ? "size-10 text-xs" : "size-12 text-sm"}`}
      >
        {initialsOf(testimonial.name)}
      </span>
      <span>
        <span className="block text-base font-semibold text-strong">{testimonial.name}</span>
        <span className="flex flex-wrap items-center gap-x-2 text-meta text-muted">
          <RatingStars rating={testimonial.rating} />
          {testimonial.role && <span>{testimonial.role}</span>}
        </span>
      </span>
    </span>
  );
}
