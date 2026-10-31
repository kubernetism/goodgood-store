import Link from "next/link";
import type { testimonials } from "@/db/schema";
import { SubmitButton } from "./submit-button";
import { deleteTestimonial, saveTestimonial } from "./testimonial-actions";
import { DangerZone, Field } from "./ui";

type Testimonial = typeof testimonials.$inferSelect;

export function TestimonialEditor({ testimonial, showDelete = false }: { testimonial?: Testimonial; showDelete?: boolean }) {
  return <>
    <form action={saveTestimonial} className="admin-form admin-panel">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <p className="admin-form-note">Only publish real customer words, with their permission. All fields are required unless marked optional.</p>
      <fieldset className="admin-section">
        <legend>Customer</legend>
        <div className="admin-columns">
          <Field label="Customer name"><input name="name" defaultValue={testimonial?.name ?? ""} maxLength={150} required /></Field>
          <Field label="City or description" optional><input name="role" defaultValue={testimonial?.role ?? ""} maxLength={150} placeholder="Peshawar" /></Field>
        </div>
        <Field label="Testimonial"><textarea name="quote" defaultValue={testimonial?.quote ?? ""} maxLength={2000} rows={5} required /></Field>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Display</legend>
        <div className="admin-columns">
          <Field label="Rating" hint="1 to 5, in steps of 0.5."><input type="number" inputMode="decimal" name="rating" min="1" max="5" step="0.5" defaultValue={testimonial?.rating ?? 5} required /></Field>
          <Field label="Display order" hint="Lower numbers come first, then older testimonials."><input type="number" inputMode="numeric" name="sortOrder" min="0" max="1000000" defaultValue={testimonial?.sortOrder ?? 0} required /></Field>
        </div>
        <div className="admin-field">
          <label className="admin-switch"><input type="checkbox" name="isActive" value="yes" defaultChecked={testimonial?.isActive ?? false} /> Show on the website</label>
          <p className="admin-hint">The website shows the first 10 visible testimonials. Hidden ones stay here in the admin.</p>
        </div>
      </fieldset>
      <div className="admin-save-bar">
        <SubmitButton>Save testimonial</SubmitButton>
        <Link className="admin-button quiet" href="/admin/testimonials">Cancel</Link>
      </div>
    </form>
    {testimonial && <div className="admin-danger-group"><DangerZone id="delete-testimonial" open={showDelete} summary="Delete this testimonial">
      <p>This permanently deletes the testimonial. Hide it instead if you might want to use it later.</p>
      <form action={deleteTestimonial} className="admin-form"><input type="hidden" name="id" value={testimonial.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this testimonial will be permanently deleted</label><div><SubmitButton variant="danger" pendingLabel="Deleting…">Delete testimonial</SubmitButton></div></form>
    </DangerZone></div>}
  </>;
}
