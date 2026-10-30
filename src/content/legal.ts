import type { LegalSection } from "@/components/sections/legal-document";

/*
 * Placeholder legal copy written for an online honey store. It is a
 * sensible starting point, NOT legal advice: have counsel review it (and fill
 * in the business entity, jurisdiction and data-processor details) before launch.
 */

export const LEGAL_UPDATED_ON = "2026-10-23";

export const privacyIntro =
  "This Privacy Policy explains what personal information Honey by Abdul Sami Enterprises (“Abdul Sami Honey”, “we”, “us”) collects when you visit our website or place an order, how we use it, and the choices you have.";

export const privacySections: ReadonlyArray<LegalSection> = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    paragraphs: ["We collect only what we need to run the store and deliver your honey:"],
    list: [
      "Contact details you give us, such as your name, email address, phone number and delivery address.",
      "Order details, including the products you buy, delivery notes and your chosen payment method.",
      "Messages you send through our contact form or by email.",
      "Basic technical data such as browser type and pages visited, used to keep the site secure and working.",
      "Anonymous blog visit counts and an estimate of active time spent with an article visible, used to understand which articles readers find useful.",
    ],
    after: [
      "Card and wallet payments are processed by our payment providers. We never see or store your full card number.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    list: [
      "To process, deliver and support your orders.",
      "To reply to your questions and requests.",
      "To send newsletters, only if you subscribe. Every email includes an unsubscribe link.",
      "To prevent fraud and keep our services secure.",
      "To meet our legal and accounting obligations.",
    ],
  },
  {
    id: "cookies-and-storage",
    title: "Cookies and local storage",
    paragraphs: [
      "Our site stores your shopping cart in your browser’s local storage so it survives page reloads. This data stays on your device and is not used for advertising.",
      "For blog statistics, we store a random visit identifier and reading time in your browser’s session storage. It is used for up to 30 minutes and remains there until the tab is closed. The store records the article, visit identifier and estimated active time; it does not store your IP address or account identity for these statistics. We respect browser Do Not Track and Global Privacy Control signals.",
      "We do not use third-party advertising cookies. We ask for consent where the law requires it.",
    ],
  },
  {
    id: "sharing",
    title: "When we share information",
    paragraphs: [
      "We never sell your personal information. We share it only with service providers who help us run the store, such as delivery partners, payment processors and email providers, and only as much as they need to do their job.",
      "We may also disclose information if required by law or to protect the rights and safety of our customers and staff.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    paragraphs: [
      "We keep order records for as long as needed for tax and accounting purposes (typically seven years). Contact form messages are deleted after 24 months unless they relate to an open issue. You can unsubscribe from newsletters at any time.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    paragraphs: ["Depending on where you live, you may have the right to:"],
    list: [
      "Access the personal information we hold about you.",
      "Ask us to correct or delete it.",
      "Object to or restrict certain processing.",
      "Receive a copy of your data in a portable format.",
      "Withdraw consent you have given, such as for marketing emails.",
    ],
    after: ["To make a request, contact us using the details below. We will respond within 30 days."],
  },
  {
    id: "children",
    title: "Children’s privacy",
    paragraphs: [
      "Our store is intended for adults. We do not knowingly collect personal information from children under 13. If you believe a child has given us information, please contact us and we will delete it.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We use encryption in transit (HTTPS), access controls and reputable service providers to protect your information. No system is perfectly secure, but we work hard to keep your data safe and will notify you of any breach as required by law.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. When we make significant changes we will update the date above and, where appropriate, let you know by email.",
    ],
  },
];

export const termsIntro =
  "These Terms & Conditions govern your use of the Honey by Abdul Sami Enterprises website and any purchase you make from us. By placing an order you agree to these terms, so please read them carefully.";

export const termsSections: ReadonlyArray<LegalSection> = [
  {
    id: "about-us",
    title: "About us",
    paragraphs: [
      "Honey by Abdul Sami Enterprises sells raw honey, honeycomb and honey gift sets online for delivery across Pakistan. You can reach us through our contact page or the details at the end of these terms.",
    ],
  },
  {
    id: "orders",
    title: "Placing an order",
    paragraphs: [
      "When you place an order you make an offer to buy the products in your cart. We will confirm acceptance by email. We may decline or cancel an order, for example if a product is unavailable or a pricing error has occurred; if we do, we will refund any payment in full.",
    ],
  },
  {
    id: "pricing",
    title: "Prices and availability",
    paragraphs: [
      "Prices are shown in Pakistani rupees (PKR) and include applicable taxes unless stated otherwise. Honey is seasonal, so availability can change at short notice. If an item becomes unavailable after you order, we will offer a suitable substitute or a refund for that item.",
    ],
  },
  {
    id: "payment",
    title: "Payment",
    paragraphs: [
      "We accept the payment methods shown at checkout. Payment is taken when your order is confirmed, except for cash on delivery orders, which are paid to the courier.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    paragraphs: [
      "We deliver across Pakistan, usually within 2–5 working days, and send you an estimated delivery window. Orders over Rs 5,000 ship free; a delivery fee applies to smaller orders and is shown before you pay.",
      "Please make sure someone is available to receive chilled and frozen items. If no one is home, the courier may leave non-perishable items in a safe place you have specified.",
    ],
  },
  {
    id: "returns",
    title: "Returns and refunds",
    paragraphs: [
      "For hygiene and food-safety reasons we cannot accept returns of opened jars or honeycomb. If anything arrives damaged, spoiled or below our quality standards, tell us within 3 days of delivery and we will refund or replace the affected items.",
      "Unopened non-perishable goods can be returned within 15 days of delivery for a refund of the product price.",
    ],
  },
  {
    id: "claims",
    title: "Claims",
    paragraphs: ["To make a claim about an order, contact our customer care team and include:"],
    list: [
      "Your order number.",
      "The affected products and a short description of the issue.",
      "A photo of the item and packaging, if possible.",
    ],
    after: ["We aim to resolve every claim within 2 business days."],
  },
  {
    id: "product-information",
    title: "Product information",
    paragraphs: [
      "We take care to describe our products accurately, including ingredients and allergens. Raw honey varies in colour, texture and flavour from harvest to harvest, and may crystallise naturally. Honey is not suitable for infants under 12 months. Always read the label on the product itself before eating, especially if you have an allergy.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    paragraphs: [
      "All content on this website, including text, graphics and logos, belongs to Honey by Abdul Sami Enterprises or its licensors and may not be copied or reused without permission.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    paragraphs: [
      "Nothing in these terms limits liability that cannot be limited by law. Otherwise, our total liability for any order is limited to the amount you paid for that order. We are not liable for indirect or consequential losses.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the State of New York, United States, without affecting any consumer protections you have under the laws of the place where you live.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. The version in force when you place an order applies to that order.",
    ],
  },
];
