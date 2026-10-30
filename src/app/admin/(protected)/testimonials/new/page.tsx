import { TestimonialEditor } from "@/features/admin/testimonial-editor";
import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function NewTestimonial({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin();
  const notice = await searchParams;
  return <><AdminHeading title="Add testimonial" description="Add customer feedback to your website." /><AdminNotice {...notice} /><div style={{ marginTop: 16 }}><TestimonialEditor /></div></>;
}
