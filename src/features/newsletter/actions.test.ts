import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  onConflictDoNothing: vi.fn(),
  getClientIp: vi.fn(),
  getClientIpHash: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ db: { select: mocks.select, insert: mocks.insert } }));
vi.mock("@/server/request", () => ({ getClientIp: mocks.getClientIp, getClientIpHash: mocks.getClientIpHash }));
import { subscribeToNewsletter } from "./actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
function recentSignups(value: number) {
  mocks.select.mockReturnValue({ from: () => ({ where: async () => [{ value }] }) });
}
const idle = { status: "idle" } as const;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getClientIp.mockResolvedValue("203.0.113.9");
  mocks.getClientIpHash.mockResolvedValue("hash");
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.values.mockReturnValue({ onConflictDoNothing: mocks.onConflictDoNothing });
  mocks.onConflictDoNothing.mockResolvedValue(undefined);
  recentSignups(0);
});

describe("subscribeToNewsletter", () => {
  it("rejects an invalid email without touching the database", async () => {
    const state = await subscribeToNewsletter(idle, form({ email: "not-an-email" }));
    expect(state.status).toBe("error");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("stores the address lower-cased with its source and IP hash, ignoring duplicates", async () => {
    const state = await subscribeToNewsletter(idle, form({ email: " Ayesha@Example.COM ", source: "about" }));
    expect(state.status).toBe("success");
    expect(mocks.values).toHaveBeenCalledWith({ email: "ayesha@example.com", source: "about", ipHash: "hash" });
    expect(mocks.onConflictDoNothing).toHaveBeenCalledOnce();
  });
  it("reports success for an address already on the list (no enumeration)", async () => {
    const first = await subscribeToNewsletter(idle, form({ email: "a@b.com" }));
    const again = await subscribeToNewsletter(idle, form({ email: "a@b.com" }));
    expect(again).toEqual(first);
  });
  it("falls back to the footer for an unknown source", async () => {
    await subscribeToNewsletter(idle, form({ email: "a@b.com", source: "<evil>" }));
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ source: "footer" }));
  });
  it("rate-limits sign-ups per IP hash", async () => {
    recentSignups(5);
    const state = await subscribeToNewsletter(idle, form({ email: "a@b.com" }));
    expect(state.status).toBe("error");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("skips the limit and stores no hash when the IP is unknown", async () => {
    mocks.getClientIp.mockResolvedValue("unknown");
    await subscribeToNewsletter(idle, form({ email: "a@b.com" }));
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ ipHash: null }));
  });
  it("hides database errors behind a friendly message", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.onConflictDoNothing.mockRejectedValue(new Error("relation does not exist"));
    const state = await subscribeToNewsletter(idle, form({ email: "a@b.com" }));
    expect(state.status).toBe("error");
    expect(JSON.stringify(state)).not.toContain("relation");
    log.mockRestore();
  });
});
