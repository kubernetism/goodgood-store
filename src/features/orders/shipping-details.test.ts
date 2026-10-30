import { describe, expect, it } from "vitest";
import { shippingAddress, shippingCopyText } from "./shipping-details";

const order = { number: 1234, firstName: "Test", lastName: "Customer", phone: "+923001234567", street: "12 Main Street", apartment: "Near the station", city: "Peshawar", province: "Khyber Pakhtunkhwa", postalCode: "25000" };

describe("shipping details", () => {
  it("copies the order number, name, phone and complete delivery address", () => {
    expect(shippingCopyText(order)).toBe("Order: AS-1234\nCustomer: Test Customer\nPhone: +923001234567\nShipping address: 12 Main Street, Near the station, Peshawar, Khyber Pakhtunkhwa, 25000, Pakistan");
  });

  it("omits optional address fields cleanly when they were not provided", () => {
    expect(shippingAddress({ ...order, apartment: null, postalCode: null })).toBe("12 Main Street, Peshawar, Khyber Pakhtunkhwa, Pakistan");
  });
});
