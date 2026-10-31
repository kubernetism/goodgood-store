import type { OrderStatus } from "@/features/orders/status";
import { nextStatuses } from "@/features/orders/status";

/*
 * Presentation helpers for statuses (pure, unit tested). The hexagon "filling
 * cell" fills in fifths as an order moves through its six stages (empty when
 * pending, full when delivered); cancelled is an empty, struck cell.
 */

export type HexLevel = 0 | 1 | 2 | 3 | 4 | 5;
export const HEX_LEVELS = 5;
export type PillTone =
  | OrderStatus
  | "neutral"
  | "archived"
  | "positive"
  | "attention"
  | "danger"
  | "honey";

export function hexLevel(status: OrderStatus): { level: HexLevel; struck: boolean } {
  switch (status) {
    case "pending":
      return { level: 0, struck: false };
    case "confirmed":
      return { level: 1, struck: false };
    case "packed":
      return { level: 2, struck: false };
    case "dispatched":
      return { level: 3, struck: false };
    case "shipped":
      return { level: 4, struck: false };
    case "delivered":
      return { level: 5, struck: false };
    case "cancelled":
      return { level: 0, struck: true };
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}

/** Lifecycle order for status tabs and the progress strip (cancelled last). */
/** Compact stage names for the dashboard pipeline (the aria-label uses the full description). */
export const orderStageShortLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  dispatched: "With courier",
  shipped: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const orderStatusTabs = ["pending", "confirmed", "packed", "dispatched", "shipped", "delivered", "cancelled"] as const satisfies ReadonlyArray<OrderStatus>;

/** The one forward step offered as the primary button, or null when the order is final. */
export function forwardStatus(status: OrderStatus): OrderStatus | null {
  return nextStatuses(status).find((next) => next !== "cancelled") ?? null;
}

export function canCancel(status: OrderStatus): boolean {
  return nextStatuses(status).includes("cancelled");
}

const actionLabels: Record<OrderStatus, string> = {
  pending: "Mark as pending",
  confirmed: "Mark as confirmed",
  packed: "Mark as packed",
  dispatched: "Mark as dispatched",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order",
};

/** Verb label for the button that moves an order to `target`. */
export function statusActionLabel(target: OrderStatus): string {
  return actionLabels[target];
}

/** From confirmation on, the order has a printable shipping slip. */
export function hasShippingSlip(status: OrderStatus): boolean {
  return status !== "pending" && status !== "cancelled";
}

export type BannerScheduleStatus = "live" | "scheduled" | "ended" | "off";

/** Banner status derived from its switch and schedule window at `now`. */
export function bannerScheduleStatus(
  banner: { isActive: boolean; startsAt: Date | null; endsAt: Date | null },
  now: Date,
): BannerScheduleStatus {
  if (!banner.isActive) return "off";
  if (banner.endsAt && banner.endsAt.getTime() <= now.getTime()) return "ended";
  if (banner.startsAt && banner.startsAt.getTime() > now.getTime()) return "scheduled";
  return "live";
}

export const bannerStatusDisplay: Record<BannerScheduleStatus, { label: string; tone: PillTone }> = {
  live: { label: "Live", tone: "positive" },
  scheduled: { label: "Scheduled", tone: "shipped" },
  ended: { label: "Ended", tone: "neutral" },
  off: { label: "Off", tone: "neutral" },
};

export type StockLevel = "out" | "low" | "ok";
export const LOW_STOCK_THRESHOLD = 5;

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}
