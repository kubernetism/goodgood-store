import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), remove: vi.fn(), returning: vi.fn(), revalidatePath: vi.fn(), select: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { delete: mocks.remove, select: mocks.select } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { deleteSubscriber } from "./subscriber-actions";
import { GET } from "@/app/admin/(protected)/subscribers/export/route";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ email: "owner@example.com" });
  mocks.remove.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
  mocks.returning.mockResolvedValue([{ id }]);
});

describe("deleteSubscriber", () => {
  it("requires an admin", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("unauthorized"));
    await expect(deleteSubscriber(form({ id, confirm: "yes" }))).rejects.toThrow("unauthorized");
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("requires a valid id and confirmation", async () => {
    await expect(deleteSubscriber(form({ id: "x", confirm: "yes" }))).rejects.toThrow("Invalid%20subscriber");
    await expect(deleteSubscriber(form({ id }))).rejects.toThrow("Confirm%20the%20removal");
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("deletes a confirmed subscriber and refreshes the list and dashboard", async () => {
    await expect(deleteSubscriber(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/subscribers?deleted=1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/subscribers");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin");
  });
  it("reports a subscriber that is already gone", async () => {
    mocks.returning.mockResolvedValue([]);
    await expect(deleteSubscriber(form({ id, confirm: "yes" }))).rejects.toThrow("not%20found");
  });
});

describe("subscriber CSV export", () => {
  it("is refused without an admin session", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("redirect:/admin/login"));
    await expect(GET()).rejects.toThrow("redirect:/admin/login");
    expect(mocks.select).not.toHaveBeenCalled();
  });
  it("downloads an escaped, uncached CSV", async () => {
    mocks.select.mockReturnValue({ from: () => ({ where: () => ({ orderBy: async () => [
      { email: "=cmd@evil.com", source: "footer", createdAt: new Date("2026-10-31T05:00:00Z") },
    ] }) }) });
    const response = await GET();
    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Content-Disposition")).toMatch(/^attachment; filename="subscribers-\d{4}-\d{2}-\d{2}\.csv"$/);
    const body = await response.text();
    expect(body).toContain('"\'=cmd@evil.com","Site footer","2026-10-31 10:00"');
  });
});
