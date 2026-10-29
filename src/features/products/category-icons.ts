import { Droplet, Flower2, Gift, Leaf, TreeDeciduous, TreePine } from "lucide-react";
import { HoneyJarIcon, HoneycombIcon, type IconComponent } from "@/components/icons/honey-icons";

/** Glyph shown inside product image placeholders, so tiles stay distinguishable. */
const categoryIcons: Record<string, IconComponent> = {
  sidr: TreeDeciduous,
  acacia: Leaf,
  wildflower: Flower2,
  "black-forest": TreePine,
  "pure-natural": Droplet,
  honeycomb: HoneycombIcon,
  "gift-sets": Gift,
};

/** Categories added in the admin get the honey jar. */
export function categoryIcon(slug: string): IconComponent {
  return categoryIcons[slug] ?? HoneyJarIcon;
}
