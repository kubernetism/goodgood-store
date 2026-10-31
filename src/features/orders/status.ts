/*
 * Order lifecycle. Forward only, one step at a time:
 * pending -> confirmed -> packed -> dispatched (handed to the courier)
 * -> shipped (in transit) -> delivered (received by the customer).
 * Any order not yet delivered can be cancelled (with a reason); delivered and
 * cancelled are final. Cancelling puts the items back into stock.
 */

export const orderStatuses = ["pending", "confirmed", "packed", "dispatched", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

/** The six forward stages, in order (cancelled is not a stage). */
export const orderLifecycle = ["pending", "confirmed", "packed", "dispatched", "shipped", "delivered"] as const satisfies ReadonlyArray<OrderStatus>;
export type LifecycleStatus = (typeof orderLifecycle)[number];

/** Not finished yet: still needs the shop's attention. */
export const openOrderStatuses = ["pending", "confirmed", "packed", "dispatched", "shipped"] as const satisfies ReadonlyArray<OrderStatus>;

/** Short labels for pills, tabs and buttons. */
export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  dispatched: "Dispatched",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Longer, unambiguous labels for the dashboard and hints. */
export const orderStatusDescriptions: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  dispatched: "Dispatched to courier",
  shipped: "Shipped (in transit)",
  delivered: "Delivered (received)",
  cancelled: "Cancelled",
};

const transitions: Record<OrderStatus, ReadonlyArray<OrderStatus>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["dispatched", "cancelled"],
  dispatched: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (orderStatuses as ReadonlyArray<string>).includes(value);
}

export function isLifecycleStatus(value: OrderStatus): value is LifecycleStatus {
  return value !== "cancelled";
}

export function nextStatuses(status: OrderStatus): ReadonlyArray<OrderStatus> {
  return transitions[status];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

/** Cancelling any order not yet delivered (including one returned by the courier) returns its items to stock. */
export function restocksOnTransition(from: OrderStatus, to: OrderStatus): boolean {
  return to === "cancelled" && from !== "cancelled" && from !== "delivered";
}

export const ORDER_NUMBER_PREFIX = "AS-";

export function formatOrderNumber(number: number): string {
  return `${ORDER_NUMBER_PREFIX}${number}`;
}

/** "AS-1001", "as1001", "#1001" or "1001" -> 1001. */
export function parseOrderNumber(input: string): number | null {
  const match = /^#?(?:as-?)?(\d{1,9})$/i.exec(input.trim());
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isSafeInteger(value) && value <= 2_147_483_647 ? value : null;
}
