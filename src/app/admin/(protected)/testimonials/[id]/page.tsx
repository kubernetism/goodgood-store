import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
import { TestimonialEditor } from "@/features/admin/testimonial-editor";
import { AdminHeading, AdminNotice, StatusPill } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonial({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; delete?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [rows, notice] = await Promise.all([db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1), searchParams]);
  const testimonial = rows[0];
  if (!testimonial) notFound();
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/testimonials", label: "Back to testimonials" }} eyebrow="Website" title={testimonial.name} meta={testimonial.isActive ? <StatusPill tone="positive" label="Visible" /> : <StatusPill tone="neutral" label="Hidden" />} />
    <AdminNotice error={notice.error} saved={notice.saved} message="Testimonial saved." />
    <TestimonialEditor testimonial={testimonial} showDelete={notice.delete === "1"} />
  </div>;
}
