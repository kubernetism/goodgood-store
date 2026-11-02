import { storePromises } from "@/content/store-promises";

/** Service promises displayed above the footer on inner pages. */
export function FeaturesStrip() {
  return (
    <div className="relative mx-auto mb-8 w-full max-w-wide px-4 sm:px-6">
      <ul className="grid gap-y-6 rounded-lg border border-brown-950/15 bg-surface px-6 py-8 shadow-card sm:grid-cols-2 lg:grid-cols-4 lg:px-0 lg:py-10">
        {storePromises.map(({ icon: Icon, title, text }, index) => (
          <li
            key={title}
            className={
              index > 0
                ? "flex items-center gap-4 lg:justify-center lg:border-l lg:border-border lg:px-6"
                : "flex items-center gap-4 lg:justify-center lg:px-6"
            }
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-strong">
              <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold">{title}</h2>
              <p className="max-w-56 text-meta">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
