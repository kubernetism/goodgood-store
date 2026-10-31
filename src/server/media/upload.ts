import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { checkImageUpload, extensionFor, MAX_UPLOAD_BYTES } from "./image-file";
import { getMediaStorage } from "./storage";

export type UploadResult = { image: { id: string; alt: string; url: string }; error?: never } | { image?: never; error: string };

/** Shared validation and storage for both the media library and inline uploaders. */
export async function storeUploadedImage(file: FormDataEntryValue | null, altText: FormDataEntryValue | null): Promise<UploadResult> {
  const alt = typeof altText === "string" ? altText.trim() : "";
  if (!(file instanceof File) || file.size > MAX_UPLOAD_BYTES || !alt || alt.length > 250) return { error: "Choose an image under 4 MB and provide alt text (up to 250 characters)." };
  const checked = checkImageUpload(new Uint8Array(await file.arrayBuffer()));
  if (!checked.ok) return { error: checked.message };
  const key = `images/${randomUUID()}.${extensionFor[checked.type]}`;
  let storage: ReturnType<typeof getMediaStorage> | undefined;
  let uploaded = false;
  try {
    storage = getMediaStorage();
    const stored = await storage.put(key, checked.bytes, checked.type);
    uploaded = true;
    const [image] = await db.insert(media).values({ storageKey: stored.key, url: stored.url, alt, contentType: checked.type, sizeBytes: checked.bytes.length, width: checked.size?.width, height: checked.size?.height }).returning({ id: media.id, alt: media.alt, url: media.url });
    if (!image) throw new Error("No media record was returned.");
    return { image };
  } catch (cause) {
    if (uploaded && storage) await storage.remove(key).catch((cleanupError) => console.error("Failed to remove unregistered image", cleanupError));
    console.error("Media upload failed", cause);
    return { error: "Upload failed. Check image storage configuration and try again." };
  }
}
