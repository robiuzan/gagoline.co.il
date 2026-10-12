# Business facts — intake sheet

**This is the one file an AI agent may not fill in.** Everything below is a claim the site either makes
without proof, or needs and doesn't have. Fill in the `Value` column, flip `Status` to ✅, and the
matching agent or skill will wire it into the right place.

**Status key:** 🔶 unconfirmed (never state as fact) · ✅ confirmed · ❌ not applicable / decided against

**Where confirmed values land:**

- **Roster** = `Israeli services sites/roster/sites/gagoline.json`, then sync to `site.config.json`.
  Anything in NAP, identity, schema, or analytics goes here — never edit `site.config.json` directly.
- **content.ts** = `lib/content.ts` — wording, testimonials, price rows, trust stats.
- **site-config.ts** = `lib/site-config.ts` — hours, social links, service and city arrays.
- **Cloudflare zone / Pages project** = infrastructure the owner controls, not an agent.

`brief.md` is the origin document for most of this site's copy. It is a **strategy intake, not a
verified fact sheet** — every value it tags 🔶 is still 🔶 here.

---

## A. Ship-blockers — placeholder content is live right now

These are not gaps. They are fabricated-looking content **currently served to real visitors**, and they
outrank every other item in this file.

| Field                                                   | Why it's needed                                                                                                                                                                                                                                                                                                                                                                                           | Lands in                         | Value | Status |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----- | ------ |
| **3+ real reviews** (author, date, text, source URL)    | `lib/content.ts:141-160` ships three testimonials authored as `"לקוח/ה — להחלפה 🔶"` with invented 5-star quotes. They render on **`/` and `/reviews/`**. An invented review is a Google policy violation and a consumer-protection exposure, not a placeholder                                                                                                                                           | content.ts `testimonials`        |       | 🔶     |
| **More job photographs** (5 services have none)         | **Partly resolved 2026-08-27.** Ten were supplied, four published, six rejected — two AI-generated, one carrying a third party's branding, three stock. `/gallery/` is live and indexed and three service pages carry a photo; זיפות, מרפסות, קירות חיצוניים, הלבנת גגות and מרתפים still have none, and no city page may carry one until a location is sourced. Triage criteria: skill `page-imagery` §8 | `public/*.jpg` → `galleryImages` |       | 🔧     |
| **Blog content, or the decision to unpublish `/blog/`** | `app/blog/page.tsx` says `תכני הבלוג בדרך 🔶` and is in the sitemap. An indexed empty page is a thin-content signal                                                                                                                                                                                                                                                                                       | `content/` or `app/blog/`        |       | 🔶     |

Until each is resolved, the correct action is **remove or `noindex` the surface**, not soften the
wording. See [content-standards.md](content-standards.md) §6.

## B. Identity & history

`foundedYear: 2014` **is** set in the manifest, so "מאז 2014" and "מעל עשור" are supportable — this
site does not have galbath's null-founding-year problem. What it lacks is everything a visitor would
use to verify who they are letting onto their roof.

| Field                      | Why it's needed                                                                                                            | Lands in                         | Value | Status |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----- | ------ |
| Legal entity name          | `legalName` in schema; currently duplicates the brand name                                                                 | Roster `legalName`               |       | 🔶     |
| ח.פ. / ע.מ. number         | Standard IL trust signal; absent sitewide                                                                                  | Roster + `/about/`               |       | 🔶     |
| Owner / founder name       | `Person` schema, article bylines, the About story. **No person is named anywhere today**                                   | content.ts `team`                |       | 🔶     |
| Owner's years in the trade | The experience half of E-E-A-T                                                                                             | content.ts `team`                |       | 🔶     |
| Crew size                  | `trustStats` claims "מאות" גגות with no basis                                                                              | content.ts `trustStats`          |       | 🔶     |
| Business hours             | `lib/site-config.ts:40-44` carries `א'–ה' 08:00–18:00` / `ו' 08:00–13:00` marked 🔶, and they render in the footer as fact | site-config.ts + Roster          |       | 🔶     |
| Winter emergency scope     | "שירות חירום לנזילות בחורף" is claimed in the footer and across the copy — what does it actually promise?                  | site-config.ts `hours.emergency` |       | 🔶     |

## C. Proof & authority — blocks star rich results

`schema.sameAs` is an **empty array**; `siteConfig.social` is three empty strings. There is no link to a
Google Business Profile anywhere on the site. Combined with §A, the site currently has **negative**
social proof: placeholder reviews are worse than none.

| Field                            | Why it's needed                                                                                                                          | Lands in                  | Value | Status |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----- | ------ |
| Google Business Profile URL      | The top local-SEO lever; `sameAs`; the source that would make `aggregateRating` legitimate                                               | Roster `schema.sameAs`    |       | 🔶     |
| Facebook / Instagram URLs        | `sameAs`; entity corroboration. Before/after roof work is natural Instagram content                                                      | Roster `schema.sameAs`    |       | 🔶     |
| Review count + average rating    | `AggregateRating`. **Only ships with a verifiable public source** — an unsourced rating is a Rich Results failure and a policy violation | content.ts `testimonials` |       | 🔶     |
| Licence / certification          | Expertise signal; רישיון/תעודה/מוסמך appear **zero times** in the repo                                                                   | content.ts `credentials`  |       | 🔶     |
| Insurance (ביטוח צד ג׳)          | Standard trade trust signal, and the one homeowners ask about for roof work                                                              | content.ts `credentials`  |       | 🔶     |
| Manufacturer / material training | Names the sealing systems actually used — the differentiator the copy gestures at                                                        | content.ts `credentials`  |       | 🔶     |
| Trade association / קבלן רשום    | Authority signal specific to construction trades in Israel                                                                               | content.ts `credentials`  |       | 🔶     |

## D. Commercial terms

`priceRows` in `lib/content.ts:130-135` carries four ranges, every one of them tagged 🔶 in its own
comment, and they render on `/` and `/pricing/` as if confirmed. `trustStats` claims **"עד 10 שנים"**
warranty; `faqs` says only "אחריות בכתב" with the duration explicitly deferred. The site therefore
states a warranty term in one component and declines to state it in another, ~one screen apart.

| Field                                            | Why it's needed                                                                              | Lands in                  | Value | Status |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------- | ----- | ------ |
| Warranty duration                                | Resolves the `trustStats` "עד 10 שנים" vs. FAQ contradiction                                 | content.ts + `/about/`    |       | 🔶     |
| Warranty scope + exclusions                      | The most-repeated claim on the site has no terms anywhere                                    | content.ts                |       | 🔶     |
| איטום ביריעות ביטומניות — real ₪/m²              | Currently `80–120 ₪ למ"ר` 🔶                                                                 | content.ts `priceRows`    |       | 🔶     |
| זיפות גגות — real ₪/m²                           | Currently `40–60 ₪ למ"ר` 🔶                                                                  | content.ts `priceRows`    |       | 🔶     |
| סיוד והלבנת גגות — real ₪/m²                     | Currently `14–18 ₪ למ"ר` 🔶                                                                  | content.ts `priceRows`    |       | 🔶     |
| איתור נזילות — call-out fee, and is it credited? | Currently `החל מ-250 ₪` 🔶. "Is it waived if we do the job?" is the #1 pre-purchase question | content.ts `priceRows`    |       | 🔶     |
| Minimum job size / call-out radius surcharge     | Sets expectations for the far end of the 50 km radius                                        | content.ts                |       | 🔶     |
| What a quote includes / excludes                 | AEO answer-block material; the top service-page gap                                          | content.ts `serviceDepth` |       | 🔶     |
| Payment methods / terms                          | Conversion friction, especially for ועדי בתים                                                | content.ts                |       | 🔶     |

## E. Coverage & location

The manifest carries **no street address** — `schema.address` is `{ addressRegion: "מרכז", addressCountry: "IL" }`.
That is a defensible model for a service-area business, but it has consequences: no `PostalAddress`
completeness, no `geo`, no map, and a Google Business Profile would have to be set up as a
service-area business with a hidden address. Decide deliberately rather than by omission.

| Field                                                      | Why it's needed                                                                                                                                                                                        | Lands in                 | Value | Status |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ----- | ------ |
| Is there a real business address to publish?               | Drives `PostalAddress`, `geo`, `hasMap`, and the GBP model. Absent from every page today                                                                                                               | Roster `schema.address`  |       | 🔶     |
| If not — confirm service-area-business status              | Determines whether an address should ever be added, and how GBP is configured                                                                                                                          | Roster + `docs/`         |       | 🔶     |
| Are all 23 cities genuinely served at the same terms?      | `lib/site-config.ts:76-100`. Note the distance framing was wrong: רחובות ~22 km and נתניה ~30 km are both well inside the radius. The real constraint is operational commitment per city, not distance | `lib/site-config.ts`     |       | 🔶     |
| Real response time per distance band                       | "מענה מהיר" is claimed sitewide with no number                                                                                                                                                         | content.ts               |       | 🔶     |
| Winter emergency availability — hours, response, surcharge | The strongest seasonal differentiator on the site, entirely unspecified                                                                                                                                | content.ts               |       | 🔶     |
| Roof types actually serviced                               | `serviceMeta` claims בטון · מרוצף · רעפים · איסכורית. Confirm all four, incl. work-at-height capability                                                                                                | content.ts `serviceMeta` |       | 🔶     |

## F. Infrastructure — owner-only changes

| Field              | Why it's needed                                                                                                                                      | Lands in                                           | Value | Status |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----- | ------ |
| GA4 measurement ID | ✅ **RESOLVED — verified live 2026-09-06.** The property already existed and was already routed: the live container's hostname Lookup Table maps `(^ | \.)gagoline\.co\.il# Business facts — intake sheet |

**This is the one file an AI agent may not fill in.** Everything below is a claim the site either makes
without proof, or needs and doesn't have. Fill in the `Value` column, flip `Status` to ✅, and the
matching agent or skill will wire it into the right place.

**Status key:** 🔶 unconfirmed (never state as fact) · ✅ confirmed · ❌ not applicable / decided against

**Where confirmed values land:**

- **Roster** = `Israeli services sites/roster/sites/gagoline.json`, then sync to `site.config.json`.
  Anything in NAP, identity, schema, or analytics goes here — never edit `site.config.json` directly.
- **content.ts** = `lib/content.ts` — wording, testimonials, price rows, trust stats.
- **site-config.ts** = `lib/site-config.ts` — hours, social links, service and city arrays.
- **Cloudflare zone / Pages project** = infrastructure the owner controls, not an agent.

`brief.md` is the origin document for most of this site's copy. It is a **strategy intake, not a
verified fact sheet** — every value it tags 🔶 is still 🔶 here.

---

## A. Ship-blockers — placeholder content is live right now

These are not gaps. They are fabricated-looking content **currently served to real visitors**, and they
outrank every other item in this file.

| Field                                                   | Why it's needed                                                                                                                                                                                                                                                                                                                                                                                           | Lands in                         | Value | Status |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----- | ------ |
| **3+ real reviews** (author, date, text, source URL)    | `lib/content.ts:141-160` ships three testimonials authored as `"לקוח/ה — להחלפה 🔶"` with invented 5-star quotes. They render on **`/` and `/reviews/`**. An invented review is a Google policy violation and a consumer-protection exposure, not a placeholder                                                                                                                                           | content.ts `testimonials`        |       | 🔶     |
| **More job photographs** (5 services have none)         | **Partly resolved 2026-08-27.** Ten were supplied, four published, six rejected — two AI-generated, one carrying a third party's branding, three stock. `/gallery/` is live and indexed and three service pages carry a photo; זיפות, מרפסות, קירות חיצוניים, הלבנת גגות and מרתפים still have none, and no city page may carry one until a location is sourced. Triage criteria: skill `page-imagery` §8 | `public/*.jpg` → `galleryImages` |       | 🔧     |
| **Blog content, or the decision to unpublish `/blog/`** | `app/blog/page.tsx` says `תכני הבלוג בדרך 🔶` and is in the sitemap. An indexed empty page is a thin-content signal                                                                                                                                                                                                                                                                                       | `content/` or `app/blog/`        |       | 🔶     |

Until each is resolved, the correct action is **remove or `noindex` the surface**, not soften the
wording. See [content-standards.md](content-standards.md) §6.

## B. Identity & history

`foundedYear: 2014` **is** set in the manifest, so "מאז 2014" and "מעל עשור" are supportable — this
site does not have galbath's null-founding-year problem. What it lacks is everything a visitor would
use to verify who they are letting onto their roof.

| Field                      | Why it's needed                                                                                                            | Lands in                         | Value | Status |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----- | ------ |
| Legal entity name          | `legalName` in schema; currently duplicates the brand name                                                                 | Roster `legalName`               |       | 🔶     |
| ח.פ. / ע.מ. number         | Standard IL trust signal; absent sitewide                                                                                  | Roster + `/about/`               |       | 🔶     |
| Owner / founder name       | `Person` schema, article bylines, the About story. **No person is named anywhere today**                                   | content.ts `team`                |       | 🔶     |
| Owner's years in the trade | The experience half of E-E-A-T                                                                                             | content.ts `team`                |       | 🔶     |
| Crew size                  | `trustStats` claims "מאות" גגות with no basis                                                                              | content.ts `trustStats`          |       | 🔶     |
| Business hours             | `lib/site-config.ts:40-44` carries `א'–ה' 08:00–18:00` / `ו' 08:00–13:00` marked 🔶, and they render in the footer as fact | site-config.ts + Roster          |       | 🔶     |
| Winter emergency scope     | "שירות חירום לנזילות בחורף" is claimed in the footer and across the copy — what does it actually promise?                  | site-config.ts `hours.emergency` |       | 🔶     |

## C. Proof & authority — blocks star rich results

`schema.sameAs` is an **empty array**; `siteConfig.social` is three empty strings. There is no link to a
Google Business Profile anywhere on the site. Combined with §A, the site currently has **negative**
social proof: placeholder reviews are worse than none.

| Field                            | Why it's needed                                                                                                                          | Lands in                  | Value | Status |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----- | ------ |
| Google Business Profile URL      | The top local-SEO lever; `sameAs`; the source that would make `aggregateRating` legitimate                                               | Roster `schema.sameAs`    |       | 🔶     |
| Facebook / Instagram URLs        | `sameAs`; entity corroboration. Before/after roof work is natural Instagram content                                                      | Roster `schema.sameAs`    |       | 🔶     |
| Review count + average rating    | `AggregateRating`. **Only ships with a verifiable public source** — an unsourced rating is a Rich Results failure and a policy violation | content.ts `testimonials` |       | 🔶     |
| Licence / certification          | Expertise signal; רישיון/תעודה/מוסמך appear **zero times** in the repo                                                                   | content.ts `credentials`  |       | 🔶     |
| Insurance (ביטוח צד ג׳)          | Standard trade trust signal, and the one homeowners ask about for roof work                                                              | content.ts `credentials`  |       | 🔶     |
| Manufacturer / material training | Names the sealing systems actually used — the differentiator the copy gestures at                                                        | content.ts `credentials`  |       | 🔶     |
| Trade association / קבלן רשום    | Authority signal specific to construction trades in Israel                                                                               | content.ts `credentials`  |       | 🔶     |

## D. Commercial terms

`priceRows` in `lib/content.ts:130-135` carries four ranges, every one of them tagged 🔶 in its own
comment, and they render on `/` and `/pricing/` as if confirmed. `trustStats` claims **"עד 10 שנים"**
warranty; `faqs` says only "אחריות בכתב" with the duration explicitly deferred. The site therefore
states a warranty term in one component and declines to state it in another, ~one screen apart.

| Field                                            | Why it's needed                                                                              | Lands in                  | Value | Status |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------- | ----- | ------ |
| Warranty duration                                | Resolves the `trustStats` "עד 10 שנים" vs. FAQ contradiction                                 | content.ts + `/about/`    |       | 🔶     |
| Warranty scope + exclusions                      | The most-repeated claim on the site has no terms anywhere                                    | content.ts                |       | 🔶     |
| איטום ביריעות ביטומניות — real ₪/m²              | Currently `80–120 ₪ למ"ר` 🔶                                                                 | content.ts `priceRows`    |       | 🔶     |
| זיפות גגות — real ₪/m²                           | Currently `40–60 ₪ למ"ר` 🔶                                                                  | content.ts `priceRows`    |       | 🔶     |
| סיוד והלבנת גגות — real ₪/m²                     | Currently `14–18 ₪ למ"ר` 🔶                                                                  | content.ts `priceRows`    |       | 🔶     |
| איתור נזילות — call-out fee, and is it credited? | Currently `החל מ-250 ₪` 🔶. "Is it waived if we do the job?" is the #1 pre-purchase question | content.ts `priceRows`    |       | 🔶     |
| Minimum job size / call-out radius surcharge     | Sets expectations for the far end of the 50 km radius                                        | content.ts                |       | 🔶     |
| What a quote includes / excludes                 | AEO answer-block material; the top service-page gap                                          | content.ts `serviceDepth` |       | 🔶     |
| Payment methods / terms                          | Conversion friction, especially for ועדי בתים                                                | content.ts                |       | 🔶     |

## E. Coverage & location

The manifest carries **no street address** — `schema.address` is `{ addressRegion: "מרכז", addressCountry: "IL" }`.
That is a defensible model for a service-area business, but it has consequences: no `PostalAddress`
completeness, no `geo`, no map, and a Google Business Profile would have to be set up as a
service-area business with a hidden address. Decide deliberately rather than by omission.

| Field                                                      | Why it's needed                                                                                                                                                                                        | Lands in                 | Value | Status |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ----- | ------ |
| Is there a real business address to publish?               | Drives `PostalAddress`, `geo`, `hasMap`, and the GBP model. Absent from every page today                                                                                                               | Roster `schema.address`  |       | 🔶     |
| If not — confirm service-area-business status              | Determines whether an address should ever be added, and how GBP is configured                                                                                                                          | Roster + `docs/`         |       | 🔶     |
| Are all 23 cities genuinely served at the same terms?      | `lib/site-config.ts:76-100`. Note the distance framing was wrong: רחובות ~22 km and נתניה ~30 km are both well inside the radius. The real constraint is operational commitment per city, not distance | `lib/site-config.ts`     |       | 🔶     |
| Real response time per distance band                       | "מענה מהיר" is claimed sitewide with no number                                                                                                                                                         | content.ts               |       | 🔶     |
| Winter emergency availability — hours, response, surcharge | The strongest seasonal differentiator on the site, entirely unspecified                                                                                                                                | content.ts               |       | 🔶     |
| Roof types actually serviced                               | `serviceMeta` claims בטון · מרוצף · רעפים · איסכורית. Confirm all four, incl. work-at-height capability                                                                                                | content.ts `serviceMeta` |       | 🔶     |

## F. Infrastructure — owner-only changes

| Field                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Why it's needed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Lands in         | Value     | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------- | ------ |
| -> **`G-22SPQY0188`**, and `gtag/js?id=G-22SPQY0188` returns a real configured payload (519 KB vs 428 KB for a bogus-ID control). This row was never a tracking gap, only a recording gap — it was inferred from `ga4MeasurementId: null` in the roster instead of probed from the container, the same mistake as the AI-crawler row. Now recorded in the roster and synced. **Still open, and different:** the container has NO GA4 event tags and NO click triggers (`__gaawe` × 0, `__cl`/`__lcl` × 0), so `lead_submit` and every `data-cta` click are invisible — page views are the only thing recorded | Roster `analytics`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | G-22SPQY0188     | ✅        |
| **Unblock the AI crawlers**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ **RESOLVED — re-verified live 2026-08-31.** The served `/robots.txt` now carries the fleet allow list (`OAI-SearchBot`, `ChatGPT-User`, `Claude-User`, `Claude-SearchBot`, `PerplexityBot`, `Perplexity-User`, `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot` → `Allow: /`), and a user-agent probe returns **200 to all six agents tested** — so the enforced bot rule that previously answered **403** is gone too, not just the advisory file. Was blocked 2026-08-16; the owner changed the zone. **The AEO/GEO goal is no longer capped.** Re-probe after any Cloudflare change — see [cloudflare-runbook.md](cloudflare-runbook.md) §1 | Cloudflare       | unblocked | ✅     |
| CSP — ship it report-only?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Five security headers are already served at the edge; **CSP is the only one missing**. It has to be added where the others are set, and observed report-only for a week first — [cloudflare-runbook.md](cloudflare-runbook.md) §2                                                                                                                                                                                                                                                                                                                                                                                                                                       | Cloudflare       |           | 🔶     |
| `www` → apex redirect?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `https://www.gagoline.co.il/` currently returns **200 with the full site** instead of a 301. Mitigated by apex canonicals, but it is a second live copy — [cloudflare-runbook.md](cloudflare-runbook.md) §3                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Cloudflare       |           | 🔶     |
| Web3Forms delivery inbox — confirmed?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `contact.formAccessKey` is provisioned and the form POSTs to it. Confirm a real submission lands in a monitored inbox                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Roster `contact` |           | 🔶     |

## G. Live surfaces — the owner's answers, 2026-10-12

The announcement bar, the seasonal card and the homepage updates strip (CLAUDE.md §13) went to the
owner on the fleet wording sign-off page. On **2026-10-12** the owner approved this site's wording
as drafted, with no line changed — wording fingerprint `90bebafded0d`, now the `approved` stamp in
`content/live/_campaigns.mjs` and `content/live/_updates.mjs` — and answered the four questions
below. The last two were asked once, for every fleet site. All four were asked on the sign-off page;
no row in this file was open for them.

| Field                                                                                                              | Why it's needed                                                                                                                                                                                                                                               | Lands in                                                | Value                                                                                                                                                                                                          | Status |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Wartime line ״פועלים בכפוף להנחיות פיקוד העורף״ — does גגוליין keep working under Home Front Command restrictions? | The line shows on every page, alone, while the fleet status switch says `reduced`. Its wording was confirmed for 3locksmiths on 2026-10-04; whether it is true here is this business's own answer                                                             | `content/live/_campaigns.mjs` → `reduced`               | **Yes — keep the line.** Owner, 2026-10-12                                                                                                                                                                     | ✅     |
| A new item for the updates strip                                                                                   | The strip hides itself 45 days after its newest item: 16/09/2026, so from 23:00 on 30/10/2026 (Israel time), until a newer real item is added                                                                                                                 | `content/live/_updates.mjs`                             | **None — the strip ships as is.** Owner, 2026-10-12                                                                                                                                                            | ✅     |
| Card hours (fleet-wide)                                                                                            | The card may open at any hour except Shabbat, chag, memorial days and fasts — weekday evenings, Friday afternoon and Saturday night included, when the phone may go unanswered; its WhatsApp button still works then. This site's own hours are still 🔶 (§B) | `public/assets/live.js` (kit) — no setting in this repo | **All hours.** Owner, 2026-10-12                                                                                                                                                                               | ✅     |
| GTM trigger for the card (fleet-wide)                                                                              | The card's `surface_view` / `surface_dismiss` count only where a trigger listens, and this repo's rule is a hostname-scoped trigger — [measurement-architecture.md](measurement-architecture.md) §2                                                           | Container `GTM-KWGGH438`                                | **One shared trigger for the whole fleet:** `CE - popup events (3locksmiths)`, its hostname condition widened to every fleet site. Owner, 2026-10-12. The edit itself is a container change, outside this repo | ✅     |

---

## Verified — no action needed

- **Founding year.** `foundedYear: 2014` in the manifest. "מאז 2014" and "מעל עשור" are free to state.
- **Search Console verification.** `analytics.googleSiteVerification` is set and
  `app/layout.tsx:38` emits it. (It is also hardcoded there rather than read from the manifest — a
  code defect, not a facts gap. Backlog §2.7.)
- **GTM container.** `GTM-KWGGH438`, the shared Israeli-fleet container. Assert
  `https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438` returns **200** whenever an id changes.
- **`mailto:` obfuscation is handled.** Verified live 2026-08-16: the homepage serves a raw
  `mailto:info@gagoline.co.il` with no `/cdn-cgi/l/email-protection` rewrite.
  `components/ui/EmailAddress.tsx` wraps the address in `email_off` / `email_on` markers, which is what
  keeps it intact. Do not "simplify" that component — see commit `ac48484`.
- **Security headers.** Five of the six are injected by the **Cloudflare zone** — HSTS,
  `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Nothing needs
  adding to `public/_headers` for these five: measured 2026-09-01, `_headers` **cannot override** a
  zone-injected header, so the entry would be inert. CSP is the one the zone does not set, and because
  of that `public/_headers` can ship it — it now does, report-only (§F above).
- **Deploy path.** **Cloudflare Pages**, project `gagoline`, cut over 2026-08-02. Direct upload via
  `"Israeli services sites/ops/deploy-site.ps1" -Domain gagoline.co.il -DryRun` then `-Confirm` —
  `wrangler pages deploy` plus a Cloudflare API drift check on the Pages/domain binding, which refuses
  on mismatch. Apex and `www` are proxied CNAMEs to `gagoline.pages.dev`. `public/_headers` and
  `public/_redirects` **do** work here. _(Superseded: `deploy/deploy-webdav.ps1` and the cPanel docroot
  were the path before the cutover; the script now refuses to run.)_
