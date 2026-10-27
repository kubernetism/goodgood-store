"use client";

import Form from "next/form";
import { useRef, useState, type FocusEvent } from "react";
import { Search, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/** Search icon that reveals a product search box; submits to /shop?q=… */
export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function open() {
    setIsOpen(true);
    // Wait for the panel to become visible before moving focus into it.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function close({ restoreFocus }: { restoreFocus: boolean }) {
    setIsOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }

  function closeWhenFocusLeaves(event: FocusEvent<HTMLDivElement>) {
    if (isOpen && !event.currentTarget.contains(event.relatedTarget)) close({ restoreFocus: false });
  }

  return (
    <div
      className="relative"
      onBlur={closeWhenFocusLeaves}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) close({ restoreFocus: true });
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="header-search"
        onClick={() => (isOpen ? close({ restoreFocus: false }) : open())}
        className="flex size-11 items-center justify-center rounded-full bg-surface text-strong shadow-card transition-colors duration-200 hover:text-primary-ink"
      >
        {isOpen ? <X className="size-5" aria-hidden="true" /> : <Search className="size-5" aria-hidden="true" />}
        <span className="sr-only">{isOpen ? "Close search" : "Search products"}</span>
      </button>

      <div
        id="header-search"
        hidden={!isOpen}
        className="on-light absolute top-full right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-border bg-surface p-3 shadow-card-hover"
      >
        <Form action="/shop" role="search" className="flex gap-2" onSubmit={() => close({ restoreFocus: false })}>
          <label htmlFor="header-search-input" className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id="header-search-input"
            name="q"
            type="search"
            maxLength={80}
            placeholder="Search Sidr, acacia, honeycomb…"
            className="h-12 min-w-0 flex-1 rounded-full border border-border-strong bg-surface px-4 text-sm text-strong placeholder:text-muted"
          />
          <button type="submit" className={buttonClasses({ variant: "dark" })}>
            Search
          </button>
        </Form>
      </div>
    </div>
  );
}
