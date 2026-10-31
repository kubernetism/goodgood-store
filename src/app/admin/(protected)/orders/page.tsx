import Link from "next/link";
import type { Metadata } from "next";
import { and, count, desc, eq, gte, ilike, inArray, lt, or, sql } from "drizzle-orm";
import { MessageCircle, Phone, ReceiptText } from "lucide-react";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { telHref, waLink } from "@/features/admin/contact-links";
import { CopyShippingButton } from "@/features/admin/copy-shipping-button";
import { OrderFilters } from "@/features/admin/order-filters";
import { dateFilterLabel, orderListQuery, orderTabQuery } from "@/features/admin/order-list";
import { firstParam, type RawSearchParams } from "@/features/admin/search-params";
import { hexLevel, orderStatusTabs } from "@/features/admin/status-display";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, EmptyState, FilterChips, HexGlyph, Pager, pageNumber } from "@/features/admin/ui";
import { defaultOrderDateMode, parseOrderDateFilter } from "@/features/orders/date-filter";
import { formatOrderNumber, isOrderStatus, openOrderStatuses, orderStatusLabels, parseOrderNumber } from "@/features/orders/status";
import { shippingAddress, shippingCopyText } from "@/features/orders/shipping-details";
import { formatPrice } from "@/lib/format";
import { dateToPktLocal, formatPktDateTime } from "@/lib/pk-time";
import { formatRelativeAge } from "@/lib/relative-time";
import { containsPattern } from "@/lib/search";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Orders" };


export default async function OrdersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (firstParam(params.q) ?? "").trim().slice(0, 100);
  const requestedStatus = firstParam(params.status);
  const status = requestedStatus && isOrderStatus(requestedStatus) ? requestedStatus : "pending";
  const page = pageNumber(firstParam(params.page));
  const now = new Date();
  const defaultMode = defaultOrderDateMode(status);
  const explicitDate = Boolean(firstParam(params.date));
  const dateFilter = parseOrderDateFilter({ date: firstParam(params.date), from: firstParam(params.from), to: firstParam(params.to) }, now, defaultMode);
  const number = parseOrderNumber(q);
  const searchWhere = q ? or(
    ilike(sql`${orders.firstName} || ' ' || ${orders.lastName}`, containsPattern(q)),
    ilike(orders.phone, containsPattern(q)),
    ilike(orders.email, containsPattern(q)),
    number === null ? undefined : eq(orders.number, number),
  ) : undefined;
  const dateWhere = and(
    dateFilter.error ? sql`false` : undefined,
    dateFilter.start ? gte(orders.createdAt, dateFilter.start) : undefined,
    dateFilter.end ? lt(orders.createdAt, dateFilter.end) : undefined,
  );
  // Tab counts must match what each tab shows: with no explicit date, open
  // statuses count all dates and finished statuses count today (O1).
  const today = parseOrderDateFilter({ date: "today" }, now);
  const todayWhere = today.start && today.end ? and(gte(orders.createdAt, today.start), lt(orders.createdAt, today.end)) : sql`false`;
  const countWhere = explicitDate
    ? and(searchWhere, dateWhere)
    : and(searchWhere, or(inArray(orders.status, [...openOrderStatuses]), todayWhere));
  const [rows, counts] = await Promise.all([
    db.select().from(orders).where(and(eq(orders.status, status), searchWhere, dateWhere)).orderBy(desc(orders.createdAt), desc(orders.number)).limit(21).offset((page - 1) * 20),
    db.select({ status: orders.status, total: count() }).from(orders).where(countWhere).groupBy(orders.status),
  ]);
  const totals = new Map(counts.map((entry) => [entry.status, entry.total]));
  const query = orderListQuery(status, q, dateFilter);
  const returnQuery = new URLSearchParams(query);
  if (page > 1) returnQuery.set("page", String(page));
  const returnTo = encodeURIComponent(returnQuery.toString());
  const shown = rows.slice(0, 20);
  const statusLabel = orderStatusLabels[status].toLowerCase();

  const chips: { label: string; href: string }[] = [];
  if (q) { const without = new URLSearchParams(query); without.delete("q"); chips.push({ label: `Search: ${q}`, href: `/admin/orders?${without}` }); }
  if (dateFilter.mode !== defaultMode && !dateFilter.error) { const without = new URLSearchParams(query); for (const key of ["date", "from", "to"]) without.delete(key); chips.push({ label: `Dates: ${dateFilterLabel(dateFilter)}`, href: `/admin/orders?${without}` }); }
  const showAllDates = new URLSearchParams(query); showAllDates.set("date", "all"); showAllDates.delete("from"); showAllDates.delete("to");

  return <div className="admin-page">
    <AdminHeading eyebrow="Today" title="Orders" description="Review orders, call or WhatsApp customers, print slips and update status." />
    <nav className="admin-status-tabs" aria-label="Orders by status">
      <ul>{orderStatusTabs.map((tab) => {
        const glyph = hexLevel(tab);
        return <li key={tab}><Link className="admin-status-tab" data-tone={tab} href={`/admin/orders?${orderTabQuery(tab, q, dateFilter, explicitDate)}`} aria-current={status === tab ? "page" : undefined}>
          <HexGlyph level={glyph.level} struck={glyph.struck} />{orderStatusLabels[tab]}<span className="admin-tab-count">{totals.get(tab) ?? 0}</span>
        </Link></li>;
      })}</ul>
    </nav>
    <section className="admin-panel" aria-label={`${orderStatusLabels[status]} orders`}>
      <OrderFilters key={`${dateFilter.mode}:${dateFilter.from}:${dateFilter.to}`} status={status} q={q} mode={dateFilter.mode} defaultMode={defaultMode} from={dateFilter.from} to={dateFilter.to} today={dateToPktLocal(now).slice(0, 10)} error={dateFilter.error ?? undefined} clearHref={`/admin/orders?status=${status}`} />
      <FilterChips chips={chips} />
      {shown.length > 0 ? <AdminTable label={`${orderStatusLabels[status]} orders`}>
        <THead><Th>Order</Th><Th>Customer</Th><Th>Ship to</Th><Th>Placed</Th><Th num>Items</Th><Th num>Total</Th><Th><span className="sr-only">Actions</span></Th></THead>
        <TBody>{shown.map((order) => {
          const orderNumber = formatOrderNumber(order.number);
          const href = `/admin/orders/${order.id}?returnTo=${returnTo}`;
          const tel = telHref(order.phone);
          const whatsapp = waLink(order.phone);
          const address = shippingAddress(order);
          return <Tr key={order.id}>
            <Td slot="title"><Link href={href} className="admin-mono">{orderNumber}</Link></Td>
            <Td label="Customer">
              <span className="admin-row-title admin-nowrap">{order.firstName} {order.lastName}</span>
              <span className="admin-cell-sub admin-mono admin-nowrap">{order.phone}</span>
              {(tel || whatsapp) && <span className="admin-contact-actions">
                {tel && <a className="admin-button quiet sm" href={tel} aria-label={`Call ${order.firstName} about ${orderNumber}`} title="Call"><Phone aria-hidden="true" /><span className="admin-button-text">Call</span></a>}
                {whatsapp && <a className="admin-button quiet sm" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${order.firstName} about ${orderNumber} (opens WhatsApp)`} title="WhatsApp"><MessageCircle aria-hidden="true" /><span className="admin-button-text">WhatsApp</span></a>}
              </span>}
            </Td>
            <Td label="Ship to"><span className="admin-clamp" title={address}>{address}</span></Td>
            <Td slot="badge"><span className="admin-muted" title={`${formatPktDateTime(order.createdAt)} PKT`}>{formatRelativeAge(order.createdAt, now)}</span></Td>
            <Td label="Items" num>{order.itemCount}</Td>
            <Td label="Total" num><strong>{formatPrice(order.total)}</strong></Td>
            <Td slot="actions"><div className="admin-row-actions">
              <Link className="admin-button sm secondary" href={href} aria-label={`Open order ${orderNumber}`}>Open</Link>
              <CopyShippingButton orderNumber={orderNumber} text={shippingCopyText(order)} />
            </div></Td>
          </Tr>;
        })}</TBody>
      </AdminTable> : !dateFilter.error && <EmptyState
        icon={<ReceiptText />}
        title={q || dateFilter.mode !== "all" ? `No ${statusLabel} orders match these filters` : `No ${statusLabel} orders`}
        actions={<>
          {dateFilter.mode !== "all" && <Link className="admin-button secondary" href={`/admin/orders?${showAllDates}`}>Show all dates</Link>}
          {(q || dateFilter.mode !== defaultMode) && <Link className="admin-button quiet" href={`/admin/orders?status=${status}`}>Clear filters</Link>}
        </>}
      >{status === "pending" && !q && dateFilter.mode === "all" ? "All caught up. New orders appear here as soon as customers place them." : "Try a different search or date range."}</EmptyState>}
      <Pager page={page} hasNext={rows.length > 20} base={`/admin/orders?${query}`} shown={shown.length} />
    </section>
  </div>;
}
