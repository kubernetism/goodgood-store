import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ db: { execute: mocks.execute } }));
import { POST } from "./route";

const valid = { slug: "example-post", visitId: "7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b", seconds: 12 };
function request(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/blog/metrics", { method: "POST", headers, body });
}

beforeEach(() => { vi.clearAllMocks(); mocks.execute.mockResolvedValue({ rows: [] }); });

describe("anonymous blog metrics endpoint", () => {
  it("accepts a valid same-origin visit", async () => {
    expect((await POST(request(JSON.stringify(valid), { origin: "http://localhost:3000" }))).status).toBe(204);
    expect(mocks.execute).toHaveBeenCalledOnce();
  });
  it("rejects cross-origin and malformed requests before recording a visit", async () => {
    expect((await POST(request(JSON.stringify(valid), { origin: "https://other.example" }))).status).toBe(403);
    expect((await POST(request(JSON.stringify({ ...valid, seconds: 1801 })))).status).toBe(400);
    expect((await POST(request("x".repeat(1025)))).status).toBe(413);
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("ignores known bots", async () => {
    expect((await POST(request(JSON.stringify(valid), { "user-agent": "ExampleBot" }))).status).toBe(204);
    expect(mocks.execute).not.toHaveBeenCalled();
  });
});
