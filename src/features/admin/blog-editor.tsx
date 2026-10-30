import type { blogPosts, media } from "@/db/schema";
import { blogCategories } from "@/features/blog/data";
import { formatBlogBody } from "@/features/blog/editor-body";
import { deleteBlogPost, saveBlogPost } from "./blog-actions";
import { ImageSelect } from "./image-select";

type Post = typeof blogPosts.$inferSelect;
type Media = typeof media.$inferSelect;

export function BlogEditor({ post, images }: { post?: Post; images: Media[] }) {
  return <>
    <form action={saveBlogPost} className="admin-form admin-panel">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="admin-columns"><label>Title<input name="title" defaultValue={post?.title} maxLength={200} required /></label><label>Slug<input name="slug" defaultValue={post?.slug} maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="honey-from-the-hive" required /></label></div>
      <p className="admin-muted">The slug is used in the post’s URL. Changing it can break existing links.</p>
      <label>Short description<textarea name="excerpt" defaultValue={post?.excerpt} maxLength={1000} required /></label>
      <div className="admin-columns"><label>Category<select name="category" defaultValue={post?.category ?? blogCategories[0].slug}>{blogCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label><label>Author<input name="author" defaultValue={post?.author ?? "Abdul Sami Honey"} maxLength={150} required /></label></div>
      <div className="admin-columns"><label>Publication date<input name="publishedOn" type="date" defaultValue={post?.publishedOn ?? new Date().toISOString().slice(0, 10)} required /></label><ImageSelect label="Cover image" name="coverId" defaultValue={post?.coverId ?? ""} images={images.map(({ id, alt }) => ({ id, alt }))} /></div>
      <label>Tags <span className="admin-muted">Separate tags with commas.</span><input name="tags" defaultValue={post?.tags.join(", ") ?? ""} maxLength={1000} placeholder="Honey, Beekeeping" /></label>
      <label>Article<textarea name="body" defaultValue={post ? formatBlogBody(post.body) : ""} maxLength={50000} rows={16} required /></label>
      <p className="admin-muted">Leave a blank line between paragraphs. For a heading start a line with ##, for a list start each line with -, and for a quote start each line with &gt;.</p>
      <label className="check"><input type="checkbox" name="isPublished" value="yes" defaultChecked={post?.isPublished ?? false} /> Publish this post on the website</label>
      <p className="admin-muted">Unchecked posts are drafts and are only visible in the admin portal. The publication date is for display and ordering; it does not schedule a post.</p>
      <div><button className="admin-button">Save post</button></div>
    </form>
    {post && <details className="admin-panel" style={{ marginTop: 16 }}><summary>Delete this post</summary><p className="admin-muted">This permanently deletes the post. Its cover image remains in the media library. Unpublish it instead if you may need it later.</p><form action={deleteBlogPost} className="admin-form"><input type="hidden" name="id" value={post.id} /><label className="check"><input type="checkbox" name="confirm" value="yes" required /> I understand this post will be permanently deleted</label><div><button className="admin-button secondary">Delete post</button></div></form></details>}
  </>;
}
