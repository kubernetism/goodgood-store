import { formatOrderNumber } from "./status";

export type ShippingDetails = {
  number: number;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  apartment: string | null;
  city: string;
  province: string;
  postalCode: string | null;
};

export function shippingAddress(order: ShippingDetails): string {
  return [order.street, order.apartment, order.city, order.province, order.postalCode, "Pakistan"].filter(Boolean).join(", ");
}

export function shippingCopyText(order: ShippingDetails): string {
  return [
    `Order: ${formatOrderNumber(order.number)}`,
    `Customer: ${order.firstName} ${order.lastName}`,
    `Phone: ${order.phone}`,
    `Shipping address: ${shippingAddress(order)}`,
  ].join("\n");
}
