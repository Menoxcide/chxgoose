import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { SERVED_IMAGES } from "./images";
import { OUTFIT_META } from "./outfits";
import { PORCH_LOOKS } from "./looks";
import { hostRedirects } from "./redirects";
import {
  BACKGROUND_IMAGES,
  KEEPER_BIO,
  PORCH_FAQ,
  SITE_URL,
  absoluteUrl,
  publicSitemap,
  robotRules,
  termsJsonLd,
} from "./seo";

describe("search files", () => {
  it("lets crawlers read the porch and skips API routes", () => {
    const rules = robotRules();
    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toEqual(["/api/"]);
  });

  it("lists only the public pages", () => {
    const paths = publicSitemap().map((page) => page.path);
    expect(paths).toEqual(["/", "/terms"]);
  });

  it("sends duplicate hosts to the apex in one permanent hop", () => {
    const redirects = hostRedirects();
    expect(redirects.every((rule) => rule.permanent)).toBe(true);
    expect(redirects.map((rule) => rule.has[0]?.value)).toEqual([
      "www.chxgoose.com",
      "chxgoose.vercel.app",
    ]);
    expect(redirects.every((rule) => rule.destination.startsWith("https://chxgoose.com/"))).toBe(true);
  });
});

describe("policy and keeper copy", () => {
  it("keeps the honk rules in the visible FAQ", () => {
    const text = PORCH_FAQ.map((item) => `${item.question} ${item.answer}`).join("\n");
    expect(new Set(PORCH_FAQ.map((item) => item.question)).size).toBe(PORCH_FAQ.length);
    expect(text).toMatch(/not tax-deductible/i);
    expect(text).toMatch(/no refunds/i);
    expect(text).toMatch(/501\(c\)\(3\)/);
    expect(text).toMatch(/does not count as a vote/);
    expect(text).not.toMatch(/gmail/i);
  });

  it("describes the person at 905 Bridge without inventing a town or a persona", () => {
    expect(KEEPER_BIO).toMatch(/905 Bridge/);
    expect(KEEPER_BIO).toMatch(/plastic porch goose/i);
    expect(KEEPER_BIO).not.toMatch(/gmail|charlevoix|passionate|nestled|delve|elevate|tapestry/i);
  });

  it("matches FAQ schema to the visible answers", () => {
    const ld = termsJsonLd();
    const faq = ld["@graph"].find((node) => node["@type"] === "FAQPage");
    const crumbs = ld["@graph"].find((node) => node["@type"] === "BreadcrumbList");
    if (!faq || faq["@type"] !== "FAQPage" || !faq.mainEntity) throw new Error("missing FAQ schema");
    if (!crumbs || crumbs["@type"] !== "BreadcrumbList" || !crumbs.itemListElement) {
      throw new Error("missing breadcrumb schema");
    }
    expect(faq.mainEntity.map((item) => item.name)).toEqual(PORCH_FAQ.map((item) => item.question));
    expect(faq.mainEntity.map((item) => item.acceptedAnswer.text)).toEqual(
      PORCH_FAQ.map((item) => item.answer),
    );
    expect(crumbs.itemListElement.map((item) => item.item)).toEqual([SITE_URL, absoluteUrl("/terms")]);
  });
});

describe("served images", () => {
  it("matches each webp to the size reserved on the page", async () => {
    for (const [src, size] of Object.entries(SERVED_IMAGES)) {
      const file = join(process.cwd(), "public", src);
      const meta = await sharp(file).metadata();
      expect(meta.format).toBe("webp");
      expect(meta.width).toBe(size.width);
      expect(meta.height).toBe(size.height);
    }
  });

  it("points outfits, past looks, and textures at those files", () => {
    for (const meta of Object.values(OUTFIT_META)) {
      expect(meta.image.endsWith(".webp")).toBe(true);
      expect(SERVED_IMAGES[meta.image as keyof typeof SERVED_IMAGES]).toBeTruthy();
    }
    for (const look of PORCH_LOOKS) {
      expect(look.src.endsWith(".webp")).toBe(true);
      expect(look.alt.length).toBeGreaterThan(look.label.length);
      expect(look.width).toBeGreaterThan(0);
      expect(look.height).toBeGreaterThan(0);
    }
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    for (const src of BACKGROUND_IMAGES) {
      expect(css).toContain(src);
    }
    expect(css).not.toContain("/ui/wood.jpg");
    expect(css).not.toContain("/ui/plaque.jpg");
    expect(css).not.toContain("/ui/paper.jpg");
  });
});
