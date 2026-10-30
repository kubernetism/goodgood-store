import { describe, expect, it } from "vitest";
import { orderWhatsappUrl } from "./whatsapp-message";
import { prepareOrder } from "./prepare";
import type { BillingDetails } from "@/features/checkout/validation";

const details: BillingDetails = {
  firstName: "Test", lastName: "Customer", phone: "+923001234567", email: "buyer@example.com",
  street: "12 Main Street", apartment: "Near the station", city: "Peshawar", province: "Khyber Pakhtunkhwa",
  postalCode: "25000", notes: "Call before delivery", paymentMethod: "cod",
};

describe("WhatsApp order message", () => {
  it("includes checkout fields and server-priced items, shipping and total", () => {
    const order = prepareOrder([{ slug: "sidr", quantity: 2 }], [{ id: "1", slug: "sidr", name: "Sidr Honey", unit: "500 g", price: 100000, stock: 4 }]);
    if (order.status !== "ok") throw new Error("Expected a valid order");
    const url = new URL(orderWhatsappUrl("+923119000985", "AS-1234", details, order.totals));
    expect(url.origin + url.pathname).toBe("https://wa.me/923119000985");
    const message = url.searchParams.get("text")!;
    for (const value of ["AS-1234", "Test", "Customer", details.phone, details.email!, details.street, details.apartment!, details.city, details.province, details.postalCode!, details.notes!, "Pakistan", "Sidr Honey", "500 g", "× 2", "Rs 2,000", "Rs 250", "Rs 2,250", "Cash on delivery"]) {
      expect(message).toContain(value);
    }
  });

  it("handles optional fields and free shipping", () => {
    const order = prepareOrder([{ slug: "sidr", quantity: 1 }], [{ id: "1", slug: "sidr", name: "Sidr Honey", unit: "1 kg", price: 600000, stock: 1 }]);
    if (order.status !== "ok") throw new Error("Expected a valid order");
    const message = new URL(orderWhatsappUrl("+923119000985", "AS-1235", { ...details, email: null, apartment: null, postalCode: null, notes: null }, order.totals)).searchParams.get("text")!;
    expect(message).toContain("Email: Not provided");
    expect(message).toContain("Area or landmark: Not provided");
    expect(message).toContain("Postal code: Not provided");
    expect(message).toContain("Order notes: None");
    expect(message).toContain("Shipping: Free");
  });
});
