/**
 * Seed catalogue: the original 26 mock products and 7 categories. Loaded into
 * the database by `npm run db:seed` (scripts/seed.mts); the storefront reads
 * the database, never this file. Also used as a fixture by unit tests.
 *
 * Prices are integer paisa (PKR minor units: Rs 1 = 100 paisa) and are always
 * whole rupees, e.g. Rs 2,450 is stored as 245_000. Prices are placeholders.
 */
import type { ProductTag } from "@/features/products/types";

export const categories = [
  {
    slug: "sidr",
    name: "Sidr",
    blurb: "Prized beri-blossom honey from the hills of Karak.",
  },
  {
    slug: "acacia",
    name: "Acacia",
    blurb: "Light, mild phulai honey that stays runny for months.",
  },
  {
    slug: "wildflower",
    name: "Wildflower",
    blurb: "Mountain meadows of Swat and Hunza in every spoonful.",
  },
  {
    slug: "black-forest",
    name: "Black Forest",
    blurb: "Dark, mineral-rich honeydew from northern pine forests.",
  },
  {
    slug: "pure-natural",
    name: "Pure Natural",
    blurb: "Our everyday multifloral honey, raw and never blended.",
  },
  {
    slug: "honeycomb",
    name: "Honeycomb",
    blurb: "Honey exactly as the bees sealed it, wax and all.",
  },
  {
    slug: "gift-sets",
    name: "Gift Sets",
    blurb: "Boxed jars, combs and dippers for Eid, weddings and thank-yous.",
  },
] as const;

export type SeedCategorySlug = (typeof categories)[number]["slug"];

export type SeedProduct = {
  slug: string;
  name: string;
  category: SeedCategorySlug;
  /** Current price in paisa (whole rupees × 100). */
  price: number;
  /** Original price in paisa, when on sale. */
  compareAtPrice?: number;
  /** 0–5 average rating. */
  rating: number;
  reviewCount: number;
  /** Net weight or pack contents, e.g. "500 g". */
  unit: string;
  /** Region the honey comes from. */
  origin: string;
  /** Harvest window, e.g. "Autumn 2025". */
  harvest: string;
  /** What the bees foraged on. */
  floralSource: string;
  tasteNotes: string;
  summary: string;
  description: string;
  tags: ReadonlyArray<ProductTag>;
  /** ISO date the product was listed; drives "Newest" sorting. */
  listedOn: string;
};

/** Rupees -> paisa, so prices below read like the shelf price. */
const rs = (rupees: number) => rupees * 100;

const sidrBase = {
  category: "sidr",
  origin: "Karak, Khyber Pakhtunkhwa",
  harvest: "Autumn 2025",
  floralSource: "Sidr (beri, Ziziphus) blossom",
  tasteNotes: "Rich, buttery, with a warm caramel finish",
} as const;

const acaciaBase = {
  category: "acacia",
  origin: "Chakwal, Potohar Plateau",
  harvest: "Summer 2026",
  floralSource: "Phulai (Acacia modesta) blossom",
  tasteNotes: "Delicate, clean and floral with vanilla notes",
} as const;

const wildflowerBase = {
  category: "wildflower",
  origin: "Swat Valley, Khyber Pakhtunkhwa",
  harvest: "Spring 2026",
  floralSource: "Mixed alpine wildflowers",
  tasteNotes: "Bright and fruity with a gentle herbal edge",
} as const;

const blackForestBase = {
  category: "black-forest",
  origin: "Galiyat forests, Murree Hills",
  harvest: "Late summer 2026",
  floralSource: "Pine and fir honeydew",
  tasteNotes: "Deep, malty and resinous, barely sweet",
} as const;

const pureNaturalBase = {
  category: "pure-natural",
  origin: "Punjab orchards and fields",
  harvest: "Spring 2026",
  floralSource: "Citrus, mustard (sarson) and beri",
  tasteNotes: "Round, honest sweetness with a citrus lift",
} as const;

export const products: ReadonlyArray<SeedProduct> = [
  // Sidr
  {
    ...sidrBase,
    slug: "sidr-honey-250g",
    name: "Sidr Honey 250 g",
    price: rs(2450),
    rating: 4.5,
    reviewCount: 64,
    unit: "250 g",
    summary: "Our signature beri honey in a size made for first tastes and thoughtful gifts.",
    description:
      "Sidr honey is gathered when the beri trees of Karak flower each autumn. It is thick, amber and famously rich. We extract it cold, strain it once through cloth and jar it without heating, so the aroma and natural enzymes stay intact.",
    tags: ["Raw", "Unfiltered", "Single Origin"],
    listedOn: "2026-09-04",
  },
  {
    ...sidrBase,
    slug: "sidr-honey-500g",
    name: "Sidr Honey 500 g",
    price: rs(4650),
    compareAtPrice: rs(5200),
    rating: 5,
    reviewCount: 212,
    unit: "500 g",
    summary: "The jar most of our customers come back for: raw Karak Sidr, never heated or blended.",
    description:
      "A full season of beri blossom in one jar. Each batch is traceable to a single apiary in Karak and tested for moisture and purity before it is bottled. Enjoy it by the spoon, in warm water in the morning, or drizzled over desi ghee paratha.",
    tags: ["Raw", "Unfiltered", "Single Origin", "Best Seller"],
    listedOn: "2026-08-21",
  },
  {
    ...sidrBase,
    slug: "sidr-honey-1kg",
    name: "Sidr Honey 1 kg",
    price: rs(8900),
    compareAtPrice: rs(9800),
    rating: 4.5,
    reviewCount: 97,
    unit: "1 kg",
    summary: "The family-size jar of our raw beri honey, at the best price per gram.",
    description:
      "The same single-apiary Sidr as our 500 g jar, packed in a wide-mouth glass jar that is easy to spoon from. Store it at room temperature and away from sunlight; it keeps for years.",
    tags: ["Raw", "Unfiltered", "Single Origin"],
    listedOn: "2026-07-30",
  },
  {
    ...sidrBase,
    slug: "karak-reserve-sidr",
    name: "Karak Reserve Sidr",
    price: rs(6500),
    rating: 5,
    reviewCount: 31,
    unit: "500 g",
    harvest: "Autumn 2026, first extraction",
    summary: "A small-lot first extraction from old-growth beri groves, numbered by batch.",
    description:
      "Only a few hundred jars are filled each season from the first frames lifted from our oldest Karak apiary. It is darker and more intense than our everyday Sidr, with a long, toffee-like finish. Each jar carries its batch number and harvest date.",
    tags: ["Raw", "Unfiltered", "Single Origin", "Limited", "Seasonal"],
    listedOn: "2026-10-20",
  },

  // Acacia
  {
    ...acaciaBase,
    slug: "acacia-honey-250g",
    name: "Acacia Honey 250 g",
    price: rs(1150),
    rating: 4.5,
    reviewCount: 48,
    unit: "250 g",
    summary: "Pale gold phulai honey with a soft, clean sweetness that suits tea perfectly.",
    description:
      "Acacia honey is high in fructose, so it stays liquid far longer than most honeys. Its mild flavour makes it the one to stir into green tea or kahwa without masking the leaves.",
    tags: ["Raw", "Single Origin"],
    listedOn: "2026-07-12",
  },
  {
    ...acaciaBase,
    slug: "acacia-honey-500g",
    name: "Acacia Honey 500 g",
    price: rs(2150),
    compareAtPrice: rs(2450),
    rating: 4.5,
    reviewCount: 156,
    unit: "500 g",
    summary: "Our most-loved everyday honey: light, floral and gentle enough for children.",
    description:
      "Gathered from phulai trees across the Potohar Plateau in early summer. We cold-extract and lightly strain it to remove wax, keeping the pollen that gives it character.",
    tags: ["Raw", "Single Origin", "Best Seller"],
    listedOn: "2026-07-18",
  },
  {
    ...acaciaBase,
    slug: "acacia-honey-1kg",
    name: "Acacia Honey 1 kg",
    price: rs(4100),
    rating: 4,
    reviewCount: 39,
    unit: "1 kg",
    summary: "The kitchen jar: mild acacia honey for baking, marinades and daily tea.",
    description:
      "A generous jar for households that get through honey quickly. The flavour holds up well in baking and does not overpower delicate desserts like kheer and halwa.",
    tags: ["Raw", "Single Origin"],
    listedOn: "2026-06-25",
  },
  {
    ...acaciaBase,
    slug: "creamed-acacia-honey",
    name: "Creamed Acacia Honey",
    price: rs(1650),
    rating: 4.5,
    reviewCount: 57,
    unit: "350 g",
    tasteNotes: "Silky and spreadable, like honey butter",
    summary: "Acacia honey gently stirred over days into a soft, spreadable cream.",
    description:
      "Nothing is added: we seed raw acacia honey with fine crystals and stir it slowly in a cool room until it sets like butter. It spreads on toast without dripping and stays creamy for months.",
    tags: ["Raw"],
    listedOn: "2026-09-15",
  },

  // Wildflower
  {
    ...wildflowerBase,
    slug: "wildflower-honey-250g",
    name: "Wildflower Honey 250 g",
    price: rs(950),
    compareAtPrice: rs(1100),
    rating: 4,
    reviewCount: 41,
    unit: "250 g",
    summary: "A bright, fruity mountain honey from bees that forage Swat's summer meadows.",
    description:
      "Wildflower honey changes a little with every harvest because it reflects whatever is in bloom. This season's jar is fragrant and fruity, with a light herbal note from wild thyme.",
    tags: ["Raw", "Unfiltered"],
    listedOn: "2026-06-30",
  },
  {
    ...wildflowerBase,
    slug: "wildflower-honey-500g",
    name: "Wildflower Honey 500 g",
    price: rs(1750),
    rating: 4.5,
    reviewCount: 88,
    unit: "500 g",
    summary: "Raw, unfiltered wildflower honey with all the pollen and character left in.",
    description:
      "We only strain out wax and bee parts, so you may see fine pollen and the honey may crystallise in winter. That is a sign it has not been heated. Warm the jar in lukewarm water to make it runny again.",
    tags: ["Raw", "Unfiltered", "Organic"],
    listedOn: "2026-07-05",
  },
  {
    ...wildflowerBase,
    slug: "wildflower-honey-1kg",
    name: "Wildflower Honey 1 kg",
    price: rs(3200),
    compareAtPrice: rs(3600),
    rating: 4.5,
    reviewCount: 52,
    unit: "1 kg",
    summary: "Our mountain wildflower honey in a family-size jar.",
    description:
      "The same raw, unfiltered Swat wildflower honey in a 1 kg jar. A favourite for breakfast tables: on yoghurt, porridge, fruit chaat or simply by the spoon.",
    tags: ["Raw", "Unfiltered", "Organic"],
    listedOn: "2026-07-05",
  },
  {
    ...wildflowerBase,
    slug: "hunza-spring-blossom",
    name: "Hunza Spring Blossom Honey",
    price: rs(1950),
    rating: 5,
    reviewCount: 23,
    unit: "500 g",
    origin: "Hunza Valley, Gilgit-Baltistan",
    floralSource: "Apricot, cherry and wild rose blossom",
    tasteNotes: "Fragrant and floral with a stone-fruit finish",
    summary: "A rare high-altitude honey from Hunza's apricot and cherry blossom season.",
    description:
      "Collected in the short spring window when Hunza's orchards are in flower. Our partner beekeepers move their hives up the valley with the bloom. Supply is small and sells out every year.",
    tags: ["Raw", "Unfiltered", "Single Origin", "Seasonal", "Limited"],
    listedOn: "2026-05-28",
  },

  // Black Forest
  {
    ...blackForestBase,
    slug: "black-forest-honey-250g",
    name: "Black Forest Honey 250 g",
    price: rs(1450),
    rating: 4,
    reviewCount: 27,
    unit: "250 g",
    summary: "Dark honeydew honey from the pine forests of the Galiyat, deep and malty.",
    description:
      "Unlike blossom honey, honeydew honey is made from the sweet sap secretions bees collect from pine and fir trees. It is darker, less sweet and richer in minerals, with a resinous, almost smoky flavour.",
    tags: ["Raw", "Single Origin"],
    listedOn: "2026-09-10",
  },
  {
    ...blackForestBase,
    slug: "black-forest-honey-500g",
    name: "Black Forest Honey 500 g",
    price: rs(2650),
    compareAtPrice: rs(2950),
    rating: 4.5,
    reviewCount: 73,
    unit: "500 g",
    summary: "Our darkest honey: malty, mineral and gently resinous. Superb with cheese and nuts.",
    description:
      "Harvested late in summer from hives placed deep in the Murree Hills forests. It stays liquid for a long time and pairs beautifully with walnuts, dried figs and strong black tea.",
    tags: ["Raw", "Single Origin", "Seasonal"],
    listedOn: "2026-09-10",
  },
  {
    ...blackForestBase,
    slug: "black-forest-honey-1kg",
    name: "Black Forest Honey 1 kg",
    price: rs(4950),
    compareAtPrice: rs(5500),
    rating: 4.5,
    reviewCount: 19,
    unit: "1 kg",
    summary: "Forest honeydew honey in a 1 kg jar for devoted dark-honey lovers.",
    description:
      "A generous jar of our late-summer forest honey. Its lower sweetness makes it a favourite for anyone who finds blossom honey too sugary.",
    tags: ["Raw", "Single Origin"],
    listedOn: "2026-09-12",
  },

  // Pure Natural
  {
    ...pureNaturalBase,
    slug: "pure-natural-honey-250g",
    name: "Pure Natural Honey 250 g",
    price: rs(750),
    rating: 4,
    reviewCount: 66,
    unit: "250 g",
    summary: "Raw multifloral honey from Punjab: the easiest way to start your honey habit.",
    description:
      "An honest, everyday honey from hives that move between citrus orchards and mustard fields. It is raw, lightly strained and never blended with syrups or imported honey.",
    tags: ["Raw"],
    listedOn: "2026-06-14",
  },
  {
    ...pureNaturalBase,
    slug: "pure-natural-honey-500g",
    name: "Pure Natural Honey 500 g",
    price: rs(1350),
    compareAtPrice: rs(1500),
    rating: 4.5,
    reviewCount: 189,
    unit: "500 g",
    summary: "Our best-value raw honey, loved for morning lemon water and family breakfasts.",
    description:
      "Every batch is lab-tested for adulteration before bottling. It crystallises naturally in cold weather; that is a sign of real, unheated honey.",
    tags: ["Raw", "Best Seller"],
    listedOn: "2026-06-14",
  },
  {
    ...pureNaturalBase,
    slug: "pure-natural-honey-1kg",
    name: "Pure Natural Honey 1 kg",
    price: rs(2550),
    rating: 4.5,
    reviewCount: 104,
    unit: "1 kg",
    summary: "The 1 kg jar of our everyday raw multifloral honey.",
    description:
      "Ideal for families and for cooking. Use it in place of sugar in chai, sharbat, marinades and baking; you need a little less honey than sugar for the same sweetness.",
    tags: ["Raw"],
    listedOn: "2026-06-20",
  },
  {
    ...pureNaturalBase,
    slug: "pure-natural-family-pack",
    name: "Pure Natural Family Pack",
    price: rs(4800),
    compareAtPrice: rs(5400),
    rating: 4,
    reviewCount: 35,
    unit: "2 × 1 kg",
    summary: "Two 1 kg jars of raw multifloral honey for big households and Ramadan stocking.",
    description:
      "Our best price per gram. Two sealed 1 kg jars of the same raw multifloral honey, so the second one stays fresh until you need it.",
    tags: ["Raw"],
    listedOn: "2026-08-02",
  },

  // Honeycomb
  {
    slug: "raw-honeycomb-400g",
    name: "Raw Honeycomb 400 g",
    category: "honeycomb",
    price: rs(2850),
    rating: 5,
    reviewCount: 82,
    unit: "400 g",
    origin: "Swat Valley, Khyber Pakhtunkhwa",
    harvest: "Summer 2026",
    floralSource: "Mixed alpine wildflowers",
    tasteNotes: "Floral honey with soft, chewy beeswax",
    summary: "A hand-cut slab of capped comb, straight from the frame to a sealed box.",
    description:
      "Honeycomb is honey in its most untouched form: still sealed in the wax cells the bees built. Cut a square and eat it whole, wax and all, or lay it on a cheese board. Keep it at room temperature.",
    tags: ["Raw", "Unfiltered", "Best Seller"],
    listedOn: "2026-08-28",
  },
  {
    slug: "honeycomb-in-sidr-honey",
    name: "Honeycomb in Sidr Honey",
    category: "honeycomb",
    price: rs(3950),
    rating: 4.5,
    reviewCount: 46,
    unit: "500 g jar",
    origin: "Karak, Khyber Pakhtunkhwa",
    harvest: "Autumn 2025",
    floralSource: "Sidr (beri) blossom",
    tasteNotes: "Caramel-rich Sidr with crisp comb pieces",
    summary: "Chunks of fresh comb suspended in raw Sidr honey: two textures in one jar.",
    description:
      "We cut fresh comb into the jar and top it up with raw Sidr honey from the same apiary. Spoon the comb onto warm bread or eat it straight; the honey around it is pure Sidr.",
    tags: ["Raw", "Unfiltered", "Single Origin"],
    listedOn: "2026-09-22",
  },
  {
    slug: "whole-comb-frame",
    name: "Whole Comb Frame",
    category: "honeycomb",
    price: rs(7500),
    rating: 5,
    reviewCount: 12,
    unit: "approx. 1.2 kg",
    origin: "Swat Valley, Khyber Pakhtunkhwa",
    harvest: "Summer 2026",
    floralSource: "Mixed alpine wildflowers",
    tasteNotes: "Fresh, floral and waxy",
    summary: "A full wooden frame of capped comb, a showpiece for gatherings and dawats.",
    description:
      "An entire frame lifted from the hive and packed in a food-safe display box. It makes a striking centrepiece for a breakfast table or wedding dessert spread. Limited to a few frames each week.",
    tags: ["Raw", "Unfiltered", "Limited"],
    listedOn: "2026-10-08",
  },

  // Gift Sets
  {
    slug: "tasting-trio-gift-set",
    name: "Tasting Trio Gift Set",
    category: "gift-sets",
    price: rs(2950),
    rating: 4.5,
    reviewCount: 58,
    unit: "3 × 125 g",
    origin: "Karak, Chakwal and Swat",
    harvest: "Current season",
    floralSource: "Sidr, Acacia and Wildflower",
    tasteNotes: "From light and floral to rich and caramel",
    summary: "Three small jars, Sidr, Acacia and Wildflower, for discovering your favourite.",
    description:
      "A neat kraft box with three 125 g jars and a tasting card that walks through each honey's colour, aroma and flavour. A thoughtful gift for anyone new to single-origin honey.",
    tags: ["Raw", "Gift", "Best Seller"],
    listedOn: "2026-09-01",
  },
  {
    slug: "honeycomb-gift-box",
    name: "Honeycomb Gift Box",
    category: "gift-sets",
    price: rs(5450),
    compareAtPrice: rs(6800),
    rating: 5,
    reviewCount: 44,
    unit: "Comb 400 g + Sidr 250 g + dipper",
    origin: "Karak and Swat",
    harvest: "Current season",
    floralSource: "Sidr blossom and alpine wildflowers",
    tasteNotes: "Fresh comb alongside rich Sidr",
    summary: "Raw honeycomb, a jar of Sidr and a hand-turned wooden dipper in a keepsake box.",
    description:
      "Our most-gifted box. Inside: a 400 g slab of capped honeycomb, a 250 g jar of raw Karak Sidr and a hand-turned sheesham dipper, nestled in a reusable box with a handwritten note card.",
    tags: ["Raw", "Gift", "Limited"],
    listedOn: "2026-10-12",
  },
  {
    slug: "eid-gift-hamper",
    name: "Eid Gift Hamper",
    category: "gift-sets",
    price: rs(8500),
    rating: 4.5,
    reviewCount: 21,
    unit: "4 jars + dipper",
    origin: "Karak, Chakwal, Swat and the Galiyat",
    harvest: "Current season",
    floralSource: "Sidr, Acacia, Wildflower and forest honeydew",
    tasteNotes: "A full tour of Pakistan's honeys",
    summary: "Four 250 g jars and a wooden dipper in a hamper made for Eid visits.",
    description:
      "Sidr, Acacia, Wildflower and Black Forest honey in 250 g jars, with a wooden dipper and a printed guide to each region. Add a personal message at checkout and we will handwrite it on the card.",
    tags: ["Gift", "Seasonal"],
    listedOn: "2026-10-01",
  },
  {
    slug: "signature-wooden-gift-box",
    name: "Signature Wooden Gift Box",
    category: "gift-sets",
    price: rs(9950),
    compareAtPrice: rs(11500),
    rating: 5,
    reviewCount: 16,
    unit: "2 × 500 g",
    origin: "Karak, Khyber Pakhtunkhwa",
    harvest: "Autumn 2025 and 2026",
    floralSource: "Sidr (beri) blossom",
    tasteNotes: "Two vintages of Sidr side by side",
    summary: "Two 500 g jars of Sidr, last season and this, in an engraved wooden box.",
    description:
      "Our premium corporate and wedding gift. A laser-engraved wooden box holds two 500 g jars of Sidr from consecutive harvests so you can taste how the season shapes the honey. Bulk and custom engraving are available on request.",
    tags: ["Gift", "Single Origin", "Limited"],
    listedOn: "2026-10-18",
  },
];

/** Per-category copy for the "Why you'll love it" list on product pages. */
export const categoryHighlights: Record<SeedCategorySlug, ReadonlyArray<{ title: string; text: string }>> = {
  sidr: [
    { title: "Single apiary", text: "Every batch is traceable to one beekeeper in Karak." },
    { title: "Never heated", text: "Cold-extracted and cloth-strained to keep aroma and enzymes." },
    { title: "Keeps for years", text: "Store sealed at room temperature, away from direct sun." },
  ],
  acacia: [
    { title: "Stays runny", text: "Naturally high in fructose, so it crystallises very slowly." },
    { title: "Gentle flavour", text: "Mild enough for children and for delicate green tea." },
    { title: "Lightly strained", text: "Wax removed, pollen kept, nothing added." },
  ],
  wildflower: [
    { title: "Truly seasonal", text: "Each harvest tastes of whatever was in bloom that year." },
    { title: "Raw & unfiltered", text: "Pollen left in; it may crystallise in winter, a sign of real honey." },
    { title: "Easy to revive", text: "Stand the jar in lukewarm water to make it runny again." },
  ],
  "black-forest": [
    { title: "Honeydew honey", text: "Made from pine and fir sap, not blossom: darker and less sweet." },
    { title: "Mineral-rich", text: "Higher in minerals than most blossom honeys." },
    { title: "Long-lasting", text: "Stays liquid for months at room temperature." },
  ],
  "pure-natural": [
    { title: "Lab-tested", text: "Every batch checked for adulteration and moisture before bottling." },
    { title: "Never blended", text: "No syrups, no imported honey, nothing added." },
    { title: "Everyday value", text: "Raw honey at a price that suits daily use." },
  ],
  honeycomb: [
    { title: "Untouched", text: "Honey still sealed in the wax cells the bees built." },
    { title: "Eat it whole", text: "The wax is edible and chewy; or spoon the honey and discard it." },
    { title: "Room temperature", text: "Do not refrigerate; keep the box closed and away from sun." },
  ],
  "gift-sets": [
    { title: "Ready to give", text: "Packed in a reusable box with a handwritten note card." },
    { title: "Personal message", text: "Add a note at checkout and we will write it for you." },
    { title: "Bulk orders", text: "Corporate and wedding orders welcome; contact us for pricing." },
  ],
};
