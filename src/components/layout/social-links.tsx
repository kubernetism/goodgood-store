import { SocialIcon } from "@/components/icons/social-icons";
import { getSiteSocialLinks } from "@/features/settings/social-links-data";
import { siteConfig, type SocialNetwork } from "@/lib/site";
import { cx } from "@/lib/cx";

type SocialLinksProps = {
  networks: ReadonlyArray<{ network: SocialNetwork; label: string; href: string }>;
  /** `plain` = bare icons; `boxed` = tinted squares (blog sidebar). */
  variant?: "plain" | "boxed";
  className?: string;
  iconClassName?: string;
  /** Prefix for accessible names, e.g. "Abdul Sami on". */
  labelPrefix?: string;
};

export function SocialLinks({
  networks,
  variant = "plain",
  className,
  iconClassName = "size-3.5",
  labelPrefix = `${siteConfig.name} on`,
}: SocialLinksProps) {
  if (!networks.length) return null;
  return (
    <ul className={cx("flex items-center", variant === "boxed" ? "gap-4" : "gap-1", className)}>
      {networks.map((social) => (
        <li key={social.network}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cx(
              "flex items-center justify-center transition-colors duration-200",
              variant === "boxed"
                ? "size-11 rounded-sm bg-primary-tint text-primary-ink hover:bg-primary hover:text-strong"
                : "size-11 rounded-full hover:text-primary-ink",
            )}
          >
            <SocialIcon network={social.network} className={iconClassName} />
            <span className="sr-only">
              {labelPrefix} {social.label} (opens in a new tab)
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The site's own profiles, as set in Admin > Settings. Renders nothing when none are shown. */
export async function SiteSocialLinks(props: Omit<SocialLinksProps, "networks">) {
  const networks = await getSiteSocialLinks();
  return <SocialLinks networks={networks} {...props} />;
}
