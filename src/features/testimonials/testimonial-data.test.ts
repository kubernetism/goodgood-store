import { describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => vi.fn(async () => ({ rows: [] })));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/db/client", async () => {
  const { drizzle } = await import("drizzle-orm/pg-proxy");
  return { db: drizzle(query) };
});

import { getVisibleTestimonials } from "./testimonial-data";

describe("storefront testimonials", () => {
  it("queries only the first ten active testimonials in a stable order", async () => {
    await getVisibleTestimonials();
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toMatch(/where "testimonials"\."is_active" = \$1/i);
    expect(sql).toMatch(/order by "testimonials"\."sort_order" asc, "testimonials"\."created_at" asc, "testimonials"\."id" asc/i);
    expect(sql).toMatch(/limit \$2/i);
    expect(params).toEqual([true, 10]);
  });
});
