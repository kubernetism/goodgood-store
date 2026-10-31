import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ insert: vi.fn(), put: vi.fn(), remove: vi.fn(), returning: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ db: { insert: mocks.insert } }));
vi.mock("./storage", () => ({ getMediaStorage: () => ({ put: mocks.put, remove: mocks.remove }) }));
import { storeUploadedImage } from "./upload";

const png = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0, 0, 0, 0])], "test.png", { type: "image/png" });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.put.mockResolvedValue({ key: "images/test.png", url: "https://example.invalid/test.png" });
  mocks.remove.mockResolvedValue(undefined);
  mocks.returning.mockResolvedValue([{ id: "123", alt: "Honey jar", url: "https://media.example/jar.png" }]);
  mocks.insert.mockReturnValue({ values: () => ({ returning: mocks.returning }) });
});

describe("image upload", () => {
  it("stores a valid image and returns a selectable media record", async () => {
    await expect(storeUploadedImage(png(), " Honey jar ")).resolves.toEqual({ image: { id: "123", alt: "Honey jar", url: "https://media.example/jar.png" } });
    expect(mocks.put).toHaveBeenCalledOnce();
    expect(mocks.insert).toHaveBeenCalledOnce();
  });
  it("rejects missing descriptions and files whose bytes are not images", async () => {
    expect((await storeUploadedImage(png(), " ")).error).toBeTruthy();
    expect((await storeUploadedImage(new File(["not an image"], "fake.png"), "Honey")).error).toBeTruthy();
    expect(mocks.put).not.toHaveBeenCalled();
  });
  it("cleans up uploaded bytes if the database insert fails", async () => {
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.returning.mockRejectedValue(new Error("database error"));
    expect((await storeUploadedImage(png(), "Honey")).error).toBeTruthy();
    expect(mocks.remove).toHaveBeenCalledOnce();
    logger.mockRestore();
  });
});
