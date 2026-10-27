import { Minus, Plus } from "lucide-react";

type FaqAccordionProps = {
  items: ReadonlyArray<{ question: string; answer: string }>;
};

/**
 * Native <details> accordion: keyboard and screen-reader support built in, no
 * JS. The shared `name` makes it exclusive (one open at a time) in modern
 * browsers; older ones simply allow several open.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-border rounded-sm border border-border">
      {items.map((item, index) => (
        <details key={item.question} name="faq" open={index === 0} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-display text-sm font-semibold text-strong transition-colors duration-200 hover:text-primary-ink [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-tile text-strong group-open:bg-primary-tint group-open:text-primary-ink"
            >
              <Plus className="size-4 group-open:hidden" />
              <Minus className="hidden size-4 group-open:block" />
            </span>
          </summary>
          <p className="px-5 pb-5 text-strong">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
