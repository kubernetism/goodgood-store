import { beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeToNewsletter } from "@/features/newsletter/actions";
import { sendContactMessage } from "./actions";
import { validateContact } from "./validation";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  recent: vi.fn(),
  ip: vi.fn(),
  ipHash: vi.fn(),
}));
vi.mock("@/db/client", () => ({ db: {
  insert: () => ({ values: mocks.insert }),
  select: () => ({ from: () => ({ where: mocks.recent }) }),
} }));
vi.mock("@/server/request", () => ({ getClientIp: mocks.ip, getClientIpHash: mocks.ipHash }));

const valid = {
  name: "Priya Raman",
  email: "priya@example.com",
  service: "bulk-orders",
  phone: "",
  message: "Do you deliver to restaurants twice a week?",
  consent: "on",
};

describe("validateContact", () => {
  it("accepts a complete message and normalises the optional phone", () => {
    const result = validateContact(valid);
    expect(result).toEqual({ ok: true, data: { ...valid, phone: null, consent: undefined } });
  });

  it("reports every invalid field", () => {
    const result = validateContact({ name: "A", email: "nope", service: "x", phone: "12", message: "hi", consent: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(["consent", "email", "message", "name", "phone", "service"]);
    }
  });
});

describe("contact & newsletter actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ip.mockResolvedValue("127.0.0.1");
    mocks.ipHash.mockResolvedValue("hashed-ip");
    mocks.recent.mockResolvedValue([{ value: 0 }]);
    mocks.insert.mockResolvedValue(undefined);
  });

  function contactForm(overrides: Record<string, string> = {}) {
    const formData = new FormData();
    for (const [key, value] of Object.entries({ ...valid, ...overrides })) formData.set(key, value);
    return formData;
  }

  it("saves a valid message and acknowledges it by first name", async () => {
    const result = await sendContactMessage({ status: "idle" }, contactForm());
    expect(result).toMatchObject({ status: "success" });
    if (result.status === "success") expect(result.message).toContain("Priya");
    expect(mocks.insert).toHaveBeenCalledWith({ name: valid.name, email: valid.email, service: valid.service, phone: null, message: valid.message, consent: true, ipHash: "hashed-ip" });
  });

  it("rejects invalid submissions without storing them", async () => {
    const result = await sendContactMessage({ status: "idle" }, contactForm({ consent: "", email: "invalid" }));
    expect(result).toMatchObject({ status: "error", fieldErrors: { consent: expect.any(String), email: expect.any(String) } });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("reports database failures and keeps the submitted values", async () => {
    mocks.insert.mockRejectedValue(new Error("database unavailable"));
    const result = await sendContactMessage({ status: "idle" }, contactForm());
    expect(result).toMatchObject({ status: "error", values: valid, message: expect.stringContaining("couldn't send") });
  });

  it("limits repeated messages from the same client", async () => {
    mocks.recent.mockResolvedValue([{ value: 5 }]);
    const result = await sendContactMessage({ status: "idle" }, contactForm());
    expect(result).toMatchObject({ status: "error", message: expect.stringContaining("several messages") });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("does not block unrelated visitors when no client IP is available", async () => {
    mocks.ip.mockResolvedValue("unknown");
    expect((await sendContactMessage({ status: "idle" }, contactForm())).status).toBe("success");
    expect(mocks.recent).not.toHaveBeenCalled();
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ ipHash: null }));
  });

  it("rejects an invalid newsletter email", async () => {
    const formData = new FormData();
    formData.set("email", "hello@");
    expect((await subscribeToNewsletter({ status: "idle" }, formData)).status).toBe("error");
  });
});
