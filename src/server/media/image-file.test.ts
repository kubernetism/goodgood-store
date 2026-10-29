import { describe, expect, it } from "vitest";
import { checkImageUpload, MAX_UPLOAD_BYTES, sniffImageType } from "./image-file";

describe("image upload checks", () => {
  it("recognises allowed image signatures rather than a file extension", () => {
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0, 0, 0, 0]))).toBe("image/png");
    expect(sniffImageType(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
  });
  it("rejects empty, oversized and unrecognised files", () => {
    expect(checkImageUpload(new Uint8Array()).ok).toBe(false);
    expect(checkImageUpload(new Uint8Array(MAX_UPLOAD_BYTES + 1)).ok).toBe(false);
    expect(checkImageUpload(new TextEncoder().encode("not a real image")).ok).toBe(false);
  });
});
