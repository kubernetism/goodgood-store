import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), insert: vi.fn(), update: vi.fn(), remove: vi.fn(), returning: vi.fn(), updateTag: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { insert: mocks.insert, update: mocks.update, delete: mocks.remove } }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { deleteTestimonial, saveTestimonial } from "./testimonial-actions";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
function form(extra: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: "Customer", role: "Lahore", quote: "Great honey", rating: "5", sortOrder: "0", ...extra })) data.set(key, value);
  return data;
}
beforeEach(() => { vi.clearAllMocks(); mocks.requireAdmin.mockResolvedValue({ userId: id }); mocks.returning.mockResolvedValue([{ id }]); });

describe("testimonial actions", () => {
  it("creates hidden testimonials and refreshes the storefront cache", async () => {
    const values = vi.fn().mockReturnValue({ returning: mocks.returning });
    mocks.insert.mockReturnValue({ values });
    await expect(saveTestimonial(form())).rejects.toThrow(/redirect:\/admin\/testimonials\/.+\?saved=1/);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ isActive: false, name: "Customer" }));
    expect(mocks.updateTag).toHaveBeenCalledWith("testimonials");
  });
  it("updates and makes a testimonial visible", async () => {
    const set = vi.fn().mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    mocks.update.mockReturnValue({ set });
    await expect(saveTestimonial(form({ id, isActive: "yes" }))).rejects.toThrow(`redirect:/admin/testimonials/${id}?saved=1`);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }));
  });
  it("requires confirmation before deleting", async () => {
    await expect(deleteTestimonial(form({ id }))).rejects.toThrow("Confirm%20testimonial%20deletion%20first");
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("deletes a confirmed testimonial and refreshes the storefront", async () => {
    mocks.remove.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    await expect(deleteTestimonial(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/testimonials?saved=1");
    expect(mocks.updateTag).toHaveBeenCalledWith("testimonials");
  });
  it("rejects invalid testimonial data before writing", async () => {
    await expect(saveTestimonial(form({ rating: "6" }))).rejects.toThrow("redirect:/admin/testimonials/new?error=");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
