import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), insert: vi.fn(), update: vi.fn(), remove: vi.fn(), returning: vi.fn(), updateTag: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { insert: mocks.insert, update: mocks.update, delete: mocks.remove } }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { deleteBlogPost, saveBlogPost } from "./blog-actions";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
function postForm(extra: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ title: "A post", slug: "a-post", excerpt: "Honey", category: "beekeeping", author: "Admin", publishedOn: "2026-10-29", tags: "Bees", body: "Hello", coverId: "", ...extra })) form.set(key, value);
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ userId: id });
  mocks.returning.mockResolvedValue([{ id }]);
});

describe("blog actions", () => {
  it("creates a draft and refreshes the published feed", async () => {
    const values = vi.fn().mockReturnValue({ returning: mocks.returning });
    mocks.insert.mockReturnValue({ values });
    await expect(saveBlogPost(postForm())).rejects.toThrow(/redirect:\/admin\/blog\/.+\?saved=1/);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ title: "A post", isPublished: false }));
    expect(mocks.updateTag).toHaveBeenCalledWith("blog");
  });
  it("updates and publishes an existing post", async () => {
    const set = vi.fn().mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    mocks.update.mockReturnValue({ set });
    await expect(saveBlogPost(postForm({ id, isPublished: "yes" }))).rejects.toThrow(`redirect:/admin/blog/${id}?saved=1`);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ isPublished: true }));
  });
  it("requires confirmation before deleting a post", async () => {
    await expect(deleteBlogPost(postForm({ id }))).rejects.toThrow("Confirm%20post%20deletion%20first");
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("deletes a confirmed post and refreshes the feed", async () => {
    mocks.remove.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    await expect(deleteBlogPost(postForm({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/blog?saved=1");
    expect(mocks.updateTag).toHaveBeenCalledWith("blog");
  });
  it("rejects invalid slugs before writing", async () => {
    await expect(saveBlogPost(postForm({ slug: "Invalid!" }))).rejects.toThrow("Use%20lowercase");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
