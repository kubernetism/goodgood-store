import { FlaskConical } from "lucide-react";
import { BeeIcon, HoneyDipperIcon, HoneyJarIcon, HoneycombIcon, type IconComponent } from "@/components/icons/honey-icons";

/*
 * About page copy in one place, so it can be checked and edited without
 * touching layout. Every claim below is reused from copy already on the site
 * (home, FAQ, store promises). Confirm each one is accurate before launch.
 *
 * Unverified facts start as `null` or empty and render nothing until set:
 * the page never shows a made-up year, number or certification.
 */

/** Year the business started, e.g. 2012. `null` hides every "Since …" mention. */
export const foundedYear: number | null = null;

/**
 * Optional figures for the story section, e.g.
 * `{ value: "40+", label: "partner beekeepers" }`. Add only numbers you can
 * stand behind; the row is hidden while this list is empty.
 */
export const aboutStats: ReadonlyArray<{ value: string; label: string }> = [];

/** Regions named in the story, the hero label and the first process step. */
export const sourceRegions = ["Khyber Pakhtunkhwa", "Punjab", "Gilgit-Baltistan"] as const;

export type ProcessStep = { label: string; title: string; text: string; icon: IconComponent };

/** Hive → jar, in order. */
export const processSteps: ReadonlyArray<ProcessStep> = [
  {
    label: "The hive",
    title: "Kept by beekeepers we know",
    text: "Our partner beekeepers in Khyber Pakhtunkhwa, Punjab and Gilgit-Baltistan move their hives with the bloom, season after season.",
    icon: BeeIcon,
  },
  {
    label: "The harvest",
    title: "Taken in season",
    text: "Each region is harvested when its flowers have done their work, and we pay fairly for every season's harvest.",
    icon: HoneycombIcon,
  },
  {
    label: "Extraction",
    title: "Cold-extracted, cloth-strained",
    text: "No heating, no blending, no syrups, ever. The honey keeps the character of the flowers it came from.",
    icon: HoneyDipperIcon,
  },
  {
    label: "Testing",
    title: "Checked before it is jarred",
    text: "We test each batch for moisture and common adulterants. If it fails, it never reaches our shelves.",
    icon: FlaskConical,
  },
  {
    label: "The jar",
    title: "Numbered back to its source",
    text: "Every jar carries a batch number that leads back to one region, one season and one beekeeper.",
    icon: HoneyJarIcon,
  },
];

/** The promise band's "we never" list, struck through on screen. */
export const neverList = ["Heat it", "Blend it", "Cut it with syrup", "Sell an untested batch"] as const;
