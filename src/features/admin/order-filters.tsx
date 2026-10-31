"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Search, SlidersHorizontal, TriangleAlert } from "lucide-react";
import type { OrderStatus } from "@/features/orders/status";
import type { OrderDateMode } from "@/features/orders/date-filter";

/**
 * Orders search and date filter. On phones the dates sit behind a "Filters"
 * disclosure; on desktop every filter is shown inline (CSS).
 */
export function OrderFilters({ status, q, mode: initialMode, defaultMode, from, to, today, error, clearHref }: {
  status: OrderStatus;
  q: string;
  mode: OrderDateMode;
  /** The status's default date mode; Reset appears when the filter differs. */
  defaultMode: "today" | "all";
  from: string;
  to: string;
  today: string;
  error?: string;
  clearHref: string;
}) {
  const id = useId();
  const [mode, setMode] = useState<OrderDateMode>(initialMode);
  const changed = (q ? 1 : 0) + (mode !== defaultMode ? 1 : 0);
  return <form role="search" aria-label="Filter orders" className="admin-filters" action="/admin/orders">
    <input type="hidden" name="status" value={status} />
    <div className="admin-field admin-filter-search">
      <label className="admin-label" htmlFor={`${id}-q`}>Search orders</label>
      <div className="admin-search-input"><Search aria-hidden="true" /><input id={`${id}-q`} name="q" type="search" defaultValue={q} placeholder="Order number, name, phone or email" /></div>
    </div>
    <details className="admin-filter-more" open={mode === "range" || undefined}>
      <summary><SlidersHorizontal aria-hidden="true" />Filters{mode !== defaultMode ? " (1)" : ""}</summary>
      <div className="admin-filter-more-body">
        <div className="admin-field">
          <label className="admin-label" htmlFor={`${id}-date`}>Order dates</label>
          <select id={`${id}-date`} name="date" value={mode} onChange={(event) => setMode(event.target.value as OrderDateMode)}>
            <option value="today">Today</option>
            <option value="all">All dates</option>
            <option value="range">Choose dates</option>
          </select>
        </div>
        {mode === "range" && <>
          <div className="admin-field"><label className="admin-label" htmlFor={`${id}-from`}>From</label><input id={`${id}-from`} type="date" name="from" defaultValue={from || today} required /></div>
          <div className="admin-field"><label className="admin-label" htmlFor={`${id}-to`}>To</label><input id={`${id}-to`} type="date" name="to" defaultValue={to || today} required /></div>
        </>}
      </div>
    </details>
    <div className="admin-filter-buttons">
      <button className="admin-button secondary">Apply</button>
      {changed > 0 && <Link className="admin-button quiet" href={clearHref}>Reset</Link>}
    </div>
    <p className="admin-hint">Dates use Pakistan time (PKT). Both selected dates are included.</p>
    {error && <div className="admin-notice" data-tone="error" role="alert"><TriangleAlert aria-hidden="true" /><div className="admin-notice-body">{error}</div></div>}
  </form>;
}
