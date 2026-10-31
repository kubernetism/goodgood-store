import type { Metadata } from "next";
import { TestimonialEditor } from "@/features/admin/testimonial-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Add testimonial" };

export default async function NewTestimonial({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const notice = await searchParams;
  return <div className="admin-page">
    <AdminHeading back={{ href: "/admin/testimonials", label: "Back to testimonials" }} eyebrow="Website" title="Add testimonial" description="Add customer feedback to your website." />
    <AdminNotice {...notice} />
    <TestimonialEditor />
  </div>;
}
