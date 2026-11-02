import { cx } from "@/lib/cx";
import type { BlogBlock } from "../data";
import { getHeadingAnchors, type TocEntry } from "../editorial";

/** Long-form body set in `.journal-prose` (62ch measure, drop cap, hex markers). */
export function PostBody({ body, className }: { body: ReadonlyArray<BlogBlock>; className?: string }) {
  const anchors = getHeadingAnchors(body);
  return (
    <div className={cx("journal-prose", className)}>
      {body.map((block, index) => (
        <PostBlock key={index} block={block} anchorId={anchors.get(index)?.id} />
      ))}
    </div>
  );
}

function PostBlock({ block, anchorId }: { block: BlogBlock; anchorId?: string }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading":
      return <h2 id={anchorId}>{block.text}</h2>;
    case "list":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <figure className="journal-quote">
          <blockquote>{block.text}</blockquote>
          {block.cite && (
            <figcaption className="mt-3 text-meta font-semibold text-primary-ink">— {block.cite}</figcaption>
          )}
        </figure>
      );
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

/** "In this story" jump links; rendered only when a post has two or more sections. */
export function PostContents({ body, className }: { body: ReadonlyArray<BlogBlock>; className?: string }) {
  const entries: TocEntry[] = [...getHeadingAnchors(body).values()];
  if (entries.length < 2) return null;
  return (
    <nav aria-labelledby="post-contents-heading" className={className}>
      <h2 id="post-contents-heading" className="text-eyebrow font-bold text-primary-ink uppercase">
        In this story
      </h2>
      <ol className="mt-4 space-y-1 border-l-2 border-border">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="-ml-0.5 flex min-h-10 items-baseline gap-3 border-l-2 border-transparent py-1.5 pl-4 text-sm font-semibold text-body transition-colors duration-200 hover:border-primary hover:text-strong"
            >
              <span aria-hidden="true" className="text-meta text-primary-ink">
                {String(index + 1).padStart(2, "0")}
              </span>
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
