import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
import { TestimonialEditor } from "@/features/admin/testimonial-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function EditTestimonial({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; delete?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, notice] = await Promise.all([db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1), searchParams]);
  if (!rows[0]) notFound();
  return <><AdminHeading title={rows[0].name} description="Edit the testimonial and its visibility." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><TestimonialEditor testimonial={rows[0]} showDelete={notice.delete === "1"} /></div></>;
}
