import type { MetadataRoute } from "next";
import { absoluteUrl, publicSitemap } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSitemap().map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
