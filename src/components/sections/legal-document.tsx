import Link from "next/link";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: ReadonlyArray<string>;
  list?: ReadonlyArray<string>;
  /** Paragraphs rendered after the list. */
  after?: ReadonlyArray<string>;
};

type LegalDocumentProps = {
  intro: string;
  updatedOn: string;
  sections: ReadonlyArray<LegalSection>;
};

/** Legal page body: sticky table of contents + numbered sections. */
export function LegalDocument({ intro, updatedOn, sections }: LegalDocumentProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
      <nav aria-label="On this page" className="lg:col-span-4">
        <div className="rounded-sm border border-border bg-cream p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-base font-semibold">On this page</h2>
          <ol className="mt-4 space-y-1 text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex min-h-9 items-center gap-2 text-strong transition-colors duration-200 hover:text-primary-ink"
                >
                  <span className="w-5 text-muted tabular-nums">{index + 1}.</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="lg:col-span-8">
        <p className="text-meta font-semibold text-primary-ink">
          Last updated: <time dateTime={updatedOn}>{formatDate(updatedOn)}</time>
        </p>
        <p className="mt-4 text-base text-strong">{intro}</p>

        <div className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`} className="text-promo font-semibold">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.list && (
                  <ul className="list-disc space-y-2 pl-6 marker:text-primary-ink">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-sm bg-primary-tint p-6 text-strong">
          <p className="font-display font-semibold">Questions about this policy?</p>
          <p className="mt-1">
            Email{" "}
            <a href={`mailto:${siteConfig.contact.supportEmail}`} className="font-semibold text-primary-ink underline underline-offset-2">
              {siteConfig.contact.supportEmail}
            </a>{" "}
            or use our{" "}
            <Link href="/contact" className="font-semibold text-primary-ink underline underline-offset-2">
              contact form
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
