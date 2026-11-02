import { describe, expect, it } from "vitest";
import { metadataBaseUrl } from "./metadata-base";

describe("metadataBaseUrl", () => {
  it("uses the real domain outside Vercel", () => {
    expect(metadataBaseUrl({}).origin).toBe("https://www.abdulsamienterprises.com");
  });

  it("uses the vercel.app host in production only until a custom domain is attached", () => {
    expect(metadataBaseUrl({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app" }).origin).toBe("https://app.vercel.app");
    expect(metadataBaseUrl({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "abdulsamienterprises.com" }).origin).toBe("https://www.abdulsamienterprises.com");
  });
});
