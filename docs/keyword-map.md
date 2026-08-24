# Keyword map — גגוליין

The intent model behind every route, and the Hebrew title/H1/description formulas that express it.
`seo-metadata`, `local-seo-il` and `hebrew-copywriter` all resolve against this file.

---

## 1. The head term

**איטום גגות** is the flagship. It is the brand's category, the first service in the array, the H1 of
the service silo, and the term every location page targets. Everything else is a modifier on it, a
method within it, or an adjacent job.

Cluster around it: איטום גג · קבלן איטום גגות · זיפות גגות · יריעות ביטומניות · איטום גג רעפים ·
איטום גג בטון.

The site's second, weaker entry point is **problem-led**: נזילה בגג · רטיבות בתקרה · עובש בקיר ·
כתמי רטיבות. These convert better than the category term because the searcher already has the problem —
and the brief's whole positioning (_diagnosis before sealing_) is the answer to them. The site currently
under-serves this half.

---

## 2. Keyword tiers

**Tier 1 — generic head terms.** איטום גגות · קבלן איטום גגות · זיפות גגות. High volume, high
competition, commercial intent. Target: homepage + the matching service page. Won with authority and
depth, not with more pages.

**Tier 2 — local.** `{service} ב{city}` — איטום גגות בתל אביב, איטום גגות בפתח תקווה. This is the
site's structural bet: 8 services × 23 locations. **Currently all 23 location pages target only the
head term × city, and all 23 are find-and-replace clones.** The near-term win is depth on the 23 that
exist, not an 8 × 23 = 184-page expansion (see §6).

**Tier 3 — long-tail / problem-led.** The questions people actually type. These are the highest-value
AEO targets and the natural spine of a knowledge hub:

- כמה עולה איטום גג · מחיר איטום גג למ״ר
- נזילה בגג — איך מאתרים מאיפה זה מגיע
- רטיבות בתקרה בקומה עליונה — מה עושים
- זיפות או יריעות ביטומניות — מה עדיף
- כמה זמן מחזיק איטום גג
- אפשר לאטום גג מרוצף בלי להרים את הריצוף
- מתי הזמן הנכון לאטום גג לפני החורף
- איטום גג רעפים / גג בטון / גג איסכורית — מה שונה

**Tier 4 — commercial and seasonal modifiers.** מחיר, מומלץ, אחריות, בדחיפות, לפני החורף, ועד בית.
Fold into titles and descriptions rather than building pages for them.

**The seasonal reality:** demand for this trade spikes with the first rain and stays high through
winter. Content that will rank in November has to be published and crawled by September.

---

## 3. Title formulas

The root `template` in `app/layout.tsx:33` already appends `| גגוליין`. **A page's own `title` must
never append the brand again.** Write the bare subject and let the template finish it.

| Route type     | `title` you write                               | Renders as                                                  |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| Home           | _(uses `title.default`)_                        | `גגוליין — איטום גגות בתל אביב והמרכז`                      |
| Service        | `{service} בתל אביב והמרכז`                     | `איטום גגות בתל אביב והמרכז \| גגוליין`                     |
| Location       | `איטום גגות ב{city} \| אחריות בכתב + מחיר שקוף` | `איטום גגות בתל אביב \| אחריות בכתב + מחיר שקוף \| גגוליין` |
| Services index | `השירותים שלנו`                                 | `השירותים שלנו \| גגוליין`                                  |
| Pricing        | `מחירון איטום גגות`                             | `מחירון איטום גגות \| גגוליין`                              |
| About          | `אודות`                                         | `אודות \| גגוליין`                                          |
| Contact        | `צור קשר`                                       | `צור קשר \| גגוליין`                                        |
| Article        | `{question verbatim}`                           | `כמה עולה איטום גג? \| גגוליין`                             |

The location formula is the one prescribed in `CLAUDE.md` §6 and it is correct — the brand appears
once, at the end, added by the template. Keep the rendered title under ~60 characters; the longest city
names (`רמת השרון`, `ראשון לציון`) push it to the edge, which is acceptable.

> **The live defect:** `app/about/page.tsx:10` writes `title: "אודות גגוליין"`, which renders
> **`אודות גגוליין | גגוליין`**. It is the only page with a doubled brand — fix it to `"אודות"`.
> (Backlog §2.1.)

If a page ever needs the brand suppressed entirely, use `title: { absolute: "…" }`. Never add a second
brand token to work around the template.

---

## 4. H1 formulas

The H1 restates the title's intent in natural Hebrew — it is not a copy of the title.

| Route type | H1                                    |
| ---------- | ------------------------------------- |
| Home       | `איטום גגות מקצועי — גג יבש, ראש שקט` |
| Service    | `{service}` — e.g. `זיפות גגות`       |
| Location   | `איטום גגות ב{city}`                  |
| Pricing    | `מחירון איטום גגות`                   |
| Article    | The question itself, verbatim         |

Exactly one `<h1>` per page — currently true across all 44 routes. Everything below is `<h2>`/`<h3>`
with no skipped levels. Note `/faq/` currently goes `<h1>` → the accordion's `<h3>`s with no `<h2>`
between them; that is a skipped level (backlog §2.4).

---

## 5. Description formulas

150–160 characters, unique per route. Lead with **service + place**, add **one true differentiator**,
close with an action. Never reuse a description across two routes.

- **Service:** `{what it is in one clause}. {method or substrate}. אחריות בכתב. חייגו {phone}.`
- **Location:** `קבלן איטום גגות ב{city} — {method}, {speed}. שירות לבעלי בתים ולוועדי בתים. חייגו {phone}.`
- **Article:** answer the question in the first clause, then say what the page covers.

Only claim what [business-facts.md](business-facts.md) confirms. **"מאז 2014" is free** — the manifest
carries `foundedYear: 2014`. Warranty **duration**, every price, and any rating are 🔶.

The homepage description is `siteConfig.tagline` — a real sentence, unlike the fleet's usual 25-character
placeholder. Keep it, but consider one written for the SERP rather than for the hero.

---

## 6. The service × location matrix

23 locations × 8 services = 184 possible cells. **Do not build them.**

The 23 location pages currently target `איטום גגות ב{city}` only, and all 23 are find-and-replace
clones (backlog §3.5). Publishing 184 variations of copy that thin is the textbook doorway pattern and
risks the whole domain.

**The expansion cap, in order:**

1. All 23 existing location pages pass the doorway test in
   [content-standards.md](content-standards.md) §2.
2. Each earns its Tier-2 depth: local roof stock, nearby areas, a city-specific FAQ, real job
   references where they exist.
3. Only then consider a second service × location tier, and only for services with genuine local
   demand — איטום גגות, זיפות גגות and איתור נזילות, not איטום מרתפים ב{every city}.

A cell exists when there is something true and specific to say in it. Not before.

---

## 7. Route → primary keyword

| Route                              | Primary target                      | Tier |
| ---------------------------------- | ----------------------------------- | ---- |
| `/`                                | איטום גגות                          | 1    |
| `/services/roof-sealing/`          | איטום גגות                          | 1    |
| `/services/roof-tarring/`          | זיפות גגות                          | 1    |
| `/services/bituminous-sheets/`     | איטום ביריעות ביטומניות             | 2    |
| `/services/balcony-sealing/`       | איטום מרפסות                        | 2    |
| `/services/leak-detection/`        | איתור נזילות · נזילה בגג            | 2    |
| `/services/exterior-wall-sealing/` | איטום קירות חיצוניים                | 3    |
| `/services/roof-whitening/`        | סיוד והלבנת גגות                    | 3    |
| `/services/basement-sealing/`      | איטום מרתפים                        | 3    |
| `/areas/{city}/`                   | איטום גגות ב{city}                  | 2    |
| `/pricing/`                        | מחיר איטום גג · כמה עולה איטום גג   | 3    |
| `/faq/`                            | Tier-3 questions, aggregated        | 3    |
| `/about/`                          | brand + entity terms                | —    |
| `/gallery/` `/reviews/` `/blog/`   | trust surfaces, not keyword targets | —    |

**Slug rule.** This site uses **Latin route segments with Hebrew display names** (`/services/roof-sealing/`,
`/areas/tel-aviv/`) — the opposite of the fleet's Hebrew-slug sites. That is a defensible choice and it
is **live**: the URLs are indexed, so they stay. Renaming a slug to Hebrew for keyword-in-URL value
would need a 301 map and would trade a real ranking signal for a marginal one. Not a cleanup task.

**Two routes are keyword targets with no content behind them:** `/gallery/` (six empty placeholder
tiles) and `/blog/` ("תכני הבלוג בדרך 🔶"). Both are in the sitemap. Until they have content they
should be `noindex` or removed — an indexed empty page spends crawl budget to demonstrate thinness.
