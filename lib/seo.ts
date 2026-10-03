import { SERVED_IMAGES } from "./images";

export const SITE_URL = "https://chxgoose.com";

export const HOME_TITLE = "You found Billie! — chxgoose";
export const HOME_DESCRIPTION =
  "You found Billie the porch goose at 905 Bridge. Joke of the day, then chip in — the winning Amazon outfit gets put on her.";

export const TERMS_TITLE = "Honks, gifts, and no refunds — chxgoose";
export const TERMS_DESCRIPTION =
  "Honks are voluntary gifts toward Billie’s outfit. Not tax-deductible. No refunds.";

export const OWNER_DESCRIPTION =
  "Private desk for the caption, the outfit on Billie, and whether a look has been ordered.";

export const KEEPER_HEADING = "Who keeps Billie";
export const KEEPER_BIO =
  "Billie is a plastic porch goose at 905 Bridge. The person who lives there dresses her, takes the photo, and writes this page.";

export const PORCH_FAQ = [
  {
    question: "What is a honk?",
    answer:
      "A honk is a voluntary contribution toward buying a porch-goose outfit from Amazon and putting it on Billie at 905 Bridge. You are not buying the outfit for yourself, and you are not buying a service.",
  },
  {
    question: "Is a honk tax-deductible?",
    answer:
      "chxgoose.com is not a charity or a 501(c)(3). Honks are not tax-deductible. Do not treat a honk as a charitable donation.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "All honks are final. No refunds, returns, or exchanges — including a change of mind, a different outfit winning, Amazon being out of stock, a price change, or Billie wearing something else.",
  },
  {
    question: "What if a payment is reversed?",
    answer: "If a bank or card network reverses a payment, that honk does not count as a vote.",
  },
  {
    question: "Who orders the outfit?",
    answer:
      "The highest pot is what the owner aims to order when they’re ready. Amazon listings, sizes, and stock can change.",
  },
] as const;

export const TERMS_CRUMBS = [
  { name: "Porch", path: "/" },
  { name: "Honks", path: "/terms" },
] as const;

export type Crumb = { name: string; path: string };

export function absoluteUrl(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path}`;
}

export function publicSitemap() {
  return [
    { path: "/", changeFrequency: "daily" as const, priority: 1 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ];
}

export function robotRules() {
  return {
    userAgent: "*",
    allow: "/",
    disallow: ["/api/"],
  };
}

export function outfitAlt(name: string): string {
  return `${name} for Billie the porch goose`;
}

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "chxgoose",
    url: absoluteUrl("/"),
    description: HOME_DESCRIPTION,
    inLanguage: "en",
  };
}

export function termsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: TERMS_CRUMBS.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.path),
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: PORCH_FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export const BACKGROUND_IMAGES = ["/ui/wood.webp", "/ui/plaque.webp", "/ui/paper.webp"] as const;

export function contentImageSrcs(): string[] {
  return Object.keys(SERVED_IMAGES);
}
