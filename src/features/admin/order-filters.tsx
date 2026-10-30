"use client";

import Link from "next/link";
import { useState } from "react";
import type { OrderStatus } from "@/features/orders/status";

type DateMode = "today" | "all" | "range";

export function OrderFilters({ status, q, mode: initialMode, from, to, today, error, clearHref }: {
  status: OrderStatus;
  q: string;
  mode: DateMode;
  from: string;
  to: string;
  today: string;
  error?: string;
  clearHref: string;
}) {
  const [mode, setMode] = useState<DateMode>(initialMode);
  return <form className="admin-order-filters" action="/admin/orders">
    <input type="hidden" name="status" value={status} />
    <label className="admin-order-filter-search">Search orders<input name="q" defaultValue={q} placeholder="Order number, name, phone or email" /></label>
    <label>Order dates<select name="date" value={mode} onChange={(event) => setMode(event.target.value as DateMode)}>
      <option value="today">Today</option>
      <option value="all">All dates</option>
      <option value="range">Choose dates</option>
    </select></label>
    {mode === "range" && <>
      <label>From<input type="date" name="from" defaultValue={from || today} required /></label>
      <label>To<input type="date" name="to" defaultValue={to || today} required /></label>
    </>}
    <div className="admin-order-filter-actions">
      <button className="admin-button">Apply filters</button>
      {(q || mode !== "today") && <Link className="admin-button secondary" href={clearHref}>Reset</Link>}
    </div>
    <p className="admin-muted admin-order-filter-hint">Dates use Pakistan time (PKT). Both selected dates are included.</p>
    {error && <p className="admin-message admin-error admin-order-filter-error" role="alert">{error}</p>}
  </form>;
}
