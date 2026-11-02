import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), insert: vi.fn(), values: vi.fn(), upsert: vi.fn(), updateTag: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { insert: mocks.insert } }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { saveSocialLinks } from "./social-settings-actions";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({});
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.values.mockReturnValue({ onConflictDoUpdate: mocks.upsert });
  mocks.upsert.mockResolvedValue(undefined);
});

function form(fields: Record<string, string>) { const data = new FormData(); for (const [k, v] of Object.entries(fields)) data.set(k, v); return data; }

describe("social links settings action", () => {
  it("requires an admin before reading the form", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("redirect:/admin/login"));
    await expect(saveSocialLinks(form({ facebookUrl: "facebook.com/a" }))).rejects.toThrow("redirect:/admin/login");
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("saves normalized links and refreshes the storefront settings cache", async () => {
    await expect(saveSocialLinks(form({ instagramUrl: "instagram.com/abdulsami", instagramVisible: "yes", youtubeUrl: "" }))).rejects.toThrow("redirect:/admin/settings?saved=social");
    const links = { instagram: { url: "https://instagram.com/abdulsami", visible: true } };
    expect(mocks.values).toHaveBeenCalledWith({ id: 1, socialLinks: links });
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ set: { socialLinks: links } }));
    expect(mocks.updateTag).toHaveBeenCalledWith("store-settings");
  });

  it("rejects an invalid link without writing", async () => {
    await expect(saveSocialLinks(form({ tiktokUrl: "https://tiktok.evil.example/@a" }))).rejects.toThrow("redirect:/admin/settings?error=");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
