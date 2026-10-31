import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  select: vi.fn(),
  execute: vi.fn(),
  update: vi.fn(),
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ db: { select: mocks.select, execute: mocks.execute, update: mocks.update } }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("@/server/media/upload", () => ({ storeUploadedImage: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));

import { changeOrderStatus, saveCourierDetails } from "./actions";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}
function currentStatus(status: string) {
  mocks.select.mockReturnValue({ from: () => ({ where: () => ({ limit: async () => [{ status }] }) }) });
}
/** The SQL text and parameters of the single statement the action ran. */
function executed() {
  const query = mocks.execute.mock.calls[0]?.[0] as { queryChunks: unknown[] };
  const text = JSON.stringify(query.queryChunks);
  return text;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ email: "owner@example.com" });
  mocks.execute.mockResolvedValue({ rows: [{ changed: 1 }] });
});

describe("changeOrderStatus", () => {
  it("requires an admin before reading or writing", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("unauthorized"));
    await expect(changeOrderStatus(form({ id, status: "packed" }))).rejects.toThrow("unauthorized");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("moves a confirmed order to packed in one statement", async () => {
    currentStatus("confirmed");
    await expect(changeOrderStatus(form({ id, status: "packed" }))).rejects.toThrow(`redirect:/admin/orders/${id}?saved=1`);
    expect(mocks.execute).toHaveBeenCalledOnce();
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
  it("refuses to skip a stage", async () => {
    currentStatus("confirmed");
    await expect(changeOrderStatus(form({ id, status: "shipped" }))).rejects.toThrow("no+longer+available");
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("requires confirmation and a valid reason before cancelling, without touching the database", async () => {
    await expect(changeOrderStatus(form({ id, status: "cancelled", reason: "customer_request" }))).rejects.toThrow("Confirm+cancellation+first");
    await expect(changeOrderStatus(form({ id, status: "cancelled", confirm: "yes" }))).rejects.toThrow("Choose+why");
    await expect(changeOrderStatus(form({ id, status: "cancelled", confirm: "yes", reason: "other" }))).rejects.toThrow("Describe+the+reason");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("cancels with the reason on the order and the event, and restocks", async () => {
    currentStatus("dispatched");
    await expect(changeOrderStatus(form({ id, status: "cancelled", confirm: "yes", reason: "returned", note: "Refused at door" }))).rejects.toThrow("saved=1");
    const sqlText = executed();
    expect(sqlText).toContain("returned");
    expect(sqlText).toContain("Refused at door");
    expect(sqlText).toContain("cancel_reason");
    expect(mocks.updateTag).toHaveBeenCalledOnce();
  });
  it("records courier details when dispatching and rejects bad tracking numbers", async () => {
    currentStatus("packed");
    await expect(changeOrderStatus(form({ id, status: "dispatched", courierName: "TCS", trackingNumber: "<x>" }))).rejects.toThrow("tracking+number");
    expect(mocks.execute).not.toHaveBeenCalled();
    await expect(changeOrderStatus(form({ id, status: "dispatched", courierName: "TCS", trackingNumber: "TCS-77" }))).rejects.toThrow("saved=1");
    expect(executed()).toContain("TCS-77");
  });
  it("reports a concurrent change instead of claiming success", async () => {
    currentStatus("pending");
    mocks.execute.mockResolvedValueOnce({ rows: [{ changed: 0 }] });
    await expect(changeOrderStatus(form({ id, status: "confirmed" }))).rejects.toThrow("changed+elsewhere");
  });
});

describe("saveCourierDetails", () => {
  it("requires an admin", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("unauthorized"));
    await expect(saveCourierDetails(form({ id, courierName: "TCS" }))).rejects.toThrow("unauthorized");
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("only updates an order that is with the courier", async () => {
    mocks.update.mockReturnValue({ set: () => ({ where: () => ({ returning: async () => [] }) }) });
    await expect(saveCourierDetails(form({ id, courierName: "TCS", trackingNumber: "1" }))).rejects.toThrow("only%20be%20changed");
    mocks.update.mockReturnValue({ set: () => ({ where: () => ({ returning: async () => [{ id }] }) }) });
    await expect(saveCourierDetails(form({ id, courierName: "TCS", trackingNumber: "1" }))).rejects.toThrow(`redirect:/admin/orders/${id}?courier=1`);
  });
});
