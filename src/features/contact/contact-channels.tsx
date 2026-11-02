import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Clock, Mail, MapPin, Navigation, PhoneCall, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import type { ImageAsset } from "@/features/products/types";
import { cx } from "@/lib/cx";
import { siteConfig } from "@/lib/site";
import { formatOpeningHours } from "./business-hours";
import { CopyButton } from "./copy-button";

const { contact } = siteConfig;

export type WhatsappRoute = { href: string; display: string };

/** Hexagonal icon badge shared by the cards. */
function HexBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span aria-hidden="true" className={cx("hex-clip flex size-12 shrink-0 items-center justify-center", className)}>
      {children}
    </span>
  );
}

/*
 * Stretched link: the card's main <a> covers the whole card via ::after, so
 * the card is one large target while secondary buttons (z-10) stay usable.
 * The focus ring is drawn inset on the ::after box, so cards that clip
 * their texture (overflow-hidden) still show it.
 */
const stretched =
  "after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-focus";
const lift =
  "transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const eyebrow = "text-eyebrow font-bold uppercase";
const [emailLocal, emailDomain] = contact.email.split("@");

/** Initials for the hex monogram: "M.D Basit Khan" -> "BK". */
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function WhatsappCard({ whatsapp }: { whatsapp: WhatsappRoute }) {
  return (
    <article className={cx("relative isolate flex flex-col overflow-hidden rounded-lg bg-primary p-6 text-strong md:col-span-2 md:flex-row md:items-center md:gap-8 lg:col-span-1 lg:flex-col lg:items-start lg:gap-0 lg:p-8", lift)}>
      <HoneycombPattern fade className="text-strong/10" />
      <HexBadge className="bg-strong text-primary">
        <WhatsAppIcon className="size-6" />
      </HexBadge>
      <div className="mt-5 md:mt-0 lg:mt-5 lg:pb-6">
        <p className={cx(eyebrow, "text-brown-800")}>Message us</p>
        <h3 className="mt-1 text-h3 font-semibold text-strong">
          <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className={stretched}>
            WhatsApp
            <span className="sr-only"> {whatsapp.display} (opens WhatsApp)</span>
          </a>
        </h3>
        <p aria-hidden="true" className="mt-1 text-lg font-semibold">
          {whatsapp.display}
        </p>
        <p className="mt-3 max-w-[30ch] text-brown-800">Send a question, your order number or a photo of your parcel.</p>
      </div>
      <span aria-hidden="true" className={buttonClasses({ variant: "dark", className: "mt-6 self-start md:mt-0 md:ml-auto md:self-center lg:mt-auto lg:ml-0 lg:self-start" })}>
        Chat on WhatsApp
        <ArrowUpRight className="size-4" />
      </span>
    </article>
  );
}

function CallCard({ wide }: { wide: boolean }) {
  return (
    <article className={cx("rounded-lg border border-border bg-ivory p-6 md:col-span-2 lg:p-8", wide ? "lg:col-span-3" : "lg:col-span-2")}>
      <h3 className="text-h3 font-semibold">Call our team</h3>
      <p className="mt-1 text-meta text-muted">Three of us take calls during office hours.</p>
      <ul className="mt-5 divide-y divide-border md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
        {contact.people.map((person) => (
          <li key={person.phoneHref} className="md:px-5 md:first:pl-0 md:last:pr-0">
            <a
              href={person.phoneHref}
              className="group flex min-h-16 items-center gap-4 rounded-sm py-3 md:flex-col md:items-start md:gap-3 md:py-1"
            >
              <span aria-hidden="true" className="hex-clip flex size-11 shrink-0 items-center justify-center bg-primary text-sm font-bold text-strong">
                {initials(person.name)}
              </span>
              <span className="min-w-0">
                <span className="sr-only">Call </span>
                <span className="block text-h4 font-semibold text-strong">{person.name}</span>
                <span className="block text-lg font-semibold text-strong underline-offset-4 transition-colors duration-200 group-hover:text-primary-ink group-hover:underline">
                  {person.phoneDisplay}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-strong text-on-dark transition-colors duration-200 group-hover:bg-brown-800 md:ml-0 md:h-10 md:w-auto md:gap-2 md:border-2 md:border-strong md:bg-transparent md:px-5 md:text-button md:font-semibold md:text-strong md:uppercase md:group-hover:bg-strong md:group-hover:text-on-dark"
              >
                <PhoneCall className="size-5 md:size-4" />
                <span className="hidden md:inline">Call</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

function EmailCard() {
  return (
    <article className={cx("relative flex flex-col rounded-lg border border-border bg-surface p-6 md:col-span-2 lg:col-span-1 lg:p-8", lift)}>
      <HexBadge className="bg-primary-tint text-primary-ink">
        <Mail className="size-[1.375rem]" strokeWidth={1.75} />
      </HexBadge>
      <p className={cx(eyebrow, "mt-5 text-primary-ink")}>Write to us</p>
      <h3 className="mt-1 text-h3 font-semibold">Email</h3>
      <p className="mt-1 text-base font-semibold [overflow-wrap:anywhere] text-strong">
        {/* Wrap after the @ rather than mid-word in narrow columns. */}
        {emailLocal}@<wbr />
        {emailDomain}
      </p>
      <p className="mt-3">Best for detailed questions, wholesale enquiries and attachments.</p>
      <div className="mt-auto flex min-h-11 flex-wrap items-center gap-x-5 gap-y-3 pt-6">
        <a
          href={`mailto:${contact.email}?subject=${encodeURIComponent("Honey enquiry")}`}
          className={cx("inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-ink", stretched)}
        >
          Write an email
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
        <CopyButton value={contact.email} label="Copy email" copiedMessage="Email address copied" />
      </div>
    </article>
  );
}

function VisitCard({ image, mapsUrl }: { image: ImageAsset | null; mapsUrl: string }) {
  return (
    <article className="on-dark relative grid overflow-hidden rounded-lg bg-brown-950 text-on-dark md:col-span-2 md:grid-cols-2">
      <div className="relative">
        <MediaImage
          image={image}
          alt=""
          sizes="(min-width: 1024px) 385px, (min-width: 768px) 360px, calc(100vw - 2rem)"
          aspect="aspect-[3/2] md:aspect-auto md:h-full md:min-h-80"
          tone="dark"
        />
        <p className="absolute bottom-4 left-4 rounded-full bg-brown-950/85 px-3 py-1 text-meta font-semibold text-on-dark">Our shop display</p>
      </div>
      <div className="flex flex-col p-6 lg:p-8">
        <p className={cx(eyebrow, "text-primary")}>Visit the shop</p>
        <h3 className="mt-1 text-h3 font-semibold text-on-dark">
          {contact.branch}, {contact.shortAddress.replace(/, Peshawar$/, "")}
        </h3>
        <address className="mt-3 text-on-dark-muted not-italic">{contact.address}</address>
        <p className="mt-3 flex gap-2 text-meta text-on-dark">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          Look for Usman Tower by the Byco pump, near Nasir Pur Phatak.
        </p>
        <p className="mt-2 flex gap-2 text-meta text-on-dark-muted">
          <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          Office hours: {formatOpeningHours(contact.openingHours, true)}
        </p>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: "sm", className: "h-11" })}>
            <Navigation className="size-4" aria-hidden="true" />
            Get directions
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
          <CopyButton
            value={`${contact.branch}, ${contact.address}`}
            label="Copy address"
            copiedMessage="Address copied"
            variant="outline-dark"
          />
        </div>
      </div>
    </article>
  );
}

function TrackStrip() {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-primary-tint px-6 py-5 sm:flex-row sm:items-center md:col-span-2 lg:col-span-3">
      <div className="flex items-center gap-4">
        <HexBadge className="bg-surface text-primary-ink">
          <Truck className="size-[1.375rem]" strokeWidth={1.75} />
        </HexBadge>
        <div>
          <h3 className="text-h4 font-semibold text-strong">Already ordered?</h3>
          <p>Track your parcel with your order number and mobile number.</p>
        </div>
      </div>
      <Link href="/track-order" className={buttonClasses({ variant: "outline", size: "sm", className: "h-11 self-start sm:ml-auto sm:self-center" })}>
        Track your order
      </Link>
    </div>
  );
}

type ContactChannelsProps = {
  whatsapp: WhatsappRoute | null;
  shopImage: ImageAsset | null;
  mapsUrl: string;
};

/** Every way to reach the shop, ranked: message, call, email, visit, track. */
export function ContactChannels({ whatsapp, shopImage, mapsUrl }: ContactChannelsProps) {
  return (
    <section aria-labelledby="routes-heading" className="pt-6 pb-16 lg:pt-10 lg:pb-24">
      <Container>
        <div className="mb-6 flex flex-col gap-2 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="routes-heading" className="shrink-0 text-h2-sm font-semibold lg:text-h3">
            Talk to us directly
          </h2>
          <p className="flex items-start gap-2 text-meta text-muted">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
            Office hours: {contact.hours} · {contact.onlineOrders}
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {whatsapp && <WhatsappCard whatsapp={whatsapp} />}
          <CallCard wide={!whatsapp} />
          <EmailCard />
          <VisitCard image={shopImage} mapsUrl={mapsUrl} />
          <TrackStrip />
        </div>
      </Container>
    </section>
  );
}
