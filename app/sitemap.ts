import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { siteConfig, services, cities } from "@/lib/site-config";
import { articles } from "@/content/articles";
import { revisionFor } from "@/content/revisions";

/**
 * /sitemap.xml, derived from the route tree rather than from a hand-kept list (backlog §1.3).
 *
 * WHAT CHANGED AND WHY IT MATTERS
 *
 * This file used to carry `staticPaths`, a hand-maintained array of twelve. Adding a route and
 * forgetting to edit that array left the route silently absent from the sitemap — a failure with no
 * symptom, which is how `/blog/` shipped unlisted once already.
 *
 * Static routes are now DISCOVERED from `app/`, and only the deliberate exclusions are listed. That
 * inverts the failure mode, which is the actual improvement: forget to exclude something and it
 * shows up in the sitemap, where `seo-assert`'s "no noindexed route is advertised" check fails the
 * build. Forgetting is now loud instead of silent.
 *
 * Dynamic segments (`[service]`, `[city]`, `[slug]`) cannot be read off the filesystem, so they are
 * still expanded from the data arrays that generate them — which is the same source
 * `generateStaticParams` uses, so the two cannot drift.
 */

/**
 * Routes that exist, are reachable, and must NEVER be advertised.
 *
 * Every entry here is `noindex`, and the pairing is enforced from both directions by `seo-assert`:
 * a noindexed route in the sitemap fails, and an indexable route missing from it fails. Removing a
 * `robots` block without removing the line here therefore breaks the build rather than quietly
 * publishing nothing — which is the trap `/blog/` fell into in the opposite direction.
 *
 *   /reviews/    — noindex until real reviews exist (docs/business-facts.md §A)
 *   /thank-you/  — noindex permanently; indexing it would let organic arrivals inflate the
 *                  conversion count it exists to measure
 */
const EXCLUDED = new Set(["/reviews/", "/thank-you/"]);

/** Next's own reserved files and conventions — never routes in their own right. */
const IGNORED_DIRS = new Set(["api"]);

/**
 * Walk `app/` for directories containing a `page.tsx`, skipping dynamic segments and route groups.
 * Returns routes in `/with/trailing/slash/` form, matching `trailingSlash: true` and the canonicals.
 */
function discoverStaticRoutes(dir: string, prefix = "/", acc: string[] = []): string[] {
  if (fs.existsSync(path.join(dir, "page.tsx"))) acc.push(prefix);

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    // `[slug]` is expanded from data below; `(group)` and `_private` are not URL segments.
    if (name.startsWith("[") || name.startsWith("(") || name.startsWith("_")) continue;
    if (IGNORED_DIRS.has(name)) continue;
    discoverStaticRoutes(path.join(dir, name), `${prefix}${name}/`, acc);
  }
  return acc;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.domain;
  const url = (route: string) => `${base}${route}`;

  const staticRoutes = discoverStaticRoutes("app").filter((r) => !EXCLUDED.has(r));

  const dynamicRoutes = [
    ...services.map((s) => `/services/${s.slug}/`),
    ...cities.map((c) => `/areas/${c.slug}/`),
  ].filter((r) => !EXCLUDED.has(r));

  const entries: MetadataRoute.Sitemap = [...staticRoutes, ...dynamicRoutes].map(
    (route) => ({
      url: url(route),
      lastModified: revisionFor(route),
    }),
  );

  /**
   * Articles carry their OWN dateModified rather than a section date. Everything above inherits
   * from `content/revisions.ts`; an article's lastmod is a real editorial fact and is more precise
   * than the section it sits in.
   */
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: url(`/blog/${a.slug}/`),
    lastModified: new Date(a.dateModified),
  }));

  return [...entries, ...articleEntries];
}
