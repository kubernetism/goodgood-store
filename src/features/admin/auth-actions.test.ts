import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  selects: [] as unknown[][],
  insert: vi.fn(),
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  deletes: [] as string[],
  batch: vi.fn(),
  after: vi.fn(),
}));
// Each db.select() resolves the next queued result, in the order the action issues them.
vi.mock("@/db/client", () => ({ db: {
  select: () => ({ from: () => ({ where: () => {
    const rows = Promise.resolve(mocks.selects.shift() ?? []);
    return Object.assign(rows, { limit: () => rows });
  } }) }),
  insert: () => ({ values: mocks.insert }),
  delete: (table: object) => ({ where: () => { mocks.deletes.push(table === schema.adminSessions ? "admin_sessions" : table === schema.loginAttempts ? "login_attempts" : "other"); return "delete"; } }),
  batch: mocks.batch,
} }));
vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/server/auth/password", () => ({ MAX_PASSWORD_LENGTH: 200, getDummyHash: async () => "dummy", verifyPassword: mocks.verifyPassword }));
vi.mock("@/server/auth/session", () => ({ createSession: mocks.createSession, destroyCurrentSession: vi.fn() }));
vi.mock("@/server/request", () => ({ getClientIpHash: async () => "ip-hash" }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
import * as schema from "@/db/schema";
import { login } from "./auth-actions";

const user = { id: "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b", email: "owner@example.com", passwordHash: "hash" };
function form(password = "correct horse battery") {
  const data = new FormData();
  data.set("email", "Owner@Example.com");
  data.set("password", password);
  return data;
}
function queue({ emailTotal = 0, emailFromIp = 0, ip = 0 } = {}) {
  mocks.selects = [[{ total: emailTotal, fromIp: emailFromIp }], [{ value: ip }], [user]];
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.insert.mockResolvedValue(undefined);
  mocks.verifyPassword.mockResolvedValue(true);
  mocks.createSession.mockResolvedValue(undefined);
  mocks.batch.mockResolvedValue([]);
  mocks.deletes = [];
});

describe("admin login", () => {
  it("lets the owner sign in while a stranger's failures lock only the stranger's IP", async () => {
    queue({ emailTotal: 12, emailFromIp: 0 });
    await expect(login(form())).rejects.toThrow(/^redirect:\/admin$/);
    expect(mocks.createSession).toHaveBeenCalledWith(user.id);
    expect(mocks.insert).toHaveBeenCalledWith({ email: user.email, ipHash: "ip-hash", succeeded: true });
  });
  it("locks the email for an IP after repeated failures from that IP", async () => {
    queue({ emailTotal: 5, emailFromIp: 5 });
    await expect(login(form())).rejects.toThrow("redirect:/admin/login?error=locked");
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("still blocks a noisy IP and a distributed attack on one email", async () => {
    queue({ ip: 20 });
    await expect(login(form())).rejects.toThrow("error=locked");
    queue({ emailTotal: 50 });
    await expect(login(form())).rejects.toThrow("error=locked");
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("prunes expired sessions and old login attempts after a successful sign-in", async () => {
    queue();
    await expect(login(form())).rejects.toThrow(/^redirect:\/admin$/);
    expect(mocks.after).toHaveBeenCalledOnce();
    expect(mocks.batch).not.toHaveBeenCalled();
    await mocks.after.mock.calls[0]?.[0]();
    expect(mocks.deletes).toEqual(["admin_sessions", "login_attempts"]);
    expect(mocks.batch).toHaveBeenCalledOnce();
  });
  it("never fails a sign-in because cleanup failed", async () => {
    queue();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.batch.mockRejectedValue(new Error("db down"));
    await expect(login(form())).rejects.toThrow(/^redirect:\/admin$/);
    await expect(mocks.after.mock.calls[0]?.[0]()).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
  it("records a failed attempt for a wrong password", async () => {
    queue();
    mocks.verifyPassword.mockResolvedValue(false);
    await expect(login(form("wrong password!"))).rejects.toThrow("redirect:/admin/login?error=invalid");
    expect(mocks.insert).toHaveBeenCalledWith({ email: user.email, ipHash: "ip-hash", succeeded: false });
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.after).not.toHaveBeenCalled();
  });
});
