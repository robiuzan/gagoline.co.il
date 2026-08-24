/**
 * `Article` JSON-LD.
 *
 * Lives here rather than in `@ishub/site-kit/seo` because the kit is VENDORED into this repo, and
 * editing vendored output is forbidden. Promote it to the kit the next time the hub tarball is
 * rebuilt — the shape is deliberately kit-compatible (same `SiteManifest`, same `prune`/`abs`
 * conventions, same `JsonLd` return type).
 *
 * THE AUTHOR DECISION. docs/schema-graph.md §6 and the `new-article` skill both ask for a `Person`
 * author with a real name. No person is named anywhere on this site — docs/business-facts.md §B is
 * empty — and the skill is explicit that inventing a byline is worse than having none. So authorship
 * ships as the ORGANISATION, pointing at the same `#business` node every page already carries. That
 * is a true statement (the business did write these), it is valid schema.org, and it costs the
 * E-E-A-T lift a named expert would give.
 *
 * Swap `author` to a Person node the day §B is answered. Do not fabricate one to get the lift.
 */
import type { SiteManifest } from "@ishub/site-kit/types";
import type { JsonLd } from "@ishub/site-kit/seo";

const abs = (m: SiteManifest, path: string): string =>
  /^https?:\/\//.test(path)
    ? path
    : `${m.url}${path.startsWith("/") ? path : `/${path}`}`;

export interface ArticleJsonLdOpts {
  slug: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}

export function articleJsonLd(m: SiteManifest, o: ArticleJsonLdOpts): JsonLd {
  const url = abs(m, `/blog/${o.slug}/`);
  const node: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: o.headline,
    description: o.description,
    datePublished: o.datePublished,
    dateModified: o.dateModified,
    inLanguage: "he-IL",
    // Both point at the business node in app/layout.tsx. See the author note above.
    author: { "@id": `${m.url}/#business` },
    publisher: { "@id": `${m.url}/#business` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  if (o.image) node.image = abs(m, o.image);
  return node;
}
