---
name: new-service
description: Add or deepen a service page the data-driven way — append to services in lib/site-config.ts, add the serviceMeta entry plus per-service depth blocks and FAQs in lib/content.ts, so the route, the services grid, cross-links, schema and the sitemap update automatically. Use when adding a service or retrofitting one of the 8 thin service pages. Triggers "add a service", "new service page", "deepen the service copy", "per-service FAQ", "service page is thin".
---

# Add or deepen a service page

**All 8 existing service pages carry ~80 unique words** — one `serviceMeta.description` plus two blocks
shared verbatim with every other service page. The unique text on a service page is currently **one
paragraph**. Deepening the eight that exist matters far more than adding a ninth.

Worse, `app/services/[service]/page.tsx:32-37` hardcodes the four "מתי כדאי לפנות אלינו" bullets —
כתמי רטיבות בתקרה, עובש, קילופי צבע, מים שמחלחלים בחורף — so **ceiling-damp advice appears on the
איטום מרתפים page and on the סיוד והלבנת גגות page**. That is the first thing to fix.

## The data model

```ts
// lib/site-config.ts
export const services = [{ slug: "roof-sealing", name: "איטום גגות" }] as const;
```

Slugs are **Latin ASCII**; keep the convention. Array order drives the grid order and, currently, the
related-services `slice`.

```ts
// lib/content.ts — existing
const serviceMeta: Record<ServiceSlug, { tagline: string; description: string; icon: IconName }>

// lib/content.ts — what depth needs
export interface ServiceDepth {
  answer: string;                    // 40–60 words, the AEO block
  intro: string[];                   // 2–3 paragraphs
  whenToCall: string[];              // ⚠️ PER SERVICE — replaces the hardcoded shared bullets
  included: string[];
  excluded?: string[];
  substrates: string;                // which roof types this suits, and which it doesn't
  materials: string;                 // what is actually applied, and how the prep differs
  duration: string;
  weather?: string;                  // the seasonal constraint — real for this trade
  aftercare?: string;
  faqs: { q: string; a: string }[];  // 3–5, service-specific → FAQPage
}

export const serviceDepth: Record<ServiceSlug, ServiceDepth> = { … };
```

`icon` must be one of the `IconName` union members — the map in `ServicesGrid` is keyed by it, and
`noUncheckedIndexedAccess` will surface a miss at compile time.

## The depth bar

450 unique words (`docs/content-standards.md` §1), and the doorway test applies here too: **swap the
service name — does the page still read correctly?** If yes, it isn't a service page, it's a template.

What actually creates depth for roof waterproofing, and what a competitor's page usually lacks:

- **Substrate and method fit** — what this method does on בטון vs. מרוצף vs. רעפים vs. איסכורית, and
  where it is the wrong choice. This is the single most differentiating axis available.
- **Surface prep** — the part that determines whether the job lasts, and the part competitors skip.
- **What's included and excluded** — the most-asked pre-purchase question.
- **Weather and season** — you cannot seal a wet roof. Say what the window is and what happens to a
  winter emergency call.
- **Failure modes** — ponding, thermal movement, UV degradation, foot traffic, failed joints; what each
  looks like from inside the flat, and what the fix costs.
- **Who this isn't for** — when sealing is a patch and the roof actually needs rebuilding.
  Counter-intuitive honesty is disproportionately citable and disproportionately trusted, and it is
  exactly the brand's diagnosis-first positioning made concrete.

## Steps

1. Add the entry to `services` (new service) — flagship-first ordering matters.
2. Add the `serviceMeta` entry: `tagline`, `description`, `icon`.
3. Add the `serviceDepth` entry. **`whenToCall` must be specific to this service** — that is the fix
   for the shared-bullets bug.
4. Add 3–5 service-specific `faqs`. These become a `FAQPage` on the page (see
   `/schema-structured-data`) — 8 more schema-eligible routes.
5. Update `app/services/[service]/page.tsx` to render from `serviceDepth` instead of the hardcoded
   `triggers` array. Order: answer block → intro → substrates and materials → what's included → when to
   call → process → price (interpolated from `priceRows`, never restated) → FAQ → related services →
   related cities → CTA.
6. Add relevance-based related services and 4–6 city links (`/internal-linking` §4–§5) — the current
   `.slice(0, 4)` hands all internal equity to whatever is first in the array.
7. Metadata per `docs/keyword-map.md` §3 — `{service} בתל אביב והמרכז`, **no second brand token**.
8. Confirm `Service` + `BreadcrumbList` + `FAQPage` schema.
9. `npm run lint && npm run typecheck && npm run build`, then verify the route in `out/` and in
   `out/sitemap.xml`.

## What follows automatically

`generateStaticParams` · `ServicesGrid` on `/` and `/services/` · the footer service column · the
`LeadForm` service `<select>` · `app/sitemap.ts`.

## Checklist

- [ ] `serviceMeta` complete with a valid `IconName`.
- [ ] `serviceDepth` present, ≥450 unique words.
- [ ] `whenToCall` is specific to this service — no shared bullets.
- [ ] 3–5 service-specific FAQs, all rendered on the page.
- [ ] Opens with a 40–60 word answer block.
- [ ] Price interpolates from `priceRows`.
- [ ] Passes the service-name substitution test.
- [ ] `Service` + `BreadcrumbList` + `FAQPage` emitted.
- [ ] Present in `out/` and `out/sitemap.xml`.

## Gotchas

- A new service means a new `priceRows` row, or the pricing page silently omits it — and every value in
  `priceRows` is currently 🔶 (business-facts §D), so a new row starts unconfirmed too.
- Never invent materials, durations, warranty terms, coverage or prices. Unverified → `// 🔶 confirm` +
  `docs/business-facts.md`, and **never render the marker**.
- Eight services with genuine depth beat twelve that paraphrase each other. איטום גגות, זיפות גגות and
  איטום ביריעות ביטומניות already overlap heavily in a reader's mind — they need differentiating on
  substrate and method, not company.
