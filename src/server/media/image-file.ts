/*
 * Server-side checks for uploaded images. The file's bytes decide its type
 * (magic numbers), never the client's filename or Content-Type. Pure, so it
 * is unit tested.
 */

/**
 * 4 MB. Vercel Functions cap request bodies at 4.5 MB, so a larger cap could
 * never be reached in production. The admin UI downsizes big phone photos in
 * the browser before upload.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type AllowedImageType = (typeof allowedImageTypes)[number];

export const extensionFor: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.subarray(start, start + length));

export function sniffImageType(bytes: Uint8Array): AllowedImageType | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (ascii(bytes, 0, 8) === "\x89PNG\r\n\x1a\n") return "image/png";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "image/webp";
  // ISO-BMFF: [size][ftyp][major brand]...; AVIF images use avif/avis brands.
  if (ascii(bytes, 4, 4) === "ftyp") {
    const boxSize = Math.min(bytes.length, (bytes[0]! << 24) | (bytes[1]! << 16) | (bytes[2]! << 8) | bytes[3]!);
    for (let offset = 8; offset + 4 <= boxSize; offset += 4) {
      const brand = ascii(bytes, offset, 4);
      if (brand === "avif" || brand === "avis") return "image/avif";
    }
  }
  return null;
}

export type ImageSize = { width: number; height: number };

const u16be = (b: Uint8Array, i: number) => (b[i]! << 8) | b[i + 1]!;
const u16le = (b: Uint8Array, i: number) => b[i]! | (b[i + 1]! << 8);
const u24le = (b: Uint8Array, i: number) => b[i]! | (b[i + 1]! << 8) | (b[i + 2]! << 16);
const u32be = (b: Uint8Array, i: number) => ((b[i]! << 24) >>> 0) + ((b[i + 1]! << 16) | (b[i + 2]! << 8) | b[i + 3]!);

/** Intrinsic size from the file header, or null when it can't be read. */
export function readImageSize(bytes: Uint8Array, type: AllowedImageType): ImageSize | null {
  try {
    switch (type) {
      case "image/png":
        return bytes.length >= 24 ? { width: u32be(bytes, 16), height: u32be(bytes, 20) } : null;
      case "image/jpeg":
        return readJpegSize(bytes);
      case "image/webp":
        return readWebpSize(bytes);
      case "image/avif":
        return readAvifSize(bytes);
      default: {
        const exhaustive: never = type;
        return exhaustive;
      }
    }
  } catch {
    return null;
  }
}

function readJpegSize(bytes: Uint8Array): ImageSize | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1]!;
    // SOF0..SOF15 except DHT (C4), JPG (C8) and DAC (CC) carry the frame size.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: u16be(bytes, offset + 5), width: u16be(bytes, offset + 7) };
    }
    offset += 2 + u16be(bytes, offset + 2);
  }
  return null;
}

function readWebpSize(bytes: Uint8Array): ImageSize | null {
  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8X") return { width: u24le(bytes, 24) + 1, height: u24le(bytes, 27) + 1 };
  if (chunk === "VP8 ") return { width: u16le(bytes, 26) & 0x3fff, height: u16le(bytes, 28) & 0x3fff };
  if (chunk === "VP8L") {
    const b = bytes.subarray(21, 25);
    return { width: 1 + (((b[1]! & 0x3f) << 8) | b[0]!), height: 1 + (((b[3]! & 0x0f) << 10) | (b[2]! << 2) | ((b[1]! & 0xc0) >> 6)) };
  }
  return null;
}

function readAvifSize(bytes: Uint8Array): ImageSize | null {
  // The 'ispe' (image spatial extent) property: 4 bytes version/flags, then width, height.
  const limit = Math.min(bytes.length - 16, 64 * 1024);
  for (let i = 4; i < limit; i++) {
    if (bytes[i] === 0x69 && ascii(bytes, i, 4) === "ispe") {
      return { width: u32be(bytes, i + 8), height: u32be(bytes, i + 12) };
    }
  }
  return null;
}

/**
 * Removes APP1 (EXIF/XMP) and APP13 (IPTC) segments from a JPEG. Phone
 * photos carry GPS coordinates there, and originals are publicly readable.
 * Returns the input unchanged if the structure is unexpected.
 */
export function stripJpegMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const kept: Uint8Array[] = [bytes.subarray(0, 2)];
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return bytes;
    const marker = bytes[offset + 1]!;
    // Start of scan: the rest is entropy-coded image data.
    if (marker === 0xda) {
      kept.push(bytes.subarray(offset));
      const out = new Uint8Array(kept.reduce((sum, part) => sum + part.length, 0));
      let position = 0;
      for (const part of kept) {
        out.set(part, position);
        position += part.length;
      }
      return out;
    }
    const length = u16be(bytes, offset + 2);
    if (length < 2) return bytes;
    const segment = bytes.subarray(offset, offset + 2 + length);
    if (marker !== 0xe1 && marker !== 0xed) kept.push(segment);
    offset += 2 + length;
  }
  return bytes;
}

export type UploadCheck =
  | { ok: true; type: AllowedImageType; bytes: Uint8Array; size: ImageSize | null }
  | { ok: false; message: string };

/** Validates and normalises an uploaded image's bytes. */
export function checkImageUpload(bytes: Uint8Array): UploadCheck {
  if (bytes.length === 0) return { ok: false, message: "Choose an image to upload." };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, message: "Images must be 4 MB or smaller." };
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, message: "Upload a JPEG, PNG, WebP or AVIF image." };
  const cleaned = type === "image/jpeg" ? stripJpegMetadata(bytes) : bytes;
  return { ok: true, type, bytes: cleaned, size: readImageSize(cleaned, type) };
}
