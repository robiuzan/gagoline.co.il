import type { MetadataRoute } from "next";
import { siteConfig, services, cities } from "@/lib/site-config";
import { articles } from "@/content/articles";

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

  /**
   * ⚠️ Hand-maintained (backlog §1.3) — a new route is silently absent from the sitemap unless it
   * is added here. Replace with a typed route registry that the routes themselves reference.
   *
   * `reviews`, `gallery` and `blog` were removed 2026-08-17: all three are `noindex` until they
   * hold real content, and a noindexed URL must not be advertised in the sitemap. Re-add each one
   * in the same commit that removes its `robots` block.
   *
   * `blog` came back on 2026-08-24, in the same commit that removed its `robots` block and shipped
   * seven articles — exactly the trade described above. `reviews` and `gallery` are still out, and
   * still noindexed, because neither has real content yet (docs/business-facts.md §A).
   */
  const staticPaths = [
    "",
    "services",
    "areas",
    "about",
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

  /**
   * Articles carry their OWN dateModified rather than the build timestamp. Everything else here is
   * stamped `now`, which tells a crawler nothing — an article's lastmod is a real editorial fact
   * and worth being accurate about.
   */
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: url(`blog/${a.slug}`),
    lastModified: new Date(a.dateModified),
  }));

  return [...staticEntries, ...serviceEntries, ...cityEntries, ...articleEntries];
}
