import { FREE_SHIPPING_THRESHOLD } from "@/features/cart/pricing";
import { formatPrice } from "@/lib/format";

/** Marketing copy shared by the home and about pages. Names are illustrative placeholders. */

export const testimonials = [
  {
    name: "Ayesha Siddiqui",
    role: "Lahore",
    rating: 5,
    quote:
      "The Sidr honey tastes exactly like the one my nani used to bring back from Karak. Thick, dark and not too sweet. We finished the first jar in two weeks.",
  },
  {
    name: "Bilal Ahmed",
    role: "Karachi",
    rating: 5,
    quote:
      "I ordered the Eid hamper for my office team. Beautifully packed, arrived in three days and everyone asked where it was from.",
  },
  {
    name: "Dr. Saima Raza",
    role: "Islamabad",
    rating: 5,
    quote:
      "I am careful about adulterated honey, so I appreciated seeing the batch number and harvest details on the jar. The acacia is lovely in green tea.",
  },
  {
    name: "Hamza Khattak",
    role: "Peshawar",
    rating: 4.5,
    quote:
      "The honeycomb was the highlight of our breakfast table. Fresh, floral and properly sealed. Customer support answered on WhatsApp within minutes.",
  },
  {
    name: "Mehwish Tariq",
    role: "Multan",
    rating: 5,
    quote:
      "Our kids now ask for wildflower honey on their paratha instead of jam. Ordering again is quick, and delivery has always been on time.",
  },
] as const;

export const teamMembers = [
  { name: "Abdul Sami", role: "Founder & Beekeeper" },
  { name: "Sana Malik", role: "Head of Quality" },
  { name: "Usman Khattak", role: "Apiary Partnerships" },
  { name: "Fatima Noor", role: "Customer Care Lead" },
] as const;

export const faqs = [
  {
    question: "How do I know your honey is pure?",
    answer:
      "Every batch is tested for moisture and common adulterants before it is jarred, and each jar carries its batch number and harvest season. We never heat, blend or add syrup to our honey.",
  },
  {
    question: "Why has my honey turned solid?",
    answer:
      "Crystallisation is natural for raw honey, especially in winter, and is a good sign it has not been heated. Stand the closed jar in warm (not hot) water for 15–20 minutes to make it runny again.",
  },
  {
    question: "How much is delivery?",
    answer: `We deliver across Pakistan in 2–5 working days. Orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)} ship free; smaller orders have a flat delivery fee shown at checkout.`,
  },
  {
    question: "Can I order gift sets in bulk?",
    answer:
      "Yes. We pack corporate, wedding and Eid gifts with custom notes or engraving. Contact us with your quantities and dates and we will send a quote.",
  },
  {
    question: "What if my order arrives damaged?",
    answer:
      "Send us a photo within 3 days of delivery with your order number and we will replace or refund the affected items. See our Terms & Conditions for details.",
  },
] as const;
