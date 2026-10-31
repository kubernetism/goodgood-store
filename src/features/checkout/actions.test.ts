import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ip: vi.fn(),
  ipHash: vi.fn(),
  recent: vi.fn(),
  orderValues: vi.fn(),
  batch: vi.fn(),
}));
const product = { id: "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b", slug: "sidr-honey", name: "Sidr Honey", unit: "500 g", price: 250000, stock: 10 };
vi.mock("@/db/client", () => ({ db: {
  // Rate-limit count: select().from().where(); live catalogue: select().from().innerJoin().where().
  select: () => ({ from: () => ({ where: mocks.recent, innerJoin: () => ({ where: async () => [product] }) }) }),
  insert: () => ({ values: (values: unknown) => { mocks.orderValues(values); return { returning: () => "insert-order" }; } }),
  update: () => ({ set: () => ({ where: () => "update-stock" }) }),
  batch: mocks.batch,
} }));
vi.mock("@/server/request", () => ({ getClientIp: mocks.ip, getClientIpHash: mocks.ipHash }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/features/admin/whatsapp-settings-data", () => ({ getOrderWhatsappNumber: async () => null }));
import { placeOrder } from "./actions";

function checkoutForm() {
  const data = new FormData();
  const fields = { firstName: "Ayesha", lastName: "Khan", phone: "0300 1234567", email: "", province: "Punjab", city: "Lahore", street: "12 Mall Road", apartment: "", postalCode: "", notes: "", paymentMethod: "cod" };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  data.set("cart", JSON.stringify([{ slug: product.slug, quantity: 1 }]));
  return data;
}
const orderInsert = () => mocks.orderValues.mock.calls.map(([values]) => values).find((values) => typeof values === "object" && values && "firstName" in values);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.ip.mockResolvedValue("203.0.113.7");
  mocks.ipHash.mockResolvedValue("hashed-ip");
  mocks.recent.mockResolvedValue([{ value: 0 }]);
  mocks.batch.mockResolvedValue([[{ number: 1001 }]]);
});

describe("placeOrder rate limit", () => {
  it("limits repeated orders from the same client IP", async () => {
    mocks.recent.mockResolvedValue([{ value: 5 }]);
    const result = await placeOrder({ status: "idle" }, checkoutForm());
    expect(result).toMatchObject({ status: "error", message: expect.stringContaining("several orders") });
    expect(mocks.batch).not.toHaveBeenCalled();
  });
  it("stores the IP hash with an order from a known client", async () => {
    expect(await placeOrder({ status: "idle" }, checkoutForm())).toMatchObject({ status: "success", orderNumber: "AS-1001" });
    expect(orderInsert()).toMatchObject({ ipHash: "hashed-ip" });
  });
  it("does not put every visitor without a client IP into one shared bucket", async () => {
    mocks.ip.mockResolvedValue("unknown");
    expect(await placeOrder({ status: "idle" }, checkoutForm())).toMatchObject({ status: "success" });
    expect(mocks.recent).not.toHaveBeenCalled();
    expect(mocks.ipHash).not.toHaveBeenCalled();
    expect(orderInsert()).toMatchObject({ ipHash: null });
  });
});
