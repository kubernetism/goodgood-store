import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { BlogEditor } from "@/features/admin/blog-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function NewBlogPost({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const [images, notice] = await Promise.all([db.select().from(media).orderBy(desc(media.createdAt)), searchParams]);
  return <><AdminHeading title="Add post" description="Create a post for the Honey Journal." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><BlogEditor images={images} /></div></>;
}
