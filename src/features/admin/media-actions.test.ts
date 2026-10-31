import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  calls: [] as string[],
  returning: vi.fn(),
  removeObject: vi.fn(),
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { delete: () => ({ where: () => ({ returning: async () => { mocks.calls.push("row"); return mocks.returning(); } }) }) } }));
vi.mock("@/server/media/storage", () => ({ getMediaStorage: () => ({ remove: async (key: string) => { mocks.calls.push(`object:${key}`); return mocks.removeObject(key); } }) }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { deleteMedia } from "./actions";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.calls = [];
  mocks.requireAdmin.mockResolvedValue({ userId: id });
  mocks.returning.mockResolvedValue([{ storageKey: "media/jar.webp" }]);
  mocks.removeObject.mockResolvedValue(undefined);
});

describe("deleteMedia", () => {
  it("deletes the database row before the stored object", async () => {
    await expect(deleteMedia(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/media?saved=1");
    expect(mocks.calls).toEqual(["row", "object:media/jar.webp"]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/media");
  });
  it("still succeeds when only the object removal fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.removeObject.mockRejectedValue(new Error("storage down"));
    await expect(deleteMedia(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/media?saved=1");
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
  it("keeps the stored object when the row cannot be deleted", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.returning.mockRejectedValue(new Error("database down"));
    await expect(deleteMedia(form({ id, confirm: "yes" }))).rejects.toThrow("Could%20not%20delete%20the%20image");
    expect(mocks.calls).toEqual(["row"]);
    log.mockRestore();
  });
  it("reports a missing image without touching storage", async () => {
    mocks.returning.mockResolvedValue([]);
    await expect(deleteMedia(form({ id, confirm: "yes" }))).rejects.toThrow("Image%20not%20found");
    expect(mocks.removeObject).not.toHaveBeenCalled();
  });
  it("requires confirmation", async () => {
    await expect(deleteMedia(form({ id }))).rejects.toThrow("Confirm%20deletion%20first");
    expect(mocks.calls).toEqual([]);
  });
});
