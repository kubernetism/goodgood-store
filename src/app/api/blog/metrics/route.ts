import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { EMPTY_BLOG_METRICS } from "@/features/blog/metrics";
import { getBlogMetrics } from "@/features/blog/metrics-data";

const slugSchema = z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const payloadSchema = z.object({ slug: slugSchema, visitId: z.uuid(), seconds: z.number().int().min(0).max(1800) });
const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const slug = slugSchema.safeParse(new URL(request.url).searchParams.get("slug"));
  if (!slug.success) return Response.json({ error: "Invalid post." }, { status: 400, headers: noStore });
  const [post] = await db.select({ id: blogPosts.id }).from(blogPosts).where(sql`${blogPosts.slug} = ${slug.data} and ${blogPosts.isPublished} = true`).limit(1);
  if (!post) return Response.json({ error: "Post not found." }, { status: 404, headers: noStore });
  const metrics = await getBlogMetrics([post.id]);
  return Response.json(metrics.get(post.id) ?? EMPTY_BLOG_METRICS, { headers: noStore });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403, headers: noStore });
  if (/bot|crawler|spider|slurp|headless/i.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204, headers: noStore });
  if (Number(request.headers.get("content-length") ?? 0) > 1024) return new Response(null, { status: 413, headers: noStore });
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return new Response(null, { status: 400, headers: noStore });
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 1024) { await reader.cancel(); return new Response(null, { status: 413, headers: noStore }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return new Response(null, { status: 400, headers: noStore }); }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 400, headers: noStore });
  const { slug, visitId, seconds } = parsed.data;
  await db.execute(sql`
    INSERT INTO blog_visits (id, post_id, engaged_seconds)
    SELECT ${visitId}::uuid, id, 0 FROM blog_posts WHERE slug = ${slug} AND is_published = true
    ON CONFLICT (id) DO UPDATE SET
      engaged_seconds = greatest(blog_visits.engaged_seconds, least(${seconds}::integer, 1800, greatest(0, floor(extract(epoch from now() - blog_visits.started_at))::integer))),
      last_seen_at = now()
    WHERE blog_visits.post_id = excluded.post_id AND blog_visits.started_at > now() - interval '30 minutes'
  `);
  return new Response(null, { status: 204, headers: noStore });
}
