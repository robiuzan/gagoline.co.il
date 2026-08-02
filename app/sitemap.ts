import type { MetadataRoute } from "next";
import { siteConfig, services, cities } from "@/lib/site-config";

/**
 * Generates /sitemap.xml from the static routes + the service and city matrices
 * (brief Part H). Extend `staticPaths` when new top-level pages are added.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.domain;
  const now = new Date();

  /**
   * `trailingSlash: true` in next.config.mjs means the host serves `/about/` and
   * 301-redirects `/about`. A sitemap must list final destinations, so every URL
   * here ends with a slash — matching the per-page `alternates.canonical` values.
   */
  const url = (path: string) => (path ? `${base}/${path}/` : `${base}/`);

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
    url: url(path),
    lastModified: now,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: url(`services/${s.slug}`),
    lastModified: now,
  }));

  const cityEntries: MetadataRoute.Sitemap = cities.map((c) => ({
    url: url(`areas/${c.slug}`),
    lastModified: now,
  }));

  return [...staticEntries, ...serviceEntries, ...cityEntries];
}
