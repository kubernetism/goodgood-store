import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  remove: vi.fn(),
  after: vi.fn(),
  getClientIp: vi.fn(),
  getClientIpHash: vi.fn(),
  findTrackedOrder: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/db/client", () => ({ db: { select: mocks.select, insert: mocks.insert, delete: mocks.remove } }));
vi.mock("@/server/request", () => ({ getClientIp: mocks.getClientIp, getClientIpHash: mocks.getClientIpHash }));
vi.mock("./lookup", () => ({ findTrackedOrder: mocks.findTrackedOrder }));
import { trackOrder } from "./actions";
import { TRACKING_NOT_FOUND } from "./model";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
function recentLookups(value: number) {
  mocks.select.mockReturnValue({ from: () => ({ where: async () => [{ value }] }) });
}
const idle = { status: "idle" } as const;
const tracked = { orderNumber: "AS-1001", status: "packed", firstName: "Ayesha" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getClientIp.mockResolvedValue("203.0.113.9");
  mocks.getClientIpHash.mockResolvedValue("hash");
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.values.mockResolvedValue(undefined);
  recentLookups(0);
});

describe("trackOrder", () => {
  it("rejects malformed input without touching the database", async () => {
    const state = await trackOrder(idle, form({ order: "hello", phone: "123" }));
    expect(state.status).toBe("error");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.findTrackedOrder).not.toHaveBeenCalled();
  });
  it("looks the order up by number and normalised phone, and records the attempt", async () => {
    mocks.findTrackedOrder.mockResolvedValue(tracked);
    const state = await trackOrder(idle, form({ order: "as-1001", phone: "0300-1234567" }));
    expect(mocks.findTrackedOrder).toHaveBeenCalledWith(1001, "+923001234567");
    expect(mocks.values).toHaveBeenCalledWith({ ipHash: "hash" });
    expect(state).toEqual({ status: "found", order: tracked });
  });
  it("gives the same answer for a wrong number or a wrong phone and never echoes the phone", async () => {
    mocks.findTrackedOrder.mockResolvedValue(null);
    const state = await trackOrder(idle, form({ order: "AS-1001", phone: "03001234567" }));
    expect(state).toEqual({ status: "error", message: TRACKING_NOT_FOUND, fieldErrors: {}, values: { order: "AS-1001" } });
    expect(JSON.stringify(state)).not.toContain("1234567");
  });
  it("rate-limits lookups per IP hash", async () => {
    recentLookups(10);
    const state = await trackOrder(idle, form({ order: "AS-1001", phone: "03001234567" }));
    expect(state.status).toBe("error");
    if (state.status === "error") expect(state.message).toMatch(/Too many lookups/);
    expect(mocks.findTrackedOrder).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("skips the limit when the client IP is unknown", async () => {
    mocks.getClientIp.mockResolvedValue("unknown");
    mocks.findTrackedOrder.mockResolvedValue(tracked);
    const state = await trackOrder(idle, form({ order: "AS-1001", phone: "03001234567" }));
    expect(state.status).toBe("found");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.getClientIpHash).not.toHaveBeenCalled();
  });
  it("reports a lookup failure without leaking details", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.findTrackedOrder.mockRejectedValue(new Error("connection refused"));
    const state = await trackOrder(idle, form({ order: "AS-1001", phone: "03001234567" }));
    expect(state.status).toBe("error");
    expect(JSON.stringify(state)).not.toContain("connection refused");
    log.mockRestore();
  });
});
