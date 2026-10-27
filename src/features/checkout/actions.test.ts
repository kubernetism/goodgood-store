import { describe, expect, it } from "vitest";
import { getProductBySlug } from "@/features/products/catalog";
import { placeOrder } from "./actions";

const validBilling = {
  firstName: "Ayesha",
  lastName: "Khan",
  company: "",
  phone: "+92 300 0000000",
  email: "ayesha@example.com",
  country: "PK",
  street: "House 0, Street 0, F-7/2",
  apartment: "",
  city: "Islamabad",
  state: "Islamabad Capital Territory",
  zip: "44000",
  notes: "",
  paymentMethod: "cod",
};

function formDataFrom(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) formData.set(name, value);
  return formData;
}

describe("placeOrder", () => {
  it("re-prices the cart from the catalogue, ignoring client-sent prices", async () => {
    const product = getProductBySlug("sidr-honey-500g");
    if (!product) throw new Error("fixture product missing");

    const result = await placeOrder(
      { status: "idle" },
      formDataFrom({
        ...validBilling,
        // A tampered client payload: extra price fields must be ignored.
        cart: JSON.stringify([{ slug: "sidr-honey-500g", quantity: 4, price: 1 }]),
      }),
    );

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.total).toBe(product.price * 4); // over Rs 5,000, so shipping is free
    expect(result.itemCount).toBe(4);
    expect(result.orderNumber).toMatch(/^[0-9A-F]{8}$/);
  });

  it("rejects an empty or unparseable cart", async () => {
    const result = await placeOrder({ status: "idle" }, formDataFrom({ ...validBilling, cart: "{not json" }));
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.fieldErrors.cart).toBeDefined();
  });

  it("returns field errors and echoes values for invalid billing details", async () => {
    const result = await placeOrder(
      { status: "idle" },
      formDataFrom({
        ...validBilling,
        email: "not-an-email",
        paymentMethod: "bitcoin",
        cart: JSON.stringify([{ slug: "sidr-honey-500g", quantity: 1 }]),
      }),
    );

    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "paymentMethod"]);
    expect(result.values.firstName).toBe("Ayesha");
  });
});
