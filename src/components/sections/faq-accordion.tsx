"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import "./faq-accordion.css";

type FaqAccordionProps = {
  items: ReadonlyArray<{ question: string; answer: string }>;
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null);
  const id = useId();
  return (
    <div className="divide-y divide-border rounded-sm border border-border">
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${id}-question-${index}`;
        const panelId = `${id}-answer-${index}`;
        return <div key={item.question}>
          <h3><button id={buttonId} type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenIndex(open ? null : index)} className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 px-5 py-3 text-left font-display text-sm font-semibold text-strong transition-colors duration-200 hover:text-primary-ink">
            {item.question}
            <span aria-hidden="true" className={`flex size-7 shrink-0 items-center justify-center rounded-sm ${open ? "bg-primary-tint text-primary-ink" : "bg-tile text-strong"}`}>
              {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
            </span>
          </button></h3>
          <div id={panelId} aria-labelledby={buttonId} aria-hidden={!open} inert={!open} className="faq-answer" data-open={open}>
            <div className="faq-answer__inner"><p className="px-5 pb-5 text-strong">{item.answer}</p></div>
          </div>
        </div>;
      })}
    </div>
  );
}
