"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import "./footer-disclosure.css";

export function FooterDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-on-dark/15">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left font-subtitle text-sm font-bold text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-honey-300"
      >
        {title}
        <ChevronDown aria-hidden="true" className={`size-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={panelId} className="footer-disclosure-panel" data-open={open} aria-hidden={!open} inert={!open}>
        <div className="footer-disclosure-panel__inner">{children}</div>
      </div>
    </div>
  );
}
