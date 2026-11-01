import Link from "next/link";
import type { teamMembers } from "@/db/schema";
import type { ImageOption } from "./image-options";
import { ImageSelect } from "./image-select";
import { MediaOptionsProvider } from "./media-options";
import { SubmitButton } from "./submit-button";
import { deleteTeamMember, saveTeamMember } from "./team-actions";
import { socialNetworks } from "./team-schema";
import { DangerZone, Field } from "./ui";

type TeamMember = typeof teamMembers.$inferSelect;

export function TeamEditor({ member, images, showDelete = false }: { member?: TeamMember; images: ImageOption[]; showDelete?: boolean }) {
  return <MediaOptionsProvider images={images}>
    <form action={saveTeamMember} className="admin-form admin-panel">
      {member && <input type="hidden" name="id" value={member.id} />}
      <p className="admin-form-note">Everything you fill in here is shown on the About page when the member is published. All fields are required unless marked optional.</p>
      <fieldset className="admin-section">
        <legend>Person</legend>
        <div className="admin-columns">
          <Field label="Name"><input name="name" defaultValue={member?.name ?? ""} maxLength={120} autoComplete="off" required /></Field>
          <Field label="Role or title" hint="Shown under the name, e.g. “Founder” or “Customer care”."><input name="role" defaultValue={member?.role ?? ""} maxLength={120} autoComplete="off" required /></Field>
        </div>
        <Field label="Short bio" optional hint="One or two sentences. Up to 600 characters."><textarea name="bio" defaultValue={member?.bio ?? ""} maxLength={600} rows={3} /></Field>
        <ImageSelect label="Photo" name="photoId" defaultValue={member?.photoId ?? ""} emptyLabel="No photo yet (a placeholder is shown)" hint="Portrait, about 9:10, face near the top: the frame is arched. The image description is used as its alt text." />
      </fieldset>
      <fieldset className="admin-section">
        <legend>Contact</legend>
        <p className="admin-hint">Leave a field empty to hide it. Only add details this person agrees to show publicly.</p>
        <div className="admin-columns">
          <Field label="Email" optional><input type="email" name="email" defaultValue={member?.email ?? ""} maxLength={254} autoComplete="off" placeholder="name@abdulsamienterprises.com" /></Field>
          <Field label="Phone" optional hint="Pakistani or international, e.g. 0300 1234567."><input type="tel" name="phone" defaultValue={member?.phone ?? ""} maxLength={30} autoComplete="off" placeholder="0300 1234567" /></Field>
        </div>
        <div className="admin-field">
          <label className="admin-switch"><input type="checkbox" name="phoneOnWhatsapp" value="yes" defaultChecked={member?.phoneOnWhatsapp ?? false} /> This number is on WhatsApp</label>
          <p className="admin-hint">Adds a WhatsApp button next to the phone number.</p>
        </div>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Social profiles</legend>
        <p className="admin-hint">Paste the full profile link. Icons appear only for the profiles you add.</p>
        <div className="admin-columns">
          {socialNetworks.map((network) => <Field key={network.field} label={network.label} optional>
            <input type="text" inputMode="url" name={network.field} defaultValue={member?.[network.field] ?? ""} maxLength={300} autoComplete="off" spellCheck={false} placeholder={network.example} />
          </Field>)}
        </div>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Display</legend>
        <div className="admin-field">
          <label className="admin-switch"><input type="checkbox" name="isPublished" value="yes" defaultChecked={member?.isPublished ?? false} /> Show on the About page</label>
          <p className="admin-hint">Change the order with the arrows on the Team list. New members are added at the end.</p>
        </div>
      </fieldset>
      <div className="admin-save-bar">
        <SubmitButton>Save team member</SubmitButton>
        <Link className="admin-button quiet" href="/admin/team">Cancel</Link>
      </div>
    </form>
    {member && <div className="admin-danger-group"><DangerZone id="delete-member" open={showDelete} summary="Delete this team member">
      <p>This permanently removes {member.name} from the team. Their photo stays in Media. Switch off “Show on the About page” instead if they may return.</p>
      <form action={deleteTeamMember} className="admin-form"><input type="hidden" name="id" value={member.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this team member will be permanently deleted</label><div><SubmitButton variant="danger" pendingLabel="Deleting…">Delete team member</SubmitButton></div></form>
    </DangerZone></div>}
  </MediaOptionsProvider>;
}
