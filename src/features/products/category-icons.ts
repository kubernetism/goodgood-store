import { Droplet, Flower2, Gift, Leaf, TreeDeciduous, TreePine } from "lucide-react";
import { HoneycombIcon, type IconComponent } from "@/components/icons/honey-icons";
import type { CategorySlug } from "./data";

/** Glyph shown inside product image placeholders, so tiles stay distinguishable. */
export const categoryIcons: Record<CategorySlug, IconComponent> = {
  sidr: TreeDeciduous,
  acacia: Leaf,
  wildflower: Flower2,
  "black-forest": TreePine,
  "pure-natural": Droplet,
  honeycomb: HoneycombIcon,
  "gift-sets": Gift,
};
