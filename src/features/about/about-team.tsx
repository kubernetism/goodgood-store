import { Mail, Phone, Users } from "lucide-react";
import { SocialIcon, WhatsAppIcon } from "@/components/icons/social-icons";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { SectionHeading } from "@/components/ui/section-heading";
import { teamMembers as placeholderTeam } from "@/content/company";
import { type SiteContent, slotImage } from "@/features/content/content-data";
import { teamMemberSlotKey } from "@/features/content/slots";
import type { PublicTeamMember } from "@/features/team/team-data";
import type { TeamLink } from "@/features/team/team-links";
import type { ImageAsset } from "@/features/products/types";
import { cx } from "@/lib/cx";

type Portrait = { key: string; name: string; role: string; bio: string; photo: ImageAsset | null; links: ReadonlyArray<TeamLink> };

/** Short rows stay centred and keep the ~270px portrait width of the full four-up row. */
const layouts: Record<number, string> = {
  1: "mx-auto max-w-xs grid-cols-1",
  2: "mx-auto max-w-xl grid-cols-2",
  3: "mx-auto grid-cols-2 lg:max-w-4xl lg:grid-cols-3",
};

/**
 * Team portraits, staggered on wide screens like a row of frames. Published
 * members come from the admin (Team); until the first one is published the
 * section keeps the placeholder team and its Site content image slots.
 */
export function AboutTeam({ content, members }: { content: SiteContent; members: ReadonlyArray<PublicTeamMember> }) {
  const portraits: Portrait[] = members.length
    ? members.map((member) => ({ key: member.id, ...member }))
    : placeholderTeam.map((member) => ({
        key: member.name,
        name: member.name,
        role: member.role,
        bio: "",
        photo: slotImage(content, teamMemberSlotKey(member.name)),
        links: [],
      }));

  return (
    <section aria-labelledby="team-heading" className="py-16 lg:py-24">
      <Container>
        <SectionHeading
          id="team-heading"
          eyebrow="The people"
          title="The hands behind every jar"
          description="From the apiary to your doorstep, a small team looks after each harvest."
          className="reveal"
        />
        <ul className={cx("mt-12 grid gap-x-4 gap-y-8 sm:gap-x-6 lg:items-start", layouts[portraits.length] ?? "grid-cols-2 lg:grid-cols-4")}>
          {portraits.map((member) => (
            <li key={member.key} className="about-member group">
              <div className="about-arch overflow-hidden border border-border bg-tile">
                <MediaImage
                  image={member.photo}
                  alt=""
                  sizes="(min-width: 1024px) 270px, 50vw"
                  icon={Users}
                  iconSize="lg"
                  aspect="aspect-[9/10]"
                  className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-base font-semibold sm:text-h4">{member.name}</h3>
                <p className="mt-1 text-eyebrow font-bold text-primary-ink uppercase">{member.role}</p>
                {member.bio && <p className="mx-auto mt-3 max-w-prose text-sm text-pretty text-muted">{member.bio}</p>}
                {member.links.length > 0 && (
                  <ul className="mt-3 flex flex-wrap items-center justify-center gap-1" aria-label={`Contact ${member.name}`}>
                    {member.links.map((link) => (
                      <li key={link.kind}>
                        <a
                          href={link.href}
                          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="flex size-11 items-center justify-center rounded-full text-body transition-colors duration-200 hover:bg-primary-tint hover:text-primary-ink"
                        >
                          <TeamLinkIcon kind={link.kind} />
                          <span className="sr-only">
                            {link.label}
                            {link.external ? " (opens in a new tab)" : ""}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function TeamLinkIcon({ kind }: { kind: TeamLink["kind"] }) {
  const className = "size-4";
  switch (kind) {
    case "email":
      return <Mail aria-hidden="true" className={className} />;
    case "phone":
      return <Phone aria-hidden="true" className={className} />;
    case "whatsapp":
      return <WhatsAppIcon className={className} />;
    case "facebook":
    case "instagram":
    case "linkedin":
    case "x":
      return <SocialIcon network={kind} className={className} />;
    default: {
      const unreachable: never = kind;
      return unreachable;
    }
  }
}
