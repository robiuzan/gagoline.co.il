import type { MetadataRoute } from "next";
import { siteConfig, services, cities } from "@/lib/site-config";

/**
 * Generates /sitemap.xml from the static routes + the service and city matrices
 * (brief Part H). Extend `staticPaths` when new top-level pages are added.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.domain;
  const now = new Date();

  const staticPaths = [
    "",
    "services",
    "about",
    "reviews",
    "gallery",
    "pricing",
    "faq",
    "contact",
    "blog",
    "privacy",
    "accessibility",
    "terms",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path ? `${base}/${path}` : base,
    lastModified: now,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
  }));

  const cityEntries: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${base}/areas/${c.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...serviceEntries, ...cityEntries];
}
