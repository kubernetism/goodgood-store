import type { ReactNode } from "react";

/*
 * One table markup, two presentations: a table at >= 768px and cards below
 * (data-cards="md"). Card mode sets `display` on table elements, which drops
 * table semantics in WebKit, so the ARIA table roles are explicit.
 */

export function AdminTable({ label, cards = "md", className, children }: { label: string; cards?: "md" | "never"; className?: string; children: ReactNode }) {
  // A scrollable region must be focusable and named so keyboard users can scroll it.
  const scrolls = cards === "never";
  return <div className="admin-table-wrap" data-cards={cards} tabIndex={scrolls ? 0 : undefined} role={scrolls ? "region" : undefined} aria-label={scrolls ? label : undefined}>
    <table className={className ? `admin-table ${className}` : "admin-table"} role="table" aria-label={label}>{children}</table>
  </div>;
}

export function THead({ children }: { children: ReactNode }) {
  return <thead role="rowgroup"><tr role="row">{children}</tr></thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody role="rowgroup">{children}</tbody>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr role="row">{children}</tr>;
}

export function Th({ children, num = false, sort }: { children?: ReactNode; num?: boolean; sort?: "ascending" | "descending" | "none" }) {
  return <th scope="col" role="columnheader" className={num ? "num" : undefined} aria-sort={sort}>{children}</th>;
}

/**
 * `label` is shown before the value in card mode. `slot` places the cell in
 * the card: title (top left), badge (top right) or actions (bottom).
 */
export function Td({ children, label, slot, num = false, className, title }: {
  children?: ReactNode;
  label?: string;
  slot?: "title" | "badge" | "actions";
  num?: boolean;
  className?: string;
  title?: string;
}) {
  const classes = [num ? "num" : "", className ?? ""].filter(Boolean).join(" ") || undefined;
  return <td role="cell" data-label={label} data-slot={slot} className={classes} title={title}>{children}</td>;
}
