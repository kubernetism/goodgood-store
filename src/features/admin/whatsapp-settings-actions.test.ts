import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), insert: vi.fn(), values: vi.fn(), upsert: vi.fn(), updateTag: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/db/client", () => ({ db: { insert: mocks.insert } }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import { saveWhatsappSettings } from "./whatsapp-settings-actions";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({});
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.values.mockReturnValue({ onConflictDoUpdate: mocks.upsert });
  mocks.upsert.mockResolvedValue(undefined);
});

function form(number: string) { const data = new FormData(); data.set("orderWhatsappNumber", number); return data; }

describe("WhatsApp settings action", () => {
  it("saves a normalized number and refreshes the checkout setting", async () => {
    await expect(saveWhatsappSettings(form("0311-9000985"))).rejects.toThrow("redirect:/admin/settings?saved=1");
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.values).toHaveBeenCalledWith({ id: 1, orderWhatsappNumber: "+923119000985" });
    expect(mocks.updateTag).toHaveBeenCalledWith("store-settings");
  });

  it("rejects an invalid number and allows clearing it", async () => {
    await expect(saveWhatsappSettings(form("bad"))).rejects.toThrow("redirect:/admin/settings?error=");
    expect(mocks.insert).not.toHaveBeenCalled();
    await expect(saveWhatsappSettings(form(""))).rejects.toThrow("redirect:/admin/settings?saved=1");
    expect(mocks.values).toHaveBeenCalledWith({ id: 1, orderWhatsappNumber: null });
  });
});
