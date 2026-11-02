import Link from "next/link";
import type { Metadata } from "next";
import { and, count, eq, lte } from "drizzle-orm";
import { connection } from "next/server";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, CalendarDays, Crown, ImagePlus, Inbox, PackageCheck, PackageOpen, Plus, Store } from "lucide-react";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { barPercent, dashboardHref, dashboardRanges, formatPktLongDay, formatRatio, formatShare, outcomeRatios, parseDashboardRange, parseProductSort, type ProductSort } from "@/features/admin/dashboard-stats";
import { countUnreadMessages } from "@/features/admin/message-data";
import { countFulfilmentQueue, countPendingOrders, countSubscribers, lowestStockProducts, oldestPendingOrders, orderCountsByStatus, productSales, salesTotals } from "@/features/admin/order-data";
import { firstParam, pageNumber, type RawSearchParams } from "@/features/admin/search-params";
import { hexLevel, LOW_STOCK_THRESHOLD, orderStageShortLabels, orderStatusTabs } from "@/features/admin/status-display";
import { AdminTable, TBody, Td, Th, THead, Tr } from "@/features/admin/table";
import { AdminHeading, EmptyState, HexGlyph, Pager, StatCard, StatusPill } from "@/features/admin/ui";
import { formatOrderNumber, orderLifecycle, orderStatusDescriptions, type OrderStatus } from "@/features/orders/status";
import { formatPrice } from "@/lib/format";
import { formatPktDateTime, startOfPktDay } from "@/lib/pk-time";
import { formatRelativeAge } from "@/lib/relative-time";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Overview" };

const PENDING_HREF = "/admin/orders?status=pending&date=all";
const LOW_STOCK_HREF = "/admin/products?stock=low&status=active";
const PRODUCTS_PER_PAGE = 10;
const numberFormat = new Intl.NumberFormat("en-US");

/**
 * Proportional bar as SVG (no inline styles: the design system allows only
 * the stagger index). Segments are sized in user units; decorative only, the
 * numbers next to it carry the meaning.
 */
function ShareBar({ segments, className }: { segments: ReadonlyArray<{ key: string; value: number; tone: string }>; className: string }) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  if (total <= 0) return <svg className={className} viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false" />;
  const visible = segments.filter((segment) => segment.value > 0);
  const offsets = visible.map((_, index) => visible.slice(0, index).reduce((sum, segment) => sum + segment.value, 0));
  return <svg className={className} viewBox={`0 0 ${total} 8`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
    {visible.map((segment, index) => <rect key={segment.key} x={offsets[index]} y="0" width={segment.value} height="8" data-tone={segment.tone} />)}
  </svg>;
}


export default async function Dashboard({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  await connection();
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const todayStart = startOfPktDay(now);
  const range = parseDashboardRange(firstParam(params.range), now);
  const sort: ProductSort = parseProductSort(firstParam(params.psort));
  const productPage = pageNumber(firstParam(params.ppage));
  const current = { range: range.key, sort, page: productPage };
  const topFromPage = sort === "units" && productPage === 1;

  const [pending, queue, lowStockCount, unreadMessages, waiting, runningLow, statusCounts, sales, productRows, subscribers, topRows] = await Promise.all([
    countPendingOrders(),
    countFulfilmentQueue(),
    db.select({ value: count() }).from(products).where(and(eq(products.status, "active"), lte(products.stock, LOW_STOCK_THRESHOLD))),
    countUnreadMessages(),
    oldestPendingOrders(5),
    lowestStockProducts(5),
    orderCountsByStatus(range.start),
    salesTotals(range.start, todayStart),
    productSales(range.start, sort, PRODUCTS_PER_PAGE + 1, (productPage - 1) * PRODUCTS_PER_PAGE),
    countSubscribers(),
    topFromPage ? Promise.resolve(null) : productSales(range.start, "units", 1, 0),
  ]);
  const lowStock = lowStockCount[0]?.value ?? 0;
  const oldest = waiting[0];
  const toShip = queue.toPack + queue.toDispatch;
  const totalOrders = orderStatusTabs.reduce((sum, status) => sum + statusCounts[status], 0);
  const ratios = outcomeRatios(statusCounts.delivered, statusCounts.cancelled);
  const finished = statusCounts.delivered + statusCounts.cancelled;
  const shownProducts = productRows.rows.slice(0, PRODUCTS_PER_PAGE);
  const top = (topFromPage ? productRows.rows[0] : topRows?.rows[0]) ?? null;
  const ordersHref = (status: string) => `/admin/orders?status=${status}&${range.orderDateQuery}`;
  const sortHref = (next: ProductSort) => `${dashboardHref(current, { sort: next, page: 1 })}#product-sales`;

  const stages = [...orderLifecycle];
  const pipelineCell = (status: OrderStatus, index: number | null) => {
    const value = statusCounts[status];
    const glyph = hexLevel(status);
    return <Link href={ordersHref(status)} className={status === "cancelled" ? "admin-pipe-cell admin-pipe-off" : "admin-pipe-cell"} data-tone={status} data-empty={value === 0 || undefined}
      aria-label={`${orderStatusDescriptions[status]}: ${value} ${value === 1 ? "order" : "orders"}, ${formatShare(value, totalOrders)}. View them.`}
      style={index === null ? undefined : ({ "--i": index } as CSSProperties)}>
      <HexGlyph level={glyph.level} struck={glyph.struck} className="admin-hex admin-pipe-hex" />
      <span className="admin-pipe-count">{numberFormat.format(value)}</span>
      <span className="admin-pipe-label">{orderStageShortLabels[status]}</span>
      <span className="admin-pipe-share">{formatShare(value, totalOrders)}</span>
    </Link>;
  };

  return <div className="admin-page">
    <AdminHeading eyebrow={formatPktLongDay(now)} title="Today at the hive" description="How the shop is doing, then what needs you now."
      actions={<>
        <Link className="admin-button" href="/admin/products/new"><Plus aria-hidden="true" />Add product</Link>
        <Link className="admin-button secondary" href="/admin/media"><ImagePlus aria-hidden="true" />Upload image</Link>
        <Link className="admin-button quiet" href="/"><Store aria-hidden="true" />View store<ArrowUpRight aria-hidden="true" /></Link>
      </>} />

    <div className="admin-dash">
      <section className="admin-range" aria-labelledby="range-title">
        <header className="admin-range-head">
          <div>
            <h2 id="range-title">Sales and orders</h2>
            <p className="admin-range-scope" role="status"><CalendarDays aria-hidden="true" />Showing: {range.caption}</p>
          </div>
          <nav aria-label="Date range for sales and orders" className="admin-segmented">
            {dashboardRanges.map((entry) => <Link key={entry.key} href={dashboardHref(current, { range: entry.key, page: 1 })} aria-current={entry.key === range.key ? "page" : undefined} scroll={false}>{entry.label}</Link>)}
          </nav>
        </header>

        <div className="admin-stats admin-kpis">
          <StatCard label="Sales" value={formatPrice(sales.sales)} context="All orders except cancelled, incl. cash still to collect" />
          <StatCard label="Orders" value={numberFormat.format(totalOrders)} context={totalOrders > 0 ? `${numberFormat.format(totalOrders - finished)} still open` : `None placed ${range.phrase}`} />
          <StatCard label="Delivery success" value={<span className="admin-kpi-success">{formatRatio(ratios.success)}</span>}
            context={finished > 0 ? <>
              <ShareBar className="admin-kpi-meter" segments={[{ key: "delivered", value: statusCounts.delivered, tone: "delivered" }, { key: "cancelled", value: statusCounts.cancelled, tone: "cancelled" }]} />
              <span>{formatRatio(ratios.fail)} cancelled · {numberFormat.format(statusCounts.delivered)} of {numberFormat.format(finished)} finished</span>
            </> : "No finished orders yet"} />
          <StatCard href={ordersHref("delivered")} label="Cash collected" value={formatPrice(sales.delivered)} context="On delivered orders" />
        </div>

        <section className="admin-panel" aria-labelledby="pipe-title">
          <div className="admin-panel-head">
            <h3 id="pipe-title">Order pipeline</h3>
            <p className="admin-hint">{totalOrders > 0 ? `${totalOrders === 1 ? "1 order" : `${numberFormat.format(totalOrders)} orders`} placed ${range.phrase}. Choose a stage to see those orders.` : `No orders placed ${range.phrase}.`}</p>
          </div>
          {totalOrders > 0 && <ShareBar className="admin-comb-strip" segments={orderStatusTabs.map((status) => ({ key: status, value: statusCounts[status], tone: status }))} />}
          <div className="admin-pipeline">
            <ol className="admin-pipeline-stages" aria-label="Order stages, in order">
              {stages.map((status, index) => <li key={status}>{pipelineCell(status, index)}</li>)}
            </ol>
            {pipelineCell("cancelled", null)}
          </div>
        </section>

        <section id="product-sales" className="admin-panel" aria-labelledby="products-title">
          <div className="admin-panel-head">
            <h3 id="products-title">Product sales</h3>
            <p className="admin-hint">Units and revenue from order lines {range.phrase}, excluding cancelled orders. Names are as sold.</p>
          </div>
          {top && <p className="admin-top-seller">
            <span className="admin-top-seller-icon" aria-hidden="true"><Crown /></span>
            <span><span className="admin-top-seller-label">Top seller {range.phrase}</span><span><strong>{top.name}</strong> · {top.unit}</span></span>
            <span className="admin-top-seller-figures">{numberFormat.format(top.units)} sold · {formatPrice(top.revenue)}</span>
          </p>}
          {shownProducts.length > 0 ? <AdminTable label="Product sales">
            <THead>
              <Th>Product</Th>
              <Th num>Orders</Th>
              <Th num sort={sort === "units" ? "descending" : "none"}><Link href={sortHref("units")} className="admin-sort-link" aria-current={sort === "units" ? "true" : undefined}>Units sold{sort === "units" && <ArrowDown aria-hidden="true" className="admin-sort-icon" />}</Link></Th>
              <Th num sort={sort === "revenue" ? "descending" : "none"}><Link href={sortHref("revenue")} className="admin-sort-link" aria-current={sort === "revenue" ? "true" : undefined}>Revenue{sort === "revenue" && <ArrowDown aria-hidden="true" className="admin-sort-icon" />}</Link></Th>
            </THead>
            <TBody>{shownProducts.map((row) => <Tr key={row.key}>
              <Td slot="title">
                <span className="admin-row-title">{row.productId ? <Link href={`/admin/products/${row.productId}`}>{row.name}</Link> : row.name}{top?.key === row.key && <> <StatusPill tone="honey" label="Top seller" /></>}</span>
                <span className="admin-cell-sub">{row.unit}{!row.productId && " · no longer in the catalogue"}</span>
              </Td>
              <Td label="Orders" num>{numberFormat.format(row.orders)}</Td>
              <Td label="Units sold" num><span className="admin-bar-cell"><span>{numberFormat.format(row.units)}</span><ShareBar className="admin-bar" segments={[{ key: "value", value: barPercent(row.units, productRows.maxUnits), tone: "units" }, { key: "rest", value: 100 - barPercent(row.units, productRows.maxUnits), tone: "rest" }]} /></span></Td>
              <Td label="Revenue" num><span className="admin-bar-cell"><span>{formatPrice(row.revenue)}</span><ShareBar className="admin-bar" segments={[{ key: "value", value: barPercent(row.revenue, productRows.maxRevenue), tone: "revenue" }, { key: "rest", value: 100 - barPercent(row.revenue, productRows.maxRevenue), tone: "rest" }]} /></span></Td>
            </Tr>)}</TBody>
          </AdminTable> : <EmptyState icon={<PackageOpen />} title="No sales yet" headingLevel={3}>Products appear here once customers order them {range.phrase === "of all time" ? "" : range.phrase}.</EmptyState>}
          <Pager page={productPage} hasNext={productRows.rows.length > PRODUCTS_PER_PAGE} base={dashboardHref(current, { page: 1 })} shown={shownProducts.length} pageSize={PRODUCTS_PER_PAGE} param="ppage" label="Product sales pages" />
        </section>

        <p className="admin-hint admin-range-foot">Everything in this frame follows the date range, by Pakistan time. Cancelled orders never count as sales. Delivery success = delivered ÷ (delivered + cancelled); orders still open are not counted.</p>
      </section>

      <section className="admin-now" aria-labelledby="now-title">
        <div className="admin-now-head">
          <h2 id="now-title">Right now</h2>
          <p className="admin-hint">Live counts across all dates. The date range above doesn’t change these.</p>
        </div>
        <div className="admin-stats admin-now-stats">
          <StatCard href={PENDING_HREF} label="Pending orders" value={pending} attention={pending > 0} pulse
            context={pending > 0 && oldest ? `Oldest: ${formatRelativeAge(oldest.createdAt, now).toLowerCase()}` : "All clear"} />
          <StatCard href={queue.toPack > 0 || queue.toDispatch === 0 ? "/admin/orders?status=confirmed&date=all" : "/admin/orders?status=packed&date=all"} label="To pack or dispatch" value={toShip}
            context={toShip > 0 ? `${queue.toPack} to pack · ${queue.toDispatch} to hand to courier` : "All clear"} />
          <StatCard href={LOW_STOCK_HREF} label="Low stock" value={lowStock} context={lowStock > 0 ? `Active products with ${LOW_STOCK_THRESHOLD} or fewer` : "All clear"} />
          <StatCard label="Sold today" value={formatPrice(sales.today)} context="Placed today (PKT), excluding cancelled" />
        </div>

        <section className="admin-panel admin-now-waiting" aria-labelledby="waiting-title">
          <div className="admin-panel-head">
            <h3 id="waiting-title">Waiting for you</h3>
            <p className="admin-hint">Oldest first. Confirm actual stock before accepting.</p>
          </div>
          {waiting.length ? <ul className="admin-worklist">{waiting.map((order) => <li key={order.id}>
            <span className="admin-worklist-main">
              <span className="admin-worklist-title"><span className="admin-ident">{formatOrderNumber(order.number)}</span> · {order.firstName} {order.lastName}</span>
              <span className="admin-worklist-meta">{order.city} · <span title={`${formatPktDateTime(order.createdAt)} PKT`}>{formatRelativeAge(order.createdAt, now)}</span></span>
            </span>
            <span className="admin-worklist-value">{formatPrice(order.total)}</span>
            <Link className="admin-button secondary sm" href={`/admin/orders/${order.id}`} aria-label={`Open order ${formatOrderNumber(order.number)}`}>Open</Link>
          </li>)}</ul> : <EmptyState icon={<Inbox />} title="No pending orders" headingLevel={3}>New orders appear here as soon as customers place them.</EmptyState>}
          {pending > 0 && <div className="admin-panel-foot"><Link href={PENDING_HREF}>All pending orders ({pending})</Link></div>}
        </section>

        <section className="admin-panel admin-now-low" aria-labelledby="low-title">
          <div className="admin-panel-head">
            <h3 id="low-title">Running low</h3>
            <p className="admin-hint">Active products with {LOW_STOCK_THRESHOLD} or fewer in stock.</p>
          </div>
          {runningLow.length ? <ul className="admin-worklist">{runningLow.map((product) => <li key={product.id}>
            <span className="admin-worklist-main"><span className="admin-worklist-title">{product.name}</span><span className="admin-worklist-meta">{product.unit}</span></span>
            <span className={product.stock <= 0 ? "admin-worklist-value out" : "admin-worklist-value"}>{product.stock <= 0 ? "Out of stock" : `${product.stock} left`}</span>
            <Link className="admin-button secondary sm" href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}>Edit</Link>
          </li>)}</ul> : <EmptyState icon={<PackageCheck />} title="Stock looks healthy" headingLevel={3}>No active product is running low.</EmptyState>}
          {lowStock > 0 && <div className="admin-panel-foot"><Link href={LOW_STOCK_HREF}>All low-stock products ({lowStock})</Link></div>}
        </section>
      </section>

      <section className="admin-dash-more" aria-labelledby="more-title">
        <h2 id="more-title" className="admin-dash-more-title">Inbox and audience</h2>
        <div className="admin-stats admin-more-stats">
          <StatCard href="/admin/messages?status=unread" label="Unread messages" value={unreadMessages} attention={unreadMessages > 0} context={unreadMessages > 0 ? "From the contact form" : "All clear"} />
          <StatCard href="/admin/subscribers" label="Newsletter subscribers" value={numberFormat.format(subscribers)} context={subscribers > 0 ? "Export them from Subscribers" : "No sign-ups yet"} />
        </div>
      </section>
    </div>
  </div>;
}
