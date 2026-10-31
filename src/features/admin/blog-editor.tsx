import Link from "next/link";
import type { blogPosts } from "@/db/schema";
import { blogCategories } from "@/features/blog/data";
import { formatBlogBody } from "@/features/blog/editor-body";
import { deleteBlogPost, saveBlogPost } from "./blog-actions";
import type { ImageOption } from "./image-options";
import { ImageSelect } from "./image-select";
import { MediaOptionsProvider } from "./media-options";
import { SlugInput } from "./product-editor";
import { SubmitButton } from "./submit-button";
import { DangerZone, Field } from "./ui";

type Post = typeof blogPosts.$inferSelect;

export function BlogEditor({ post, images }: { post?: Post; images: ImageOption[] }) {
  return <MediaOptionsProvider images={images}>
    <form action={saveBlogPost} className="admin-form admin-panel">
      {post && <input type="hidden" name="id" value={post.id} />}
      <p className="admin-form-note">All fields are required unless marked optional.</p>
      <fieldset className="admin-section">
        <legend>Post</legend>
        <div className="admin-columns">
          <Field label="Title"><input name="title" defaultValue={post?.title} maxLength={200} required /></Field>
          <Field label="Slug" hint="Used in the post’s URL. Lowercase letters, numbers and dashes. Changing it breaks old links.">
            <SlugInput prefix="/blog/" name="slug" defaultValue={post?.slug} placeholder="honey-from-the-hive" />
          </Field>
        </div>
        <Field label="Short description" hint="Shown on the blog list and in search results."><textarea name="excerpt" defaultValue={post?.excerpt} maxLength={1000} rows={3} required /></Field>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Article</legend>
        <Field label="Article" hint={<>Leave a blank line between paragraphs. <code>## Heading</code> for a heading, <code>- item</code> for a list, <code>&gt; quote</code> for a quote.</>}>
          <textarea name="body" defaultValue={post ? formatBlogBody(post.body) : ""} maxLength={50000} rows={16} required />
        </Field>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Details</legend>
        <div className="admin-columns">
          <Field label="Category"><select name="category" defaultValue={post?.category ?? blogCategories[0].slug}>{blogCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></Field>
          <Field label="Author"><input name="author" defaultValue={post?.author ?? "Abdul Sami Honey"} maxLength={150} required /></Field>
        </div>
        <div className="admin-columns">
          <Field label="Publication date" hint="For display and ordering. It does not schedule the post."><input name="publishedOn" type="date" defaultValue={post?.publishedOn ?? new Date().toISOString().slice(0, 10)} required /></Field>
          <ImageSelect label="Cover image" name="coverId" defaultValue={post?.coverId ?? ""} />
        </div>
        <Field label="Tags" optional hint="Separate tags with commas."><input name="tags" defaultValue={post?.tags.join(", ") ?? ""} maxLength={1000} placeholder="Honey, Beekeeping" /></Field>
      </fieldset>
      <fieldset className="admin-section">
        <legend>Publishing</legend>
        <div className="admin-field">
          <label className="admin-switch"><input type="checkbox" name="isPublished" value="yes" defaultChecked={post?.isPublished ?? false} /> Publish this post on the website</label>
          <p className="admin-hint">Unpublished posts are drafts, visible only in the admin portal.</p>
        </div>
      </fieldset>
      <div className="admin-save-bar">
        <SubmitButton>Save post</SubmitButton>
        <Link className="admin-button quiet" href="/admin/blog">Cancel</Link>
      </div>
    </form>
    {post && <div className="admin-danger-group"><DangerZone summary="Delete this post">
      <p>This permanently deletes the post. Its cover image remains in the media library. Unpublish it instead if you may need it later.</p>
      <form action={deleteBlogPost} className="admin-form"><input type="hidden" name="id" value={post.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this post will be permanently deleted</label><div><SubmitButton variant="danger" pendingLabel="Deleting…">Delete post</SubmitButton></div></form>
    </DangerZone></div>}
  </MediaOptionsProvider>;
}
