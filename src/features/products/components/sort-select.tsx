"use client";

import Form from "next/form";
import { ChevronDown } from "lucide-react";
import { sortOptions, type SortKey } from "../shop-query";

type SortSelectProps = {
  value: SortKey;
  /** Other active params to carry through the GET submission. */
  preserved: Record<string, string>;
};

/** Sorting dropdown: applies on change, with a submit button as no-JS fallback. */
export function SortSelect({ value, preserved }: SortSelectProps) {
  return (
    <Form action="/shop" className="flex items-center gap-2">
      {Object.entries(preserved).map(([name, fieldValue]) => (
        <input key={name} type="hidden" name={name} value={fieldValue} />
      ))}
      <label htmlFor="shop-sort" className="sr-only">
        Sort products
      </label>
      <div className="relative">
        <select
          id="shop-sort"
          name="sort"
          defaultValue={value}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-10 appearance-none rounded-full border border-border-strong bg-surface pr-9 pl-4 text-meta text-strong"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-strong"
          aria-hidden="true"
        />
      </div>
      <noscript>
        <button type="submit" className="h-10 rounded-full bg-primary px-4 text-meta font-semibold text-strong">
          Apply
        </button>
      </noscript>
    </Form>
  );
}
