---
name: schema-structured-data
description: Emit the JSON-LD graph with the @ishub/site-kit/seo builders — RoofingContractor from the manifest, Service per service and location page, BreadcrumbList on all 43 nested routes via breadcrumbJsonLd in PageHeader, FAQPage matched to visible FAQs, Offer on the pricing page, and Review/AggregateRating only when genuinely sourced. Use when wiring or auditing structured data, or before a Rich Results Test. Triggers "add schema", "JSON-LD", "BreadcrumbList", "structured data", "rich results", "Offer".
---

# Structured data

Target graph: `docs/schema-graph.md`. This skill is how to emit it.

**Where the site stands: 45 of 45 pages carry JSON-LD** (2026-08-24; it was 2 of 44). The business
node lives in `app/layout.tsx`, `PageHeader` emits the breadcrumb from its own `crumbs` array, and
the 8 service + 23 city pages carry `Service` nodes. Remaining: `OfferCatalog` (blocked on prices)
and the page-type nodes.

## The builders

```ts
import {
  localBusinessJsonLd,
  serviceJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
} from "@ishub/site-kit/seo";
```

Never hand-assemble a node the builders cover, and never hardcode a value the manifest already carries.
`jsonLdScript(data)` produces the `<script type="application/ld+json">` payload.

`app/faq/page.tsx:15-23` hand-assembles its `FAQPage` object instead of calling `faqJsonLd`. It is
valid, but it bypasses the shared shape and will drift from the rest of the fleet — migrate it when
you're in the file.

## The biggest gap: BreadcrumbList

**All 43 nested pages emit one since 2026-08-24.** Previously zero, while `components/layout/PageHeader.tsx:23-38` renders a visible
breadcrumb `<ol>` on every inner page and `breadcrumbJsonLd()` sits unused in the kit. The fix is to
feed the builder **the same `crumbs` array the component already receives**, so the markup and the
graph cannot drift:

```tsx
const crumbs = [
  { label: "בית", href: "/" },
  { label: "השירותים שלנו", href: "/services/" },
  { label: card.name },
];

<PageHeader crumbs={crumbs} title={card.name} />
<script {...jsonLdScript(breadcrumbJsonLd(manifest, crumbs))} />
```

Emit it **from `PageHeader` itself** and every page using that component gets it automatically. Target:
**43 pages** — every route except `/` (the root) and `/404`.

Two things to fix in the same pass:

- The crumb `href`s omit the trailing slash while `trailingSlash: true`, so each one 301s.
- On location pages the middle crumb points at `/areas/{city}` — **the page itself**. There is no
  `/areas/` index route. Either build the hub (`/local-seo-il` §5) or drop the middle crumb; a
  self-referencing breadcrumb is wrong in the markup before it is wrong in the graph.

## Per route type

| Route               | Emit                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `/`                 | `RoofingContractor` + `WebSite` + `FAQPage` (six FAQs are visible there) |
| `/services/{slug}/` | `Service` + `BreadcrumbList` (+ `FAQPage` once per-service FAQs exist)   |
| `/areas/{city}/`    | `Service` with `areaServed` + `BreadcrumbList` — **all 23 emit nothing** |
| `/services/`        | `CollectionPage` + `BreadcrumbList`                                      |
| `/pricing/`         | `OfferCatalog` from `priceRows` + `BreadcrumbList` — ⏸ prices are 🔶     |
| `/about/`           | `AboutPage` + `Person[]` + `BreadcrumbList`                              |
| `/contact/`         | `ContactPage` + `BreadcrumbList`                                         |
| `/faq/`             | `FAQPage` + `BreadcrumbList`                                             |
| `/blog/{slug}/`     | `Article` + `BreadcrumbList` + `FAQPage`                                 |

## Location pages

```ts
serviceJsonLd(manifest, {
  name: `איטום גגות ב${city.name}`,
  serviceType: "איטום גגות",
  areaServed: { "@type": "City", name: city.name },
});
```

All 23 entries in `cities` are genuine cities, so `City` is correct for every one — this site has no
region-vs-city modelling problem.

**Never emit a business node per location.** One operation means one node. Twenty-three
`RoofingContractor` nodes imply twenty-three premises that don't exist and is a recognised local-spam
pattern — and this business publishes no address at all, which makes the claim worse, not safer.

## The gating rules — correctness, not preference

1. **`Review` / `AggregateRating` ship only with a verifiable public source.** Correctly absent from the
   graph today. **But the visible testimonials on `/` and `/reviews/` are placeholders**
   (`lib/content.ts:141-160`, authored `"לקוח/ה — להחלפה 🔶"`). Marking those up would convert a content
   defect into a Google policy violation. Do not seed sample data "to test the markup" — test with the
   real thing or not at all. Blocked on `docs/business-facts.md` §A/§C.
2. **Schema must match visible content.** A `FAQPage` question not rendered on the page is a violation.
   `Offer` prices must equal the visible `priceRows`. Never mark up hidden content.
3. **`FAQPage` only where FAQs are visible.** Both `/` (six items) and `/faq/` (all eight) qualify:
   `Faq.tsx:47` uses `hidden={!isOpen}`, not conditional rendering, so every answer ships in the DOM.
   **Preserve that property** in any new accordion — switching to conditional rendering silently
   invalidates the schema. The homepage currently renders the FAQs and emits no `FAQPage`; that's free.
4. **No dangling `@id`s.** `serviceJsonLd` wires `provider` to the business `@id`; don't invent refs.
5. **`foundingDate` is real here.** `foundedYear: 2014` is set, so the field is emitted correctly — one
   of the few identity fields this site doesn't have to defer.
6. **Don't ship 🔶 values as structured data.** The four `priceRows` values are unconfirmed. An `Offer`
   is a machine-readable price commitment; it needs a confirmed number, not a placeholder.

## Missing business fields and what blocks each

`address` (the manifest has region + country only), `geo`, `hasMap`, `openingHoursSpecification` (the
hours are 🔶), `sameAs` (empty array), `aggregateRating`, `founder` — all blocked on
`docs/business-facts.md`. Add the row; don't fill the value. And they belong in the **roster manifest**
(`Israeli services sites/roster/sites/gagoline.json`), never in `site.config.json` directly.

## Checklist

- [ ] Every nested route emits `BreadcrumbList` built from the same array the UI renders.
- [ ] Location pages emit `Service` + `areaServed` typed `City`.
- [ ] The homepage emits `FAQPage` for the six FAQs it already renders.
- [ ] Every `FAQPage` question is visible on the page and ships in the DOM.
- [ ] `Offer` values equal the rendered `priceRows` — and only once those are confirmed.
- [ ] No `Review` or `AggregateRating` without a public source URL.
- [ ] `@id`s match the canonical, trailing slash included.

## Verify

```bash
grep -rL 'application/ld+json' out --include=index.html          # pages with no schema
grep -rl 'BreadcrumbList' out --include=index.html | wc -l       # target 43
grep -rl 'aggregateRating' out --include=index.html              # expect none
```

Then run Google's Rich Results Test on one URL per route type. Zero errors is the bar.
