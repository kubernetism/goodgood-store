import { storePromises } from "@/content/store-promises";

/**
 * White card of service promises that overlaps the top of the footer by 60px.
 * Rendered just before <footer>; the footer adds matching top padding. The
 * home page shows the same promises as drip cards instead.
 */
export function FeaturesStrip() {
  return (
    <div className="relative z-10 mx-auto -mb-15 w-full max-w-wide px-4 sm:px-6">
      <ul className="grid gap-y-6 rounded-lg bg-surface px-6 py-8 shadow-card sm:grid-cols-2 lg:grid-cols-4 lg:px-0 lg:py-10">
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
              <h2 className="font-display text-base font-semibold">{title}</h2>
              <p className="max-w-56 text-meta">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
