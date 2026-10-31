import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ select: vi.fn(), requireAdmin: vi.fn() }));
vi.mock("@/db/client", () => ({ db: { select: mocks.select } }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/features/admin/actions", () => ({ changeOrderStatus: vi.fn() }));
import OrderPage from "@/app/admin/(protected)/orders/[id]/page";
import { formatPrice } from "@/lib/format";

const id = "f84da7af-a29d-4638-85e9-d1705a694d18";
const order = {
  id, number: 1002, status: "confirmed", createdAt: new Date("2026-10-30T10:00:00Z"),
  firstName: "Test", lastName: "Customer", phone: "+923001234567", email: "buyer@example.com",
  street: "12 Main Street", apartment: "Near the station", city: "Peshawar", province: "Khyber Pakhtunkhwa",
  postalCode: "25000", notes: "Call before delivery", paymentMethod: "cod", itemCount: 2,
  subtotal: 200000, shipping: 25000, total: 225000,
};
const items = [{ id: "item-1", productName: "Sidr Honey", unit: "500 g", quantity: 2, unitPrice: 100000, lineTotal: 200000 }];

function mockQueries(currentOrder: typeof order) {
  mocks.select
    .mockReturnValueOnce({ from: () => ({ where: () => ({ limit: async () => [currentOrder] }) }) })
    .mockReturnValueOnce({ from: () => ({ where: async () => items }) })
    .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: async () => [] }) }) });
}

describe("admin order details", () => {
  beforeEach(() => { mocks.select.mockReset(); });

  it("shows all checkout fields, order totals and a print button for a confirmed order", async () => {
    mockQueries(order);
    const page = await OrderPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(page);
    for (const value of ["Test Customer", order.phone, order.email, order.street, order.apartment, order.city, order.province, order.postalCode, order.notes, "Pakistan", "Sidr Honey", "500 g", "Cash on delivery", "Print shipping details"]) {
      expect(html).toContain(value);
    }
    expect(html).toContain("Rs 2,250");
  });

  it("keeps the print action unavailable until an order is confirmed", async () => {
    mockQueries({ ...order, status: "pending" });
    const page = await OrderPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(page);
    expect(html).toContain("Confirmation is manual");
    expect(html).not.toContain("Print shipping details");
    expect(html).toContain("Confirmed");
  });

  it("offers one forward step as a single button and keeps Cancel separate and confirmed (O3)", async () => {
    mockQueries({ ...order, status: "pending" });
    const html = renderToStaticMarkup(await OrderPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));
    expect(html).toContain("Mark as confirmed");
    expect(html).toContain('name="status" value="confirmed"');
    expect(html).not.toContain("<select");
    // Cancel lives in its own form with a required confirmation checkbox.
    expect(html).toContain('name="status" value="cancelled"');
    const confirmBox = /<input type="checkbox"[^>]*name="confirm"[^>]*>/.exec(html)?.[0] ?? "";
    expect(confirmBox).toContain('value="yes"');
    expect(confirmBox).toContain("required");
    expect(html).toContain("Cancel this order and return 2 items to stock");
  });

  it("offers no status buttons for a delivered order", async () => {
    mockQueries({ ...order, status: "delivered" });
    const html = renderToStaticMarkup(await OrderPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));
    expect(html).toContain("This order is complete.");
    expect(html).not.toContain('name="status"');
  });

  it("links the customer phone for calls and WhatsApp (O4)", async () => {
    mockQueries(order);
    const html = renderToStaticMarkup(await OrderPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));
    expect(html).toContain('href="tel:+923001234567"');
    expect(html).toContain('href="https://wa.me/923001234567"');
  });

  it("prints a courier slip with the amount to collect and the store's Peshawar address", async () => {
    mockQueries(order);
    const html = renderToStaticMarkup(await OrderPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));
    expect(html).toContain(`Collect on delivery: ${formatPrice(order.total)}`);
    expect(html).toContain("Peshawar, Pakistan.");
    expect(html).toContain("Honey by Abdul Sami Enterprises");
  });
});

