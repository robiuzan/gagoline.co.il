---
name: internal-linking
description: Build the link mesh on gagoline — a header that reaches all 8 services and 23 cities in one hop, a footer that stops orphaning 11 city pages, the missing /areas/ hub, service↔city cross-links that don't exist, relevance-based related services, contextual in-copy links, breadcrumbs matched to BreadcrumbList, and the trailing-slash rule. Use when wiring related links, fixing orphans, or auditing navigation. Triggers "internal linking", "orphan pages", "navigation", "related links", "footer links", "mega menu", "breadcrumbs".
---

# Internal linking

Forty-three content pages, and the link graph between them is close to a star: everything hangs off the
homepage and almost nothing connects sideways.

## Current state (backlog §9)

| Gap                              | Detail                                                                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header reaches 8 nav labels      | 8 services and 23 cities are **not** reachable in one hop                                                                                                                                     |
| 11 orphaned city pages           | `Footer.tsx:71` renders `cities.slice(0, 12)` — the remaining 11 have no sitewide inbound link                                                                                                |
| No `/areas/` hub                 | The silo has no root; `navItems` points "אזורי שירות" at `/areas/tel-aviv`                                                                                                                    |
| Service → city: **zero**         | No service page mentions or links to any city                                                                                                                                                 |
| City → city: **zero**            | No "nearby areas" module                                                                                                                                                                      |
| Related services are array order | `app/services/[service]/page.tsx:43` — `.filter(...).slice(0, 4)` always yields the first four, so איטום גגות and זיפות absorb nearly all internal equity while איטום מרתפים gets almost none |
| Contextual links: **zero**       | Every internal link is a card, chip or nav item — no anchor-text diversity at all                                                                                                             |
| Breadcrumbs unmarked             | Visible on every inner page, no `BreadcrumbList` anywhere                                                                                                                                     |
| **Every link 301s**              | `trailingSlash: true`, but the hrefs omit the slash                                                                                                                                           |

## 0. The trailing slash — fix this while you're in each file

`next.config.mjs` sets `trailingSlash: true`, so the canonical URL is `/services/roof-sealing/`. Every
internal `href` in the repo omits it — `Footer.tsx:57,74`, `navItems` in `lib/content.ts:199-208`, the
service and city card links, and every `PageHeader` crumb. Each click therefore costs a 301 round-trip,
and each internal link passes its signal through a redirect.

It is a one-character fix per link and it touches every file below. Do it as part of whatever else
you're changing, not as a separate sweep.

## 1. Header

Add a dropdown (or a two-column mega panel) exposing all 8 services and all 23 cities. Constraints:

- `Header.tsx` is already `"use client"` for the mobile toggle; keep any new state in the same leaf and
  don't push more of the tree client-side.
- Keyboard-operable: `aria-expanded` (already present), plus `aria-controls`, Escape closes, focus
  returns to the trigger. The current mobile menu has only the first — fix that in the same pass rather
  than copying it.
- On mobile, nest the lists inside the existing disclosure rather than adding a second pattern.

## 2. Footer

Render **all 23** cities — delete the `.slice(0, 12)`. If the column gets long, use a two- or
three-column grid; do not truncate. Truncation is what created the orphans.

## 3. The `/areas/` hub

Build it. A real index page at `/areas/` gives the city silo a root, fixes the self-referencing
breadcrumb on all 23 city pages, gives the nav a correct target instead of `/areas/tel-aviv`, and
provides a home for the 250-word coverage copy the standards ask for. It is the highest
structure-per-effort item in this file.

## 4. Service ↔ city cross-links

The single biggest missing edge. On each **service** page, link 4–6 cities. On each **city** page, the
full service list already renders — add 2–4 **nearby cities** driven by a
`nearby?: readonly CitySlug[]` field on `cities`, chosen by real geographic adjacency, not array index.
The edge is bidirectional: if תל אביב lists רמת גן, רמת גן lists תל אביב.

## 5. Relevance-based related services

Replace `slice(0, 4)` with an explicit adjacency map so איטום מרתפים relates to איטום קירות חיצוניים
and איטום ביריעות ביטומניות, not to whatever happens to be first in the array:

```ts
// lib/site-config.ts
const relatedServices: Record<ServiceSlug, readonly ServiceSlug[]> = { … };
```

This is also what stops the flagship pages hoarding internal PageRank.

## 6. Contextual in-copy links

Zero exist today. As `serviceDepth` and `cityContent` land (see `/new-service`, `/new-city`), each
should carry 2–3 links **inside the prose** with descriptive Hebrew anchor text:

- ✅ `<Link href="/services/leak-detection/">איתור מקור הנזילה בבדיקת הצפה</Link>`
- ❌ "לחצו כאן", "למידע נוסף", a bare URL

Anchor text is a ranking signal and the site currently emits only nav labels and card titles.

## 7. Breadcrumbs

`components/layout/PageHeader.tsx:23-38` already renders `<nav aria-label="פירורי לחם">` with an `<ol>`
on every inner page. Feed the **same `crumbs` array** to `breadcrumbJsonLd()` so markup and graph can't
drift — see `/schema-structured-data`. Fix the location-page middle crumb at the same time: it points
at the page itself until `/areas/` exists.

## 8. Hub pages

`/services/` is the homepage's `ServicesGrid` with no prose. Give it an intro that links contextually
into its children (content-standards §1: 250-word floor for index pages). Same for `/areas/` when it
exists.

## Zero-orphan check

```bash
# every emitted route
find out -name index.html | sed 's|^out||; s|index.html$||' | sort > /tmp/routes.txt
# every internally linked href
grep -rho 'href="/[^"]*"' out --include=index.html | sed 's|href="||; s|"$||' | sort -u > /tmp/linked.txt
comm -23 /tmp/routes.txt /tmp/linked.txt
```

Anything printed has no inbound internal link. Target: empty. Currently prints 11 city pages — and note
the comparison is slash-sensitive, which is itself a symptom of §0.

## Checklist

- [ ] All 8 services and 23 cities reachable within one hop of the header.
- [ ] Footer renders all 23 cities — no `slice`.
- [ ] `/areas/` exists and every city-page breadcrumb points at it.
- [ ] Every service page links to 4+ cities; every city page links to 2+ nearby cities.
- [ ] Related services come from an adjacency map, not array order.
- [ ] Every new content block carries 2–3 contextual in-copy links with descriptive anchors.
- [ ] Breadcrumbs render **and** emit `BreadcrumbList` from the same array.
- [ ] Every internal href ends in a slash.
- [ ] The orphan check returns nothing.

## Gotchas

- Adding links to a thin page doesn't fix the thin page. Depth first (`/new-city`), then the mesh.
- Don't link to `/gallery/` or `/blog/` from new modules while they're placeholders — you'd be pushing
  equity into pages that should probably be `noindex` (backlog §7.2, §7.4).
