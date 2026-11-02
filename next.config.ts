import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * Uploaded images are served from the Neon Object Storage bucket. The exact
 * branch host comes from S3_ENDPOINT so next/image only optimises our bucket,
 * not arbitrary hosts.
 */
function mediaRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    // YouTube's still frames, used as the video poster when no image is set.
    { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
  ];
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  if (endpoint && bucket) {
    const { hostname } = new URL(endpoint);
    patterns.push({ protocol: "https", hostname, pathname: `/${bucket}/**` });
  }
  return patterns;
}

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Image uploads are capped at 4 MB (Vercel's request limit is 4.5 MB);
      // leave room for multipart overhead.
      bodySizeLimit: "4.5mb",
    },
  },
  // The link-preview cards read these at request time through computed paths,
  // which file tracing cannot see.
  outputFileTracingIncludes: {
    "/brand-card.jpg": ["./src/features/social-card/assets/*"],
    "/shop/*/card.jpg": ["./src/features/social-card/assets/*", "./images/products/*.png"],
    "/blog/*/cover.jpg": ["./src/features/social-card/assets/*", "./images/products/*.png"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    remotePatterns: mediaRemotePatterns(),
  },
  async headers() {
    return [
      {
        // Belt and braces with the admin layout's robots metadata.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
