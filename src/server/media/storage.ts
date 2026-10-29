import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import { serverEnv } from "@/server/env";

/*
 * Object storage for uploaded images.
 * - "neon": Neon Object Storage (S3-compatible, public_read bucket), free plan
 *   5 GB. Objects are served straight from the bucket URL through next/image.
 * - "local": public/uploads on disk, for development without credentials.
 *   Refused in production (serverless file systems are read-only/ephemeral).
 */

export type StoredObject = { key: string; url: string };

export interface MediaStorage {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<StoredObject>;
  remove(key: string): Promise<void>;
}

export class MediaStorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Image storage is not configured. Set MEDIA_STORAGE=neon and the S3_* variables (see .env.example).",
    );
  }
}

const TIMEOUT_MS = 20_000;

function neonStorage(config: {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}): MediaStorage {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: config.region,
  });
  // Path-style addressing, as Neon requires.
  const objectUrl = (key: string) =>
    `${config.endpoint.replace(/\/$/, "")}/${config.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;

  return {
    async put(key, bytes, contentType) {
      const url = objectUrl(key);
      const response = await client.fetch(url, {
        method: "PUT",
        body: new Uint8Array(bytes),
        headers: {
          "Content-Type": contentType,
          // Keys are unique per upload, so objects never change.
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Object storage upload failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
      }
      return { key, url };
    },
    async remove(key) {
      const response = await client.fetch(objectUrl(key), {
        method: "DELETE",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Object storage delete failed (${response.status})`);
      }
    },
  };
}

const LOCAL_ROOT = path.join(process.cwd(), "public", "uploads");

const localStorage: MediaStorage = {
  async put(key, bytes) {
    const target = path.join(LOCAL_ROOT, key);
    // Keys are generated server-side, but never let one escape the folder.
    if (!target.startsWith(LOCAL_ROOT + path.sep)) throw new Error("Invalid media key");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
    return { key, url: `/uploads/${key}` };
  },
  async remove(key) {
    const target = path.join(LOCAL_ROOT, key);
    if (!target.startsWith(LOCAL_ROOT + path.sep)) return;
    await unlink(target).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  },
};

export function getMediaStorage(): MediaStorage {
  const env = serverEnv();
  const mode = env.MEDIA_STORAGE ?? (process.env.NODE_ENV === "development" ? "local" : undefined);

  if (mode === "neon") {
    const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = env;
    if (!S3_ENDPOINT || !S3_REGION || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
      throw new MediaStorageNotConfiguredError();
    }
    return neonStorage({
      endpoint: S3_ENDPOINT,
      region: S3_REGION,
      bucket: S3_BUCKET,
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    });
  }
  if (mode === "local" && process.env.NODE_ENV !== "production") return localStorage;
  throw new MediaStorageNotConfiguredError();
}
