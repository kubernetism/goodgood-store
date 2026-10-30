import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  batch: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  returning: vi.fn(),
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  storeUploadedImage: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ db: { batch: mocks.batch, update: mocks.update, insert: mocks.insert, delete: mocks.remove } }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("@/server/media/upload", () => ({ storeUploadedImage: mocks.storeUploadedImage }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));

import { deleteCategory, deleteProduct, saveCategory, saveProduct, setProductVisibility, uploadImageInline } from "./actions";

const id = "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ userId: id });
  mocks.remove.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
  mocks.set.mockReturnValue({ where: () => "update-product" });
  mocks.update.mockReturnValue({ set: mocks.set });
  mocks.returning.mockResolvedValue([{ id }]);
  mocks.batch.mockResolvedValue([]);
});

describe("inline image upload", () => {
  it("requires an admin and returns the new selectable image", async () => {
    mocks.storeUploadedImage.mockResolvedValue({ image: { id, alt: "Honey jar" } });
    const data = form({ alt: "Honey jar" });
    await expect(uploadImageInline(data)).resolves.toEqual({ image: { id, alt: "Honey jar" } });
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/media");
  });
  it("reports upload errors without refreshing the library", async () => {
    mocks.storeUploadedImage.mockResolvedValue({ error: "Invalid image" });
    await expect(uploadImageInline(form({}))).resolves.toEqual({ error: "Invalid image" });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("category actions", () => {
  it("creates a category and refreshes the catalogue", async () => {
    const values = vi.fn().mockReturnValue({ returning: mocks.returning });
    mocks.insert.mockReturnValue({ values });
    const data = form({ name: "New honey", slug: "new-honey", blurb: "", sortOrder: "0", imageId: "", isActive: "yes" });
    await expect(saveCategory(data)).rejects.toThrow(/redirect:\/admin\/categories\/.+\?saved=1/);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ name: "New honey", isActive: true }));
    expect(mocks.updateTag).toHaveBeenCalledWith("catalog");
  });

  it("updates category visibility", async () => {
    mocks.set.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    const data = form({ id, name: "Honey", slug: "honey", blurb: "", sortOrder: "1", imageId: "" });
    await expect(saveCategory(data)).rejects.toThrow(`redirect:/admin/categories/${id}?saved=1`);
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
  });

  it("requires confirmation to delete", async () => {
    await expect(deleteCategory(form({ id }))).rejects.toThrow("Confirm%20category%20deletion%20first");
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("deletes an empty category and refreshes the catalogue", async () => {
    await expect(deleteCategory(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/categories?saved=1");
    expect(mocks.updateTag).toHaveBeenCalledWith("catalog");
  });

  it("reports categories that cannot be deleted because products still reference them", async () => {
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.returning.mockRejectedValue(new Error("query failed", { cause: { code: "23503" } }));
    await expect(deleteCategory(form({ id, confirm: "yes" }))).rejects.toThrow("Move%20or%20delete%20this%20category");
    expect(mocks.updateTag).not.toHaveBeenCalled();
    logger.mockRestore();
  });
});

describe("existing product actions", () => {
  it.each([[true, "active"], [false, "draft"]] as const)("sets visibility to %s and refreshes the storefront", async (active, status) => {
    mocks.set.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    await expect(setProductVisibility(id, active)).resolves.toEqual({});
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.set).toHaveBeenCalledWith({ status });
    expect(mocks.updateTag).toHaveBeenCalledWith("catalog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/products");
  });

  it("reports a missing product without invalidating the catalogue", async () => {
    mocks.set.mockReturnValue({ where: () => ({ returning: mocks.returning }) });
    mocks.returning.mockResolvedValue([]);
    await expect(setProductVisibility(id, true)).resolves.toEqual({ error: "Product not found." });
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });

  it("rejects an invalid product before updating it", async () => {
    await expect(setProductVisibility("invalid", true)).resolves.toEqual({ error: "Invalid product or visibility." });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("saves edited product fields and refreshes the catalogue", async () => {
    const data = form({ id, name: "Edited honey", slug: "edited-honey", categoryId: id, active: "yes", inactiveStatus: "draft", price: "2450", compareAtPrice: "", stock: "5", rating: "4.5", reviewCount: "3", unit: "250 g", origin: "Karak", harvest: "Autumn", floralSource: "Sidr", tasteNotes: "Rich", summary: "Honey", description: "Raw honey", listedOn: "2026-10-01", sortOrder: "0" });
    await expect(saveProduct(data)).rejects.toThrow(`redirect:/admin/products/${id}?saved=1`);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.batch).toHaveBeenCalledOnce();
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ status: "active" }));
    expect(mocks.updateTag).toHaveBeenCalledWith("catalog");
  });

  it.each([["draft", "draft"], ["archived", "archived"]])("keeps unchecked products with %s status hidden", async (inactiveStatus, status) => {
    const data = form({ id, name: "Honey", slug: "honey", categoryId: id, inactiveStatus, price: "2450", compareAtPrice: "", stock: "5", rating: "4.5", reviewCount: "3", unit: "250 g", origin: "Karak", harvest: "Autumn", floralSource: "Sidr", tasteNotes: "Rich", summary: "Honey", description: "Raw honey", listedOn: "2026-10-01", sortOrder: "0" });
    await expect(saveProduct(data)).rejects.toThrow(`redirect:/admin/products/${id}?saved=1`);
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ status }));
    expect(mocks.updateTag).toHaveBeenCalledWith("catalog");
  });

  it("restores an archived product when Active is checked", async () => {
    const data = form({ id, name: "Honey", slug: "honey", categoryId: id, active: "yes", inactiveStatus: "archived", price: "2450", compareAtPrice: "", stock: "5", rating: "4.5", reviewCount: "3", unit: "250 g", origin: "Karak", harvest: "Autumn", floralSource: "Sidr", tasteNotes: "Rich", summary: "Honey", description: "Raw honey", listedOn: "2026-10-01", sortOrder: "0" });
    await expect(saveProduct(data)).rejects.toThrow(`redirect:/admin/products/${id}?saved=1`);
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ status: "active" }));
  });

  it("requires confirmation before deleting", async () => {
    await expect(deleteProduct(form({ id }))).rejects.toThrow("Confirm%20product%20deletion%20first");
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("deletes a confirmed product and refreshes catalogue and banner caches", async () => {
    await expect(deleteProduct(form({ id, confirm: "yes" }))).rejects.toThrow("redirect:/admin/products?saved=1");
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.returning).toHaveBeenCalledOnce();
    expect(mocks.updateTag).toHaveBeenCalledWith("catalog");
    expect(mocks.updateTag).toHaveBeenCalledWith("banners");
  });

  it("reports when a product is already missing", async () => {
    mocks.returning.mockResolvedValue([]);
    await expect(deleteProduct(form({ id, confirm: "yes" }))).rejects.toThrow("Product%20not%20found");
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});
