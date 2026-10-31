import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), update: vi.fn(), remove: vi.fn(), returning: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { update: mocks.update, delete: mocks.remove } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { deleteMessage, markMessageOpened, setMessageRead } from "./message-actions";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ userId: id });
  mocks.returning.mockResolvedValue([{ id }]);
});

describe("message actions", () => {
  it("requires an authenticated admin before updating a message", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("unauthorized"));
    await expect(setMessageRead(form({ id, read: "yes" }))).rejects.toThrow("unauthorized");
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("marks a message read and refreshes the inbox", async () => {
    const set = vi.fn().mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    mocks.update.mockReturnValue({ set });
    await expect(setMessageRead(form({ id, read: "yes" }))).rejects.toThrow(`redirect:/admin/messages/${id}?saved=1`);
    expect(set).toHaveBeenCalledWith({ isRead: true });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/messages");
  });
  it("returns to the inbox after marking unread so opening it again doesn't undo the change", async () => {
    const set = vi.fn().mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    mocks.update.mockReturnValue({ set });
    await expect(setMessageRead(form({ id, read: "no" }))).rejects.toThrow("redirect:/admin/messages?unread=1");
    expect(set).toHaveBeenCalledWith({ isRead: false });
  });
  it("marks an unread message read when it is opened and refreshes the inbox", async () => {
    const set = vi.fn().mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    mocks.update.mockReturnValue({ set });
    await expect(markMessageOpened(id)).resolves.toBeUndefined();
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith({ isRead: true });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/messages");
  });
  it("does not refresh when the opened message was already read", async () => {
    mocks.update.mockReturnValue({ set: () => ({ where: () => ({ returning: async () => [] }) }) });
    await markMessageOpened(id);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
  it("ignores invalid ids and swallows write failures when auto-marking", async () => {
    await markMessageOpened("not-a-uuid");
    expect(mocks.update).not.toHaveBeenCalled();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.update.mockReturnValue({ set: () => ({ where: () => ({ returning: async () => { throw new Error("db down"); } }) }) });
    await expect(markMessageOpened(id)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
  it("requires an admin before auto-marking", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("unauthorized"));
    await expect(markMessageOpened(id)).rejects.toThrow("unauthorized");
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects unknown statuses instead of writing", async () => {
    await expect(setMessageRead(form({ id, read: "maybe" }))).rejects.toThrow("Invalid%20message%20status");
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("requires confirmation before permanently deleting", async () => {
    await expect(deleteMessage(form({ id }))).rejects.toThrow("Confirm%20message%20deletion%20first");
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("deletes only a confirmed message", async () => {
    mocks.remove.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    await expect(deleteMessage(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/messages?deleted=1");
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.remove).toHaveBeenCalledOnce();
  });
});
