---
name: seo-metadata
description: Per-route metadata for gagoline — the Hebrew title and description formulas, the layout template rule that stops the doubled brand suffix on /about/, self-referencing trailing-slash canonicals, OG/Twitter, Search Console verification, and deriving sitemap.ts from the data arrays instead of a hand-maintained list. Use when writing generateMetadata for a route, fixing duplicate or doubled titles, or auditing on-page SEO. Triggers "set the metadata", "titles and descriptions", "canonical", "double brand suffix", "sitemap", "one H1".
---

# Per-route SEO metadata

Formulas live in `docs/keyword-map.md` §3–§5. This skill is the mechanics.

## The template rule

`app/layout.tsx:31-34` sets:

```ts
title: {
  default: `${siteConfig.name} — איטום גגות בתל אביב והמרכז`,
  template: `%s | ${siteConfig.name}`,
}
```

The template **already appends the brand**. So a page writes the bare subject:

```ts
// ✅ correct — renders "אודות | גגוליין"
export const metadata = { title: "אודות" };

// ❌ the live bug — renders "אודות גגוליין | גגוליין"
export const metadata = { title: "אודות גגוליין" };
```

The second form is what `app/about/page.tsx:10` does today, and it is the **only** page on the site with
a doubled brand (backlog §2.1). Every other route is already correct — copy them.

If a page ever needs the brand suppressed entirely, use `title: { absolute: "…" }`. Don't add a second
brand token to work around the template.

## Titles

| Route    | What you write                                  |
| -------- | ----------------------------------------------- |
| Service  | `{service} בתל אביב והמרכז`                     |
| Location | `איטום גגות ב{city} \| אחריות בכתב + מחיר שקוף` |
| Static   | the page name — `מחירון איטום גגות`, `צור קשר`  |
| Article  | the question verbatim                           |

The location formula is the one `CLAUDE.md` §6 prescribes, and it is correct: the brand is appended
once by the template, producing `איטום גגות בתל אביב | אחריות בכתב + מחיר שקוף | גגוליין`. Keep the
**rendered** title under ~60 characters — the longest city names (`רמת השרון`, `ראשון לציון`) sit right
at the edge, which is acceptable.

## Descriptions

150–160 chars, unique per route, following keyword-map §5: service + place, one **true**
differentiator, then an action with the phone.

The 23 location descriptions are generated from one template string and differ only by city name. Not
duplicate, but thin — they improve for free when the city pages get real local content
(`/new-city`).

Only claim what `docs/business-facts.md` confirms. **"מאז 2014" is free** — the manifest carries
`foundedYear: 2014`. Warranty duration, every price, and any rating are 🔶.

## Canonicals

Every route sets its own. There is no inheritance — the root `alternates.canonical: "/"` is the
homepage's own canonical, and the comment above it records a prior fleet regression (skyshade) where a
root canonical with no per-page overrides made all 33 pages claim to be the homepage.

```ts
alternates: {
  canonical: `/services/${card.slug}/`;
} // leading + trailing slash
```

All 44 routes currently have a correct self-referencing canonical. That is a **passing check to
protect**, not a task.

Slugs are ASCII here, so unlike the Hebrew-slug fleet sites there is no percent-escaping to reconcile
between the canonical and the sitemap `<loc>`.

## Sitemap

`app/sitemap.ts` builds the service and city entries from the data arrays automatically, but
`staticPaths` at line 19 is a **hand-maintained array of 12** (backlog §1.3) — add a page and it is
silently missing from the sitemap. Derive it from the `app/` tree or from one exported `staticRoutes`
const that the routes themselves reference.

`lastModified: new Date()` (line 10, §1.4) stamps build time on all 43 URLs, so every URL looks freshly
changed on every deploy and the signal is worthless. Use a real per-route date — a `CONTENT_REVISION`
const in `lib/content.ts` is the pattern the fleet uses.

Never hand-maintain a second URL list anywhere.

## Robots

`app/robots.ts` emits a blanket allow plus the sitemap. **Be aware it may not be what serves** —
Cloudflare proxies this zone and can prepend a managed block at the edge. Verify with
`curl -sS https://gagoline.co.il/robots.txt` before concluding anything. See `/aeo-answer-content`.

## Verification and OG

- Search Console: the token is emitted, but **hardcoded** at `app/layout.tsx:38` instead of read from
  `manifest.analytics.googleSiteVerification` (backlog §2.7). Wire it to the manifest.
- OG images come from `ogImageMeta(manifest.images)`. Twitter tags are derived by Next from OG.
- `brand.themeColor` exists in the manifest and is never read — worth wiring.

## One H1 per page

Exactly one `<h1>`, matching the title's intent — currently true on all 44 routes. Everything else
`<h2>`/`<h3>`, no skipped levels. `/faq/` currently jumps from the `PageHeader` `<h1>` to the
accordion's `<h3>`s with no `<h2>` (backlog §2.4); a `SectionHeading` fixes it, as on the homepage.

## Checklist

- [ ] Title is the bare subject — the brand appears exactly once in the rendered output.
- [ ] Description is unique, 150–160 chars, and claims nothing 🔶.
- [ ] `alternates.canonical` set, with both slashes.
- [ ] The route is reachable from `app/sitemap.ts` without editing an array by hand.
- [ ] Exactly one `<h1>`; heading order unbroken.
- [ ] `npm run build`, then `grep '<title>' out/**/index.html` and confirm no brand appears twice.

## Gotchas

- Forgetting the trailing slash in `canonical` splits signals against the exported directory URL.
- Don't set `metadataBase` per page — it's set once in `app/layout.tsx`.
- `/gallery/` and `/blog/` are indexed placeholder pages. Metadata can't fix that; `noindex` or removal
  can (backlog §7.2, §7.4).
