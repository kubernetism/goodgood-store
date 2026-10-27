import { describe, expect, it } from "vitest";
import { subscribeToNewsletter } from "@/features/newsletter/actions";
import { sendContactMessage } from "./actions";
import { validateContact } from "./validation";

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
  it("acknowledges a valid contact message by first name", async () => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(valid)) formData.set(key, value);
    const result = await sendContactMessage({ status: "idle" }, formData);
    expect(result).toMatchObject({ status: "success" });
    if (result.status === "success") expect(result.message).toContain("Priya");
  });

  it("rejects an invalid newsletter email", async () => {
    const formData = new FormData();
    formData.set("email", "hello@");
    expect((await subscribeToNewsletter({ status: "idle" }, formData)).status).toBe("error");
  });
});
