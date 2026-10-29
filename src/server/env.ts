import "server-only";
import { z } from "zod";

const optionalSetting = <T extends z.ZodType>(field: T) => z.preprocess((value) => value === "" ? undefined : value, field.optional());

const schema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  /** Pepper for session-token and IP hashes. 32+ random bytes. */
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  /** "neon" (S3-compatible Neon Object Storage) or "local" (development only). */
  MEDIA_STORAGE: optionalSetting(z.enum(["neon", "local"])),
  S3_ENDPOINT: optionalSetting(z.url()),
  S3_REGION: optionalSetting(z.string().min(1)),
  S3_BUCKET: optionalSetting(z.string().min(1)),
  S3_ACCESS_KEY_ID: optionalSetting(z.string().min(1)),
  S3_SECRET_ACCESS_KEY: optionalSetting(z.string().min(1)),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

/** Validated server env, parsed on first use so a missing var fails loudly with its name. */
export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid server environment: ${problems}. See .env.example.`);
  }
  cached = parsed.data;
  return cached;
}
