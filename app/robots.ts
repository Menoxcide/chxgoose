import type { MetadataRoute } from "next";
import { SITE_URL, robotRules } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const rules = robotRules();
  return {
    rules: {
      userAgent: rules.userAgent,
      allow: rules.allow,
      disallow: [...rules.disallow],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
