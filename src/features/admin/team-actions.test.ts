import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(), insert: vi.fn(), update: vi.fn(), remove: vi.fn(), select: vi.fn(), batch: vi.fn(), returning: vi.fn(), updateTag: vi.fn(), revalidatePath: vi.fn(),
}));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { insert: mocks.insert, update: mocks.update, delete: mocks.remove, select: mocks.select, batch: mocks.batch } }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { deleteTeamMember, moveTeamMember, saveTeamMember } from "./team-actions";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
const other = "8a2e3d4c-5b6f-4a71-9b8c-0d1e2f3a4b5c";
function form(extra: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: "Salman Sami", role: "Founder", bio: "", photoId: "", email: "", phone: "", facebookUrl: "", instagramUrl: "", linkedinUrl: "", xUrl: "", ...extra })) data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ userId: id });
  mocks.returning.mockResolvedValue([{ id }]);
  mocks.update.mockReturnValue({ set: () => ({ where: () => ({ returning: mocks.returning }) }) });
});

describe("team member actions", () => {
  it("checks the admin session before anything else", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(saveTeamMember(form())).rejects.toThrow("redirect:/admin/login");
    await expect(deleteTeamMember(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/login");
    await expect(moveTeamMember(form({ id, direction: "up" }))).rejects.toThrow("redirect:/admin/login");
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it("creates hidden members at the end of the list and refreshes the About page cache", async () => {
    const values = vi.fn().mockReturnValue({ returning: mocks.returning });
    mocks.insert.mockReturnValue({ values });
    await expect(saveTeamMember(form())).rejects.toThrow(/redirect:\/admin\/team\/.+\?saved=1/);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ name: "Salman Sami", isPublished: false, photoId: null, email: null }));
    expect(values.mock.calls[0]?.[0]).toHaveProperty("sortOrder");
    expect(mocks.updateTag).toHaveBeenCalledWith("team");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/team");
  });

  it("updates and publishes a member", async () => {
    const set = vi.fn().mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    mocks.update.mockReturnValue({ set });
    await expect(saveTeamMember(form({ id, isPublished: "yes", phone: "0311 9000985", phoneOnWhatsapp: "yes" }))).rejects.toThrow(`redirect:/admin/team/${id}?saved=1`);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ isPublished: true, phone: "+923119000985", phoneOnWhatsapp: true }));
    expect(set.mock.calls[0]?.[0]).not.toHaveProperty("sortOrder");
  });

  it("rejects invalid data before writing", async () => {
    await expect(saveTeamMember(form({ instagramUrl: "https://evil.example" }))).rejects.toThrow("redirect:/admin/team/new?error=");
    await expect(saveTeamMember(form({ id: "nope" }))).rejects.toThrow("redirect:/admin/team?error=");
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("explains when the chosen photo was deleted meanwhile", async () => {
    mocks.update.mockReturnValue({ set: () => ({ where: () => ({ returning: () => Promise.reject(Object.assign(new Error("fk"), { code: "23503" })) }) }) });
    await expect(saveTeamMember(form({ id, photoId: other }))).rejects.toThrow(/redirect:\/admin\/team\/.+\?error=That%20photo/);
  });

  it("requires confirmation before deleting", async () => {
    await expect(deleteTeamMember(form({ id }))).rejects.toThrow("Confirm%20the%20deletion%20first");
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("deletes a confirmed member and refreshes the About page", async () => {
    mocks.remove.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    await expect(deleteTeamMember(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/team?saved=deleted");
    expect(mocks.updateTag).toHaveBeenCalledWith("team");
  });

  it("moves a member in one batch and re-renders in place", async () => {
    mocks.select.mockReturnValue({ from: () => ({ orderBy: () => Promise.resolve([{ id: other, sortOrder: 0 }, { id, sortOrder: 1 }]) }) });
    await expect(moveTeamMember(form({ id, direction: "up" }))).resolves.toBeUndefined();
    expect(mocks.batch).toHaveBeenCalledOnce();
    expect(mocks.batch.mock.calls[0]?.[0]).toHaveLength(2);
    expect(mocks.updateTag).toHaveBeenCalledWith("team");
  });

  it("ignores moves past the edge without writing", async () => {
    mocks.select.mockReturnValue({ from: () => ({ orderBy: () => Promise.resolve([{ id, sortOrder: 0 }]) }) });
    await expect(moveTeamMember(form({ id, direction: "up" }))).resolves.toBeUndefined();
    expect(mocks.batch).not.toHaveBeenCalled();
  });

  it("rejects an invalid move direction", async () => {
    await expect(moveTeamMember(form({ id, direction: "left" }))).rejects.toThrow("redirect:/admin/team?error=Invalid%20move.");
    expect(mocks.select).not.toHaveBeenCalled();
  });
});
