import { beforeEach, describe, expect, it, vi } from "vitest";

/* A plain function (not a vi.fn spy) so a rejected query is only seen by the code under test. */
const proxy = vi.hoisted(() => ({
  sql: [] as string[],
  respond: async (): Promise<{ rows: unknown[] }> => ({ rows: [] }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: () => undefined, cacheTag: () => undefined }));
vi.mock("@/db/client", async () => {
  const { drizzle } = await import("drizzle-orm/pg-proxy");
  return { db: drizzle(async (sql: string) => { proxy.sql.push(sql); return proxy.respond(); }) };
});
vi.mock("@/lib/site", () => ({
  siteConfig: {
    socials: [
      { network: "facebook", label: "Facebook", href: "https://facebook.com" },
      { network: "instagram", label: "Instagram", href: "https://instagram.com/abdulsami" },
    ],
  },
}));

import { getSiteSocialLinks } from "./social-links-data";

const fallback = [{ network: "instagram", label: "Instagram", href: "https://instagram.com/abdulsami" }];
const pgError = (message: string, code: string) => Object.assign(new Error(message), { code });

beforeEach(() => { proxy.sql = []; });

describe("getSiteSocialLinks", () => {
  it("reads only the stored social links", async () => {
    proxy.respond = async () => ({ rows: [[{ facebook: { url: "https://facebook.com/abdulsamihoney", visible: true } }]] });
    await expect(getSiteSocialLinks()).resolves.toEqual([{ network: "facebook", label: "Facebook", href: "https://facebook.com/abdulsamihoney" }]);
    expect(proxy.sql[0]).toMatch(/select "social_links" from "store_settings" where "store_settings"\."id" = \$1/i);
  });

  it("falls back to real site config links when settings were never saved", async () => {
    proxy.respond = async () => ({ rows: [] });
    await expect(getSiteSocialLinks()).resolves.toEqual(fallback);
  });

  it("falls back before the social_links migration is applied", async () => {
    proxy.respond = async () => { throw pgError('column "social_links" does not exist', "42703"); };
    await expect(getSiteSocialLinks()).resolves.toEqual(fallback);
  });

  it("does not hide other database errors", async () => {
    proxy.respond = async () => { throw pgError("connection refused", "08006"); };
    await expect(getSiteSocialLinks()).rejects.toMatchObject({ cause: { code: "08006" } });
  });
});
