---
name: local-seo-il
description: Israeli local-SEO doctrine for גגוליין — the no-address service-area-business decision, NAP consistency across site, schema and Google עסק שלי, the 8-service × 23-city matrix and its expansion cap, the missing /areas/ hub, the 11 orphaned city pages, geo signals, and the non-negotiable doorway-page policy. Use when populating cities or services for local ranking, or auditing local visibility. Triggers "local SEO", "NAP", "city pages", "Google עסק שלי", "doorway pages", "areaServed", "add a city".
---

# Local SEO — Israel

One operation, **no published address**, 23 city pages. Everything below follows from that asymmetry.

## 1. The address decision — settle this first

`site.config.json` → `schema.address` carries only `{ addressRegion: "מרכז", addressCountry: "IL" }`.
There is no street address anywhere on the site, including `/contact/`.

That is a legitimate model — a **service-area business** — but it is currently an omission rather than
a decision, and everything else depends on which it is:

| If it's a service-area business                        | If there's a real address to publish          |
| ------------------------------------------------------ | --------------------------------------------- |
| GBP set up with a hidden address + service areas       | GBP with a visible address, eligible for maps |
| No `geo` / `hasMap`; that's correct, not a gap         | `geo`, `hasMap`, a map embed on `/contact/`   |
| `PostalAddress` stays region-only — say so in the docs | Complete `PostalAddress` in the roster        |

Record the answer in `docs/business-facts.md` §E. Until then, **do not invent an address** to satisfy a
schema validator, and do not report the missing one as a simple bug.

## 2. NAP consistency

Name and phone must be **byte-identical** everywhere they appear: the site, the JSON-LD, and the Google
Business Profile.

Current state is genuinely good: `telHref` and `siteConfig.phone` are manifest-driven and used
everywhere, and the email renders through `EmailAddress` (which also survives Cloudflare's Scrape
Shield rewrite). There is no hardcoded phone or email literal anywhere in `app/` or `components/`.
The "A" of NAP is the open question — see §1.

## 3. Google עסק שלי — the top lever

`schema.sameAs` is `[]` and `siteConfig.social` is three empty strings. **There is no GBP link anywhere
on the site.** For a local trade business the Business Profile outranks almost everything else you can
do on-page: it drives the map pack, it is where reviews live, and it is the entity anchor that makes
`sameAs` meaningful.

It matters more here than on a site with an address, because with no address and no `sameAs`, **nothing
outside this website corroborates that this business exists.**

This is a `docs/business-facts.md` §C blocker, not a code task. Escalate it rather than working around
it. Once supplied: URLs go in the **roster manifest** `schema.sameAs`, then sync, and
`siteConfig.social` should read from `manifest.schema.sameAs` instead of holding its own empty literals.

## 4. Hebrew grammar per city

All 23 entries are real cities, so the bare `ב{name}` interpolation used throughout is grammatical —
בתל אביב, ברמת גן, בפתח תקווה. No `kind` / `prefixed` modelling is needed here, unlike the fleet sites
that carry regions (צפון, שרון) in the same array. If a region is ever added, it needs both fields
before it renders.

## 5. The missing hub

There is **no `/areas/` index route**. Consequences:

- `navItems` in `lib/content.ts:201` points "אזורי שירות" at `/areas/tel-aviv` — one city standing in
  for the silo.
- Every location page's middle breadcrumb links to `/areas/{that same city}` — a self-reference.
- The 23 city pages have no hub to distribute equity from, and no natural place for the
  250-word index-page content the standards call for.

Building `/areas/` is a small page with outsized structural value: a real hub, a correct breadcrumb
trail, a nav target, and a home for coverage copy.

## 6. The doorway policy — non-negotiable

> Replace the city name with another city name. Is the page now correct and publishable for that other
> city? If yes, it is a doorway page.

All 23 currently fail: ~90 unique words, `${city.name}` interpolated six times into two shared
paragraphs, a shared subtitle and a shared H2. This is the highest-risk item on the site — doorway
clusters are an explicit Google spam policy, and the penalty lands on the domain, not the page.

To pass, a location page needs **three or more** true, specific items. For this trade the richest seam
is **roof stock**, which is genuinely different city to city:

- Bauhaus-era flat concrete roofs in central תל אביב, often with older bituminous layers.
- 1960s שיכונים with tiled roof decks — the classic "מרוצף" job.
- New towers with membrane systems and warranty interactions.
- Industrial איסכורית in the אזור / חולון / הולון belt.
- Red-tile pitched roofs in רעננה, הוד השרון, כפר סבא.

Plus: named neighbourhoods, a real local job reference, travel and winter-response reality at that
distance, access constraints (crane, parking, ועד בית), and a city-specific FAQ. Full spec:
`docs/content-standards.md` §2–§3.

**If none of those can be said truthfully about a city, that city does not warrant a page.**

## 7. The expansion cap

8 services × 23 cities = 184 possible cells. **Do not build them.** Order of operations:

1. All 23 existing location pages pass the doorway test.
2. Each earns its depth per content-standards §3.
3. Only then consider a service × city second tier, and only for services with genuine local demand —
   איטום גגות, זיפות גגות, איתור נזילות. Not איטום מרתפים × 23.

No 24th city until step 1 is done. Scaling a doorway pattern multiplies risk, not reach.

## 8. Coverage honesty

`schema.areaServed` says "תל אביב והמרכז — עד רדיוס 50 ק״מ" while the city list reaches נתניה and
רחובות. Confirm the far cities are served on the same terms — same response time, same winter
emergency, no distance surcharge — via `docs/business-facts.md` §E. An `areaServed` the business can't
service produces leads it can't serve and a claim it can't defend.

## 9. Geo signals

Missing entirely: `GeoCoordinates`, `hasMap`, any map embed on `/contact/`, and any neighbourhood or
landmark reference in the copy. The first two depend on §1; the third does not, and is free.

## 10. Internal equity

`Footer.tsx:71` renders `cities.slice(0, 12)` — **11 of 23 city pages have no sitewide inbound link.**
No service page links to any city; no city links to a neighbour. See `/internal-linking`.

## Checklist

- [ ] The address model is decided and recorded, not left ambiguous.
- [ ] NAP renders from the manifest — no literals.
- [ ] Every city page passes the doorway test.
- [ ] City pages emit `Service` + `areaServed` typed `City`.
- [ ] `sameAs` populated, or a 🔶 row exists in `docs/business-facts.md`.
- [ ] All 23 cities are linked from the footer.
- [ ] `/areas/` exists as a real hub.

## Gotchas

- **Never** a business node per city. One operation, one node.
- Route slugs are Latin ASCII and live. Switching to Hebrew slugs for keyword-in-URL value needs a full
  301 map and trades a real signal for a marginal one.
- Never invent a review, rating, neighbourhood or coverage claim to fill a local-SEO checkbox — and
  never mark up the placeholder testimonials that are already on the page.
