import type { testimonials } from "@/db/schema";
import { deleteTestimonial, saveTestimonial } from "./testimonial-actions";

type Testimonial = typeof testimonials.$inferSelect;

export function TestimonialEditor({ testimonial, showDelete = false }: { testimonial?: Testimonial; showDelete?: boolean }) {
  return <>
    <form action={saveTestimonial} className="admin-form admin-panel">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <div className="admin-columns"><label>Customer name<input name="name" defaultValue={testimonial?.name ?? ""} maxLength={150} required /></label><label>City or description (optional)<input name="role" defaultValue={testimonial?.role ?? ""} maxLength={150} placeholder="Peshawar" /></label></div>
      <label>Testimonial<textarea name="quote" defaultValue={testimonial?.quote ?? ""} maxLength={2000} required /></label>
      <div className="admin-columns"><label>Rating (1 to 5)<input type="number" name="rating" min="1" max="5" step="0.5" defaultValue={testimonial?.rating ?? 5} required /></label><label>Display order<input type="number" name="sortOrder" min="0" max="1000000" defaultValue={testimonial?.sortOrder ?? 0} required /></label></div>
      <label className="check"><input type="checkbox" name="isActive" value="yes" defaultChecked={testimonial?.isActive ?? false} /> Make this testimonial active</label>
      <p className="admin-muted">Unchecked testimonials stay in the admin portal and are hidden on the website. The website shows the first 10 active testimonials: lower display order comes first, then older testimonials.</p>
      <div><button className="admin-button">Save testimonial</button></div>
    </form>
    {testimonial && <details id="delete-testimonial" open={showDelete || undefined} className="admin-panel" style={{ marginTop: 16 }}><summary>Delete this testimonial</summary><p className="admin-muted">This permanently deletes the testimonial. Uncheck its visibility if you might want to use it later.</p><form action={deleteTestimonial} className="admin-form"><input type="hidden" name="id" value={testimonial.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this testimonial will be permanently deleted</label><div><button className="admin-button secondary">Delete testimonial</button></div></form></details>}
  </>;
}
