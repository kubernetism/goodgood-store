import { Quote } from "lucide-react";
import { RatingStars } from "@/components/ui/rating-stars";
import { SlidingRow } from "@/components/ui/sliding-row";
import { SectionHeading } from "@/components/ui/section-heading";
import { getVisibleTestimonials } from "@/features/testimonials/testimonial-data";
import { cx } from "@/lib/cx";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

/** Customer reviews: cream band, carousel bleeding off both edges. */
export async function Testimonials({ background }: { background?: React.ReactNode }) {
  const testimonials = await getVisibleTestimonials();
  if (!testimonials.length) return null;
  return (
    <section
      aria-labelledby="testimonials-heading"
      className={cx("bg-cream py-16 lg:py-24", Boolean(background) && "relative isolate")}
    >
      {background}
      <SectionHeading
        id="testimonials-heading"
        eyebrow="Kind words"
        title="Loved in kitchens across Pakistan"
        className="reveal px-4"
      />
      <SlidingRow
        label="Customer testimonials"
        fullWidth={testimonials.length > 4}
        className="mt-10"
        items={testimonials.map((testimonial) => ({
          key: testimonial.id,
          content: (
            <figure className="relative flex h-full flex-col rounded-lg border border-border bg-surface p-6">
              <Quote aria-hidden="true" strokeWidth={1.25} className="absolute top-5 right-5 size-10 text-primary-ink/25" />
              <RatingStars rating={testimonial.rating} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-strong">
                <p>“{testimonial.quote}”</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-strong"
                >
                  {initialsOf(testimonial.name)}
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-strong">{testimonial.name}</span>
                  {testimonial.role && <span className="block text-meta text-muted">{testimonial.role}</span>}
                </span>
              </figcaption>
            </figure>
          ),
        }))}
      />
    </section>
  );
}
