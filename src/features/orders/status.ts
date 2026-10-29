/*
 * Order lifecycle. Forward only: pending -> confirmed -> shipped -> delivered.
 * Any open order can be cancelled; delivered and cancelled are final.
 * Cancelling puts the items back into stock.
 */

export const orderStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const transitions: Record<OrderStatus, ReadonlyArray<OrderStatus>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (orderStatuses as ReadonlyArray<string>).includes(value);
}

export function nextStatuses(status: OrderStatus): ReadonlyArray<OrderStatus> {
  return transitions[status];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

/** Cancelling an order that was still open returns its items to stock. */
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
