# Schema graph — target JSON-LD

What every route should emit. `schema-auditor` validates against this file;
`schema-structured-data` implements it. Builders come from `@ishub/site-kit/seo`:
`localBusinessJsonLd` · `serviceJsonLd` · `faqJsonLd` · `breadcrumbJsonLd` · `jsonLdScript`.

**Headline number: 2 of 44 emitted pages carry any JSON-LD.** The homepage has a
`RoofingContractor` node; `/faq/` has a hand-rolled `FAQPage`. Everything else — all 8 service pages,
all 23 location pages, and every static page — emits nothing.

---

## 1. `@id` scheme

Stable `@id`s let nodes reference each other instead of repeating themselves.

| Node                | `@id`                                             |
| ------------------- | ------------------------------------------------- |
| The business        | `https://gagoline.co.il/#business`                |
| The website         | `https://gagoline.co.il/#website`                 |
| The organization    | `https://gagoline.co.il/#organization`            |
| A service           | `https://gagoline.co.il/services/{slug}/#service` |
| A person            | `https://gagoline.co.il/about/#person-{n}`        |
| A page's breadcrumb | `{pageUrl}#breadcrumb`                            |

`@id` values must match the page's canonical and its `sitemap.xml` `<loc>` byte for byte — trailing
slash included. Route slugs here are ASCII, so unlike the fleet's Hebrew-slug sites there is no
percent-escaping to reconcile.

---

## 2. Node per route type

| Route                  | Required                                                               | Currently                                                                  |
| ---------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `/`                    | `RoofingContractor` + `WebSite` + `FAQPage`                            | business ✅, no `WebSite` ❌, **no `FAQPage` despite six visible FAQs** ❌ |
| `/services/{slug}/` ×8 | `Service` + `BreadcrumbList` (+ `FAQPage` once per-service FAQs exist) | **nothing** ❌                                                             |
| `/areas/{city}/` ×23   | `Service` with `areaServed` + `BreadcrumbList`                         | **nothing** ❌                                                             |
| `/services/` (index)   | `CollectionPage` + `BreadcrumbList`                                    | nothing ❌                                                                 |
| `/pricing/`            | `OfferCatalog` (or `Offer[]`) + `BreadcrumbList`                       | nothing ❌                                                                 |
| `/about/`              | `AboutPage` + `Person[]` + `BreadcrumbList`                            | nothing ❌                                                                 |
| `/contact/`            | `ContactPage` + `BreadcrumbList`                                       | nothing ❌                                                                 |
| `/faq/`                | `FAQPage` + `BreadcrumbList`                                           | `FAQPage` ✅ (hand-rolled), breadcrumb ❌                                  |
| `/reviews/`            | `Review[]` — **only when sourced**                                     | nothing ✅ (correct today)                                                 |
| `/gallery/` `/blog/`   | `BreadcrumbList` — and only once they have content                     | nothing ❌                                                                 |
| Legal pages            | `BreadcrumbList`                                                       | nothing ❌                                                                 |
| `/404`                 | none                                                                   | —                                                                          |

**`BreadcrumbList` is the biggest single gap.** `components/layout/PageHeader.tsx:23-38` renders a
visible `<nav aria-label="פירורי לחם">` trail on **every inner page**, and `breadcrumbJsonLd()` sits
unused in the kit. The builder takes the same `crumbs` array the component already receives — feed it
there and markup and schema cannot drift.

Target: **42 pages** carrying `BreadcrumbList` — every route except `/` (it is the root) and `/404`.

---

## 3. The business node

Built by `localBusinessJsonLd(manifest, opts)` from the roster manifest. Never hand-assemble it, and
never hardcode a value the manifest already carries.

`@type` is **`RoofingContractor`** (`site.config.json` → `schema.type`) — a valid schema.org subtype of
`HomeAndConstructionBusiness`, and a better entity match than bare `LocalBusiness`. Keep it.

**Present today:** `name`, `alternateName`, `description`, `url`, `telephone`, `email`, `priceRange`
(`₪₪`), `areaServed`, `addressRegion` / `addressCountry`, `foundingDate` (from `foundedYear: 2014`).

**Missing, and each blocked on a specific fact:**

| Field                             | Blocked on                                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `address` (full `PostalAddress`)  | The manifest has region + country only — business-facts §E. Decide service-area vs. storefront  |
| `geo` (`GeoCoordinates`)          | business-facts §E — depends on the address decision                                             |
| `hasMap`                          | business-facts §E                                                                               |
| `openingHoursSpecification`       | Hours are 🔶 in `lib/site-config.ts:40-44` and render as fact in the footer — business-facts §B |
| `sameAs`                          | Empty array; needs GBP + socials — business-facts §C                                            |
| `aggregateRating`                 | **Only with a verifiable public source** — business-facts §C                                    |
| `founder` / `employee` (`Person`) | No person is named on the site — business-facts §B                                              |

---

## 4. Gating rules

These are correctness rules, not preferences. Getting them wrong is worse than emitting nothing.

1. **`Review` and `AggregateRating` ship only when the reviews are real and publicly verifiable.**
   Correctly absent from the schema today — but note the **visible** testimonials on `/` and
   `/reviews/` are placeholders (`lib/content.ts:141-160`). Marking those up would convert a content
   defect into a Google policy violation. Do not "seed" the graph to test the markup.
2. **Schema must match what the user sees.** A `FAQPage` question that isn't rendered on the page is a
   violation. `Offer` prices must equal the visible `priceRows`. Never mark up hidden content.
3. **`FAQPage` only where FAQs are visible.** Both the homepage and `/faq/` qualify: `Faq.tsx:47` uses
   `hidden={!isOpen}`, so every answer ships in the DOM. Preserve that property in any new accordion —
   switching to conditional rendering would silently invalidate the schema.
4. **No dangling `@id`s.** If `provider` points at `#business`, that node must exist on the page or be
   resolvable. `serviceJsonLd` handles this; don't invent references.
5. **One node per concept per page.** Two business nodes on one page is worse than one.
6. **Use the kit builders.** `app/faq/page.tsx:15-23` hand-assembles its `FAQPage` object instead of
   calling `faqJsonLd(manifest, faqs)`. It happens to be valid, but it bypasses the shared shape and
   will drift from the rest of the fleet. Migrate it.

---

## 5. Location-page schema

The 23 location pages are the largest structured-data gap on the site. Each should emit:

- **`Service`** — `name: "איטום גגות ב{city}"`, `serviceType: "איטום גגות"`,
  `provider: { "@id": "https://gagoline.co.il/#business" }`,
  `areaServed: { "@type": "City", name: city.name }`.
- **`BreadcrumbList`** — `בית › אזורי שירות › {city}`.
- **`FAQPage`** once city-specific FAQs exist (content-standards §3).

All 23 entries in `cities` are genuine cities, so `City` is correct for every one — this site has no
region-vs-city ambiguity to model.

**Do not** emit a business node per location. `RoofingContractor` × 23 implies 23 premises that don't
exist and is a well-known local-spam pattern. One business, one node.

> The breadcrumb trail on location pages currently points its middle crumb at
> `/areas/{city}` — the page itself. There is **no areas index route**. Either add `/areas/` as a real
> hub page or drop the middle crumb; a self-referencing breadcrumb is wrong in the markup and wrong in
> the graph.

---

## 6. Article schema

For a future `/blog/{slug}/` (or `/מדריכים/{slug}/`) route:

`Article` with `headline`, `description`, `image`, `datePublished`, `dateModified`,
`author` (`Person` with a **real** name — business-facts §B), `publisher` (`@id` → `#organization`),
`mainEntityOfPage`. Plus `BreadcrumbList`, plus `FAQPage` derived from the article's `faq` blocks.

Deriving `FAQPage` from typed blocks rather than authoring it separately is what keeps rule §4.2 from
breaking as copy is edited.

---

## 7. Verification

```bash
# every deep page carries JSON-LD
grep -rL 'application/ld+json' out --include=index.html

# breadcrumbs everywhere they should be
grep -rl 'BreadcrumbList' out --include=index.html | wc -l   # target: 42

# nothing fabricated
grep -rl 'aggregateRating\|"@type": *"Review"' out --include=index.html   # expect none
```

Then run Google's **Rich Results Test** on one URL per route type: home, a service page, a location
page, the pricing page, `/faq/`. Zero errors is the bar; warnings get triaged against this file.
