import { describe, expect, it } from "vitest";
import { adminNavGroups, isMoreActive, isNavItemActive } from "./nav";

describe("isNavItemActive", () => {
  it("matches Overview only on /admin itself", () => {
    expect(isNavItemActive("/admin", "/admin")).toBe(true);
    expect(isNavItemActive("/admin/orders", "/admin")).toBe(false);
  });
  it("matches a section and its sub-pages but not look-alike prefixes", () => {
    expect(isNavItemActive("/admin/orders", "/admin/orders")).toBe(true);
    expect(isNavItemActive("/admin/orders/f84da7af-a29d-4638-85e9-d1705a694d18", "/admin/orders")).toBe(true);
    expect(isNavItemActive("/admin/orders/", "/admin/orders")).toBe(true);
    expect(isNavItemActive("/admin/ordersx", "/admin/orders")).toBe(false);
  });
});

describe("isMoreActive", () => {
  it("is true for pages that live behind the More sheet", () => {
    expect(isMoreActive("/admin/banners/new")).toBe(true);
    expect(isMoreActive("/admin/settings")).toBe(true);
    expect(isMoreActive("/admin/categories")).toBe(true);
    expect(isMoreActive("/admin/subscribers")).toBe(true);
    expect(isMoreActive("/admin/team/new")).toBe(true);
  });
  it("is false for bottom bar destinations", () => {
    expect(isMoreActive("/admin")).toBe(false);
    expect(isMoreActive("/admin/products/123")).toBe(false);
    expect(isMoreActive("/admin/messages")).toBe(false);
  });
});

describe("adminNavGroups", () => {
  it("groups the twelve section destinations by job (Settings sits in the footer)", () => {
    expect(adminNavGroups.map((group) => group.label)).toEqual(["Today", "Catalogue", "Website"]);
    expect(adminNavGroups.flatMap((group) => group.items).length).toBe(12);
    expect(adminNavGroups.find((group) => group.label === "Website")?.items.map((item) => item.href)).toContain("/admin/subscribers");
  });
});
