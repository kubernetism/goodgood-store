import type { StaticImageData } from "next/image";
import type { ImageAsset } from "@/features/products/types";
import shopDisplay from "../../images/header/Abdul Sami Honey Shop Display.png";
import footer from "../../images/footer/footer.png";
import honey from "../../images/products/Honey_Product.png";
import wildHoney from "../../images/products/Wild-Honey-product.png";
import honeyNuts from "../../images/products/Honey-Soaked-Nuts-in-Rustic-Jar-product.png";
import saffron from "../../images/products/Zafran_product.png";
import showcase from "../../images/ads/Abdul Sami Enterprises Honey Showcase-1.png";

// Import the originals in place. Next serves responsive, optimised versions;
// no duplicate copies or database uploads are needed.
function asset(image: StaticImageData, alt: string): ImageAsset {
  return { url: image.src, width: image.width, height: image.height, alt };
}

export const localImages = {
  shop: asset(shopDisplay, "Abdul Sami Enterprises shop display with honey jars and the company sign"),
  footer: asset(footer, "Abdul Sami Enterprises honey, nuts and saffron banner with a Quranic excerpt"),
  honey: asset(honey, "Abdul Sami Honey Enterprises jar with honeycomb and a wooden dipper"),
  wildHoney: asset(wildHoney, "Abdul Sami wild honey and honeycomb jar beside a beehive"),
  honeyNuts: asset(honeyNuts, "Mixed almonds, walnuts and cashews soaked in honey"),
  saffron: asset(saffron, "Saffron packages with saffron threads and crocus flowers"),
  showcase: asset(showcase, "Abdul Sami Enterprises honey, honey-soaked nuts and saffron range, with import and export contact details"),
} as const;
