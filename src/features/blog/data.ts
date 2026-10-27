/** Mock blog content. Dates are ISO calendar dates (rendered in UTC). */

export const blogCategories = [
  { slug: "beekeeping", name: "Beekeeping" },
  { slug: "recipes", name: "Recipes" },
  { slug: "wellness", name: "Honey & Wellness" },
  { slug: "buying-guide", name: "Buying Guide" },
] as const;

export type BlogCategorySlug = (typeof blogCategories)[number]["slug"];

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: ReadonlyArray<string> }
  | { type: "quote"; text: string; cite?: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategorySlug;
  tags: ReadonlyArray<string>;
  author: string;
  publishedOn: string;
  views: number;
  comments: number;
  body: ReadonlyArray<BlogBlock>;
};

export const blogAuthor = {
  name: "Sana Malik",
  role: "Head of Quality & editor",
  bio: "Sana tests every batch before it is jarred and spends harvest season with our beekeepers in Karak and Swat. She writes about honey, bees and how to tell the real thing apart.",
};

export const blogPosts: ReadonlyArray<BlogPost> = [
  {
    slug: "a-sidr-harvest-in-karak",
    title: "Three days with a Sidr harvest in Karak",
    excerpt:
      "Before dawn, under beri trees in full bloom: what it takes to bring a season of Sidr honey from the hive to your jar.",
    category: "beekeeping",
    tags: ["Sidr", "Harvest", "Karak"],
    author: "Sana Malik",
    publishedOn: "2026-10-16",
    views: 412,
    comments: 18,
    body: [
      {
        type: "paragraph",
        text: "The beri trees around Karak flower for only a few weeks each autumn. Our partner beekeepers move their hives into the groves weeks earlier so the colonies are strong when the blossom opens.",
      },
      { type: "heading", text: "Lifting the frames" },
      {
        type: "paragraph",
        text: "Frames are only taken once the bees have capped at least three quarters of the cells with wax. Capped honey is ripe honey: its moisture is low enough that it will keep for years without fermenting.",
      },
      {
        type: "list",
        items: [
          "Frames are lifted early in the morning, while it is cool",
          "Honey is spun out cold, never heated",
          "It is strained once through cloth and left to settle",
        ],
      },
      {
        type: "quote",
        text: "You cannot hurry Sidr. The trees decide when the season starts, and the bees decide when it is ready.",
        cite: "Abdul Sami, founder",
      },
      { type: "heading", text: "From drum to jar" },
      {
        type: "paragraph",
        text: "Every drum is sampled and tested for moisture and adulterants before we accept it. Only then is it jarred, labelled with its batch number and harvest season, and sent to you.",
      },
    ],
  },
  {
    slug: "how-to-spot-adulterated-honey",
    title: "How to spot adulterated honey (and why home tests fall short)",
    excerpt:
      "The water test, the thumb test, the flame test: what they really tell you, and what to look for on the label instead.",
    category: "buying-guide",
    tags: ["Purity", "Guide"],
    author: "Sana Malik",
    publishedOn: "2026-10-04",
    views: 638,
    comments: 41,
    body: [
      {
        type: "paragraph",
        text: "Syrup-blended honey is a real problem in Pakistan, and popular home tests are easy to fool. Thick syrups pass the water test, and the flame test mostly measures moisture.",
      },
      { type: "heading", text: "What actually helps" },
      {
        type: "list",
        items: [
          "A named origin and harvest season on the label",
          "A batch number you can ask the seller about",
          "Natural crystallisation in cool weather",
          "Lab test results the seller is willing to share",
        ],
      },
      {
        type: "paragraph",
        text: "If a honey never crystallises, even after months in a cold kitchen, ask questions. Some varieties such as acacia crystallise very slowly, but most raw honeys set eventually.",
      },
    ],
  },
  {
    slug: "honey-lemon-ginger-chai",
    title: "Honey, lemon & ginger chai for cold mornings",
    excerpt:
      "A warming cup that is gentle on the throat. The trick is adding the honey last, once the tea has cooled a little.",
    category: "recipes",
    tags: ["Recipe", "Winter", "Tea"],
    author: "Sana Malik",
    publishedOn: "2026-09-24",
    views: 529,
    comments: 27,
    body: [
      {
        type: "paragraph",
        text: "Boiling honey dulls its aroma, so stir it in once your chai has cooled to drinking temperature.",
      },
      { type: "heading", text: "Ingredients" },
      {
        type: "list",
        items: [
          "2 cups water and 2 tsp black tea",
          "A thumb of fresh ginger, sliced",
          "Juice of half a lemon",
          "2 tsp acacia or wildflower honey",
        ],
      },
      { type: "heading", text: "Method" },
      {
        type: "paragraph",
        text: "Simmer the ginger in water for five minutes, add the tea and steep for two more. Strain, let it cool slightly, then stir in the lemon and honey.",
      },
    ],
  },
  {
    slug: "why-raw-honey-crystallises",
    title: "Why raw honey crystallises, and how to make it runny again",
    excerpt:
      "Crystallisation is not spoilage. It is one of the best signs your honey is real. Here is the science and the fix.",
    category: "wellness",
    tags: ["Raw Honey", "Storage"],
    author: "Sana Malik",
    publishedOn: "2026-09-11",
    views: 701,
    comments: 33,
    body: [
      {
        type: "paragraph",
        text: "Honey is a supersaturated sugar solution. Over time, and faster in the cold, glucose separates out as tiny crystals. Honeys high in glucose, like wildflower, set quickly; acacia, high in fructose, stays runny much longer.",
      },
      { type: "heading", text: "Bringing it back" },
      {
        type: "list",
        items: [
          "Stand the closed jar in warm, not hot, water",
          "Stir gently every few minutes",
          "Never microwave raw honey",
        ],
      },
    ],
  },
  {
    slug: "a-guide-to-pakistani-honey-varieties",
    title: "Sidr, acacia, wildflower: a guide to Pakistan's honeys",
    excerpt:
      "From the beri groves of Karak to the apricot orchards of Hunza, each region gives its honey a distinct colour and taste.",
    category: "buying-guide",
    tags: ["Varieties", "Guide"],
    author: "Sana Malik",
    publishedOn: "2026-08-29",
    views: 488,
    comments: 15,
    body: [
      {
        type: "paragraph",
        text: "Single-origin honey tastes of the flowers the bees visited. Pakistan's geography, from desert scrub to alpine meadows, makes for remarkable variety.",
      },
      {
        type: "list",
        items: [
          "Sidr (beri): dark amber, rich and caramel-like",
          "Acacia (phulai): pale, mild and slow to crystallise",
          "Wildflower: bright and fruity, changes every season",
          "Black forest honeydew: dark, malty and less sweet",
        ],
      },
    ],
  },
  {
    slug: "how-bees-make-honeycomb",
    title: "How bees build honeycomb, one hexagon at a time",
    excerpt:
      "Why hexagons? A short look at the wax, the maths and the teamwork behind every slab of comb we sell.",
    category: "beekeeping",
    tags: ["Honeycomb", "Bees"],
    author: "Sana Malik",
    publishedOn: "2026-08-14",
    views: 264,
    comments: 9,
    body: [
      {
        type: "paragraph",
        text: "Young worker bees secrete wax from glands on their abdomens and shape it into cells. Hexagons tile without gaps and use the least wax for the most storage.",
      },
      { type: "heading", text: "From cell to comb" },
      {
        type: "list",
        items: [
          "Bees fill each cell with nectar and fan it to evaporate water",
          "When the honey is ripe they cap the cell with fresh wax",
          "Capped comb is what we cut and box for you",
        ],
      },
    ],
  },
];
