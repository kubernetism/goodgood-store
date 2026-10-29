"use client";

import { StarButton } from "@/components/ui/star-controls";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type Tab = { id: string; label: string; panel: ReactNode };

/**
 * ARIA tabs (DS: category tabs) with roving tabindex and arrow/Home/End keys.
 * Panels are server-rendered and passed in, so every panel's HTML ships and
 * only the visibility toggles on the client.
 */
export function ProductTabs({ tabs, label }: { tabs: ReadonlyArray<Tab>; label: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  function selectAndFocus(index: number) {
    const next = (index + tabs.length) % tabs.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, () => void> = {
      ArrowRight: () => selectAndFocus(activeIndex + 1),
      ArrowLeft: () => selectAndFocus(activeIndex - 1),
      Home: () => selectAndFocus(0),
      End: () => selectAndFocus(tabs.length - 1),
    };
    const handler = keys[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="scrollbar-none mx-auto flex w-full max-w-page gap-2 overflow-x-auto px-4 py-1 sm:flex-wrap sm:justify-center sm:px-6"
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <StarButton
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              className={cx(
                "flex h-11 shrink-0 items-center rounded-full border px-5 font-display text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                isActive
                  ? "border-strong bg-strong text-on-dark"
                  : "border-border bg-surface text-strong hover:border-strong hover:bg-primary-tint",
              )}
            >
              {tab.label}
            </StarButton>
          );
        })}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          className="mt-10"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
