---
name: new-city
description: Add or deepen a location page the data-driven way — append to cities in lib/site-config.ts, author genuinely unique per-city content in a cityContent map, and the route, footer, link mesh, schema and sitemap follow automatically. Use when expanding coverage or retrofitting one of the 23 thin city pages. Triggers "add a city", "new location page", "cover <city>", "this city page is thin", "doorway".
---

# Add or deepen a location page

**Read this first: all 23 existing location pages currently fail the doorway test.** They carry ~90
unique words with `${city.name}` interpolated six times into two shared paragraphs, a shared subtitle
and a shared H2 — a find-and-replace regenerates any of them from any other. Until that is fixed,
**retrofitting existing pages outranks adding new ones** (`/local-seo-il` §7).

## The data model

```ts
// lib/site-config.ts
export const cities = [
  { slug: "tel-aviv", name: "תל אביב" },
  { slug: "ramat-gan", name: "רמת גן" },
] as const;
```

- `slug` — the **Latin ASCII** route segment. This site does not use Hebrew slugs; keep the convention.
  For an existing city the slug is live and load-bearing — renaming needs a 301.
- `name` — the Hebrew display name. All 23 entries are real cities, so a bare `ב${name}` is
  grammatical everywhere. If a **region** is ever added (צפון, שרון), it needs `kind` and `prefixed`
  fields first, because "בצפון" is wrong Hebrew for "בצפון הארץ".

```ts
// lib/content.ts — what depth needs
export interface CityContent {
  answer: string;                     // 40–60 words, the AEO block
  intro: string[];                    // 2–3 paragraphs, city-specific
  roofStock: string[];                // the substance — see below
  neighborhoods?: string[];
  travel?: string;                    // realistic scheduling + winter response at this distance
  faqs: { q: string; a: string }[];   // 2–3, city-specific
  nearby: readonly CitySlug[];        // 2–4 adjacent cities
}

export const cityContent: Record<CitySlug, CityContent> = { … };
```

## The doorway test — the gate

> Replace the city name with a different city name. Is the page now correct and publishable for that
> other city? **If yes, it does not ship.**

To pass, the page needs **three or more** true, specific items. For roof work the richest and most
honest seam is **roof stock**, which genuinely differs city to city:

- Bauhaus-era flat concrete roofs in central תל אביב, often carrying decades of bituminous layers.
- 1960s שיכונים with tiled roof decks — the classic "גג מרוצף" job, and the one where lifting tiles
  versus sealing over them is a real decision.
- New towers with membrane systems, where a developer warranty may still be in play.
- Industrial איסכורית in the אזור / חולון belt — different fasteners, different failure mode.
- Red-tile pitched roofs in רעננה, הוד השרון and כפר סבא.

Plus any of: named neighbourhoods or streets; a real local job reference (with permission) or photo;
travel and **winter-emergency** reality at that distance; access constraints (crane, parking, ועד בית);
local pricing reality if it differs; a city-specific FAQ that would read oddly anywhere else.

**If none of those can be said truthfully about a city, that city does not warrant a page.** Record
that in `docs/business-facts.md` §E rather than padding. A page that exists to hold a keyword is the
thing Google's doorway policy names, and the penalty lands on the domain.

## Steps

1. **Check the cap.** `/local-seo-il` §7 — no 24th city while the existing 23 fail.
2. Add the entry to `cities` with `slug` and `name`.
3. Add the `cityContent` entry. Meet the 350-word floor in `docs/content-standards.md` §1 with genuine
   local substance, not longer versions of the shared paragraphs.
4. Set `nearby` from real geography, and add this city to the `nearby` of its neighbours — the edge is
   bidirectional; a one-way link is a modelling error.
5. Update `app/areas/[city]/page.tsx` to render the new blocks: answer block first, then intro, roof
   stock, the service list, nearby cities, city FAQ, CTA.
6. Confirm the metadata follows `docs/keyword-map.md` §3 — `איטום גגות ב{city} | אחריות בכתב + מחיר שקוף`,
   and **no second brand token** (the template appends it).
7. Confirm schema: `Service` + `areaServed` typed `City`, plus `BreadcrumbList`
   (`/schema-structured-data`). **All 23 pages currently emit nothing.**
8. `npm run lint && npm run typecheck && npm run build`.
9. Verify the route exists in `out/` **and** in `out/sitemap.xml`.

## What follows automatically

`generateStaticParams` picks up the route · the footer links it (once the `slice(0, 12)` is gone — see
`/internal-linking`) · `app/sitemap.ts` includes it · `ServiceAreas` adds its chip.

**What does not follow automatically:** there is no `/areas/` index page to list it on, and the
breadcrumb's middle crumb will point at the page itself until one exists (`/local-seo-il` §5).

## Checklist

- [ ] Existing 23 pass the doorway test, or this is a retrofit of one of them.
- [ ] Slug is Latin ASCII and matches the existing convention.
- [ ] ≥350 unique words; three or more genuinely local items.
- [ ] Passes the doorway substitution test.
- [ ] Opens with a 40–60 word answer block.
- [ ] `nearby` set on both sides.
- [ ] Title has the brand exactly once; canonical has both slashes.
- [ ] Internal links carry the trailing slash.
- [ ] `Service` + `areaServed` + `BreadcrumbList` emitted.
- [ ] Present in `out/` and `out/sitemap.xml`.

## Gotchas

- Never invent a neighbourhood, a landmark, a local job, or a response time. Unverified →
  `// 🔶 confirm` + `docs/business-facts.md` — and **never render the 🔶**.
- Never rename an existing live slug without a 301 plan at the host or the edge.
- Confirm the far cities (נתניה, רחובות) are genuinely served on the same terms before writing copy
  that promises they are — business-facts §E.
