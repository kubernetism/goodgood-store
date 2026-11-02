import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadCardPhoto } from "./card-photo";

vi.mock("@/content/local-images", () => ({
  localImages: {
    honey: { url: "/_next/static/media/honey.png" },
    wildHoney: { url: "/_next/static/media/wild.png" },
    honeyNuts: { url: "/_next/static/media/nuts.png" },
    saffron: { url: "/_next/static/media/saffron.png" },
  },
}));

const square = sharp({ create: { width: 40, height: 40, channels: 3, background: "#ffb800" } });
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="red"/></svg>');

function respondWith(body: Uint8Array | string, init?: ResponseInit) {
  vi.stubGlobal("fetch", async () => new Response(body as BodyInit, init));
}

async function expectCardPhoto(dataUrl: string | null) {
  expect(dataUrl).toMatch(/^data:image\/jpeg;base64,/);
  const { width, height, format } = await sharp(Buffer.from(dataUrl?.split(",")[1] ?? "", "base64")).metadata();
  expect({ width, height, format }).toEqual({ width: 600, height: 630, format: "jpeg" });
}

describe("loadCardPhoto", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    ["WebP", () => square.clone().webp().toBuffer()],
    ["AVIF", () => square.clone().avif().toBuffer()],
    ["PNG", () => square.clone().png().toBuffer()],
    ["SVG", async () => svg],
  ])("converts a remote %s to the JPEG Satori can draw", async (_format, encode) => {
    respondWith(await encode());
    await expectCardPhoto(await loadCardPhoto("https://cdn.example.com/photo"));
  });

  it("reads bundled range photos from disk, since the CDN is unreachable while prerendering", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expectCardPhoto(await loadCardPhoto("/_next/static/media/honey.png"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null when the remote image is missing", async () => {
    respondWith("gone", { status: 404 });
    expect(await loadCardPhoto("https://cdn.example.com/photo.webp")).toBeNull();
  });

  it("returns null when the network fails", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    expect(await loadCardPhoto("https://cdn.example.com/photo.webp")).toBeNull();
  });

  it("returns null for bytes that are not an image", async () => {
    respondWith("<html>not an image</html>");
    expect(await loadCardPhoto("https://cdn.example.com/photo.webp")).toBeNull();
  });

  it("returns null for an oversized image without decoding it", async () => {
    respondWith("x", { headers: { "content-length": String(16 * 1024 * 1024) } });
    expect(await loadCardPhoto("https://cdn.example.com/huge.png")).toBeNull();
  });

  it("returns null for other URL schemes and for local files that do not exist", async () => {
    expect(await loadCardPhoto("data:image/png;base64,AAAA")).toBeNull();
    expect(await loadCardPhoto("/uploads/../../../etc/passwd")).toBeNull();
  });
});
