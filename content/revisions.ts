/**
 * Content revision dates — what `lastModified` in the sitemap actually reports.
 *
 * WHY THIS FILE EXISTS
 *
 * `app/sitemap.ts` used to stamp every URL with `new Date()`. That told a crawler that all fifty
 * pages had changed, on every single deploy, including deploys that only touched a script. A
 * freshness signal that is always "just now" is not a strong signal — it is a discarded one, and it
 * is worth the least in exactly the month it matters most here, when seasonal content is competing
 * to be recrawled before the first rain.
 *
 * The dates below are real: each is the date that section's content last genuinely changed, taken
 * from the commit history. They are STABLE ACROSS DEPLOYS — that is the whole point. Redeploying
 * does not move them; editing the content does.
 *
 * The articles are deliberately absent: they already carry their own `dateModified` in
 * `content/articles`, which is a real editorial fact and takes precedence.
 *
 * MAINTENANCE: when you substantively change a section's copy, move its date in the same commit.
 * A date that lies in the other direction — claiming freshness the content does not have — is worse
 * than the build timestamp it replaced.
 */
export const revisions = {
  /** Fallback for any route not listed below. Also the "site last touched" date. */
  site: "2026-08-31",

  "/": "2026-08-25",
  "/services/": "2026-08-25",
  "/areas/": "2026-08-25",
  "/about/": "2026-08-24",
  "/pricing/": "2026-08-24",
  "/faq/": "2026-08-24",
  "/contact/": "2026-08-25",
  "/gallery/": "2026-08-27",
  "/blog/": "2026-08-25",
  "/privacy/": "2026-08-24",
  "/accessibility/": "2026-08-24",
  "/terms/": "2026-08-24",
} as const;

/**
 * Resolve a route to its revision date, falling back to the nearest ancestor and finally to `site`.
 * `/services/roof-sealing/` inherits `/services/` unless it is listed in its own right.
 */
export function revisionFor(route: string): Date {
  const table: Record<string, string> = revisions;
  const exact = table[route];
  if (exact) return new Date(exact);

  // Walk up: /areas/tel-aviv/ -> /areas/ -> /
  const parts = route.split("/").filter(Boolean);
  for (let i = parts.length - 1; i > 0; i--) {
    const ancestor = `/${parts.slice(0, i).join("/")}/`;
    const hit = table[ancestor];
    if (hit) return new Date(hit);
  }
  return new Date(revisions.site);
}
