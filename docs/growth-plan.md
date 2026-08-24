# Growth plan — gagoline.co.il

**Written 2026-08-17** from a nine-dimension audit of the repo, the committed export in `out/`, and the
live site. Every claim here was measured, not assumed. Where a prior doc was wrong, this plan says so
and the doc has been corrected.

Companion documents: [optimization-backlog.md](optimization-backlog.md) (the section numbers everything
cites) · [business-facts.md](business-facts.md) (what is confirmed) ·
[owner-requests.md](owner-requests.md) (the numbered ask-list) ·
[content-standards.md](content-standards.md) · [keyword-map.md](keyword-map.md) ·
[schema-graph.md](schema-graph.md) · [cloudflare-runbook.md](cloudflare-runbook.md).

---

## 1. Executive summary

The site is a **well-engineered shell with almost nothing inside it, and it is currently publishing
counterfeit proof.** Those are the two sentences that should drive every decision below.

What is genuinely good — do not spend effort re-fixing it: 44/44 self-referencing trailing-slash
canonicals, 44/44 exactly one `<h1>`, a clean 4.9 MB export with no dev-chunk pollution, correct
`ErrorDocument` 404 behaviour, an excellent WhatsApp-fallback lead form that fires its conversion event
only on confirmed success, a `Reveal` component that degrades correctly, and five security headers
already set at the edge.

**The three things that matter most, in order:**

1. **The build is red.** `npx tsc --noEmit` fails with 4 errors — `app/layout.tsx` imports `ogImageMeta`
   and reads `manifest.images`, neither of which exists in the stale `@ishub/site-kit` copy in
   `node_modules` (it contains only `analytics`, `contact`, `seo`, `types.ts`). `next build`
   type-checks by default, so **nothing can ship at all** until the kit is reinstalled. Every other
   item in this plan is behind it.
2. **The site publishes fabricated social proof.** Three invented five-star testimonials attributed to
   `"לקוח/ה — להחלפה 🔶"` render on `/` and `/reviews/`; `/gallery/` is six empty dashed tiles;
   `/blog/` says "coming soon". The internal 🔶 marker renders on **10 pages** — including inside the
   `FAQPage` JSON-LD on `/faq/`, i.e. as machine-readable structured data. This is a Google policy
   violation and a consumer-protection exposure, and it makes every other number on the page suspect.
   Fixing it is pure deletion and needs no new facts.
3. **There is no content.** Service pages carry ~80 unique words against a 450 floor; city pages ~90
   against 350; `/services/` and `/pricing/` have effectively **zero** unique words because their
   components are rendered identically on the homepage. All 23 city pages are find-and-replace clones —
   the doorway pattern, whose penalty lands on the **domain**, not the page.

**The thesis:** this site does not need more pages. It needs the build unblocked, the fake proof
deleted, the free structural signal claimed (schema, links, hub), and then genuine depth on the 31
money pages it already has — all before the rain. More keywords then come from three surfaces it has no
page for at all (roof types, contractor-selection, problem-led guides), not from multiplying 8 × 23.

---

## 2. The seasonal clock — this drives the ordering

Roof waterproofing demand in Israel spikes with the first rain, typically **mid-to-late October**, and
stays high through February. Google needs weeks to crawl, index and settle new content. Working
backwards from today, **2026-08-17**:

| Date          | Gate                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **by 24 Aug** | Build green. Fabricated content deleted and deployed. Owner request list sent.                      |
| **by 31 Aug** | Structural pass deployed: schema on 44 pages, `/areas/` hub, link mesh, contrast, tracking.         |
| **by 5 Sep**  | Service depth wave 1 live (roof-sealing, roof-tarring, bituminous-sheets, leak-detection).          |
| **by 15 Sep** | City depth Tier A live. First 3–6 articles live. **Last date that reliably ranks this season.**     |
| **by 30 Sep** | Service depth wave 2. Roof-type silo. GBP verified with first reviews.                              |
| **Oct–Feb**   | In-season: emergency/problem-led articles, conversion tuning, measurement. Ship, don't restructure. |
| **Feb–Apr**   | Off-season: roof-whitening depth, spring/summer articles, Tier-C city decisions.                    |

Two consequences people get wrong:

- **Roof-whitening (סיוד והלבנת גגות) is a May–August service.** Writing it in September is effort not
  spent on a page that ranks in November. Deliberately defer it to February.
- **Articles commissioned in October are next year's asset.** The window for pre-season content closes
  in mid-September.

---

## 3. Phase 0 — Unblock and stop the bleeding (this week)

Nothing here needs a single new business fact. Most of it is deletion.

| #   | Action                                                                                                                                                                                                                                                                       | Where                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 0.1 | **Reinstall the site-kit.** `rm -rf node_modules/@ishub .next out && npm install --force`. A plain `npm install` re-serves the cached stale tarball — that is the documented npm `file:` trap. Confirm `ls node_modules/@ishub/site-kit/src` shows `media` and `components`. | `package.json:16`                                                                                             |
| 0.2 | Delete the three fabricated testimonials and the `Reviews` section. Also removes the unsourced "מאות גגות יבשים" heading and the subtitle that tells visitors the reviews are samples.                                                                                       | `lib/content.ts:141-160` · `components/marketing/Reviews.tsx` · `app/page.tsx:33` · `app/reviews/page.tsx:21` |
| 0.3 | Unpublish `/gallery/` and `/blog/` — remove from `staticPaths`, `noindex`, and drop the nav/footer links. Restore each the day real content exists.                                                                                                                          | `app/gallery/page.tsx` · `app/blog/page.tsx` · `app/sitemap.ts:19-32` · `lib/content.ts:203-204`              |
| 0.4 | **Purge every rendered 🔶** — 10 pages, including inside the `FAQPage` JSON-LD. Keep the marker in `//` comments only.                                                                                                                                                       | `lib/content.ts:170` · `PricingTeaser.tsx:25` · `app/{about,pricing,privacy,terms,accessibility}/page.tsx`    |
| 0.5 | Resolve the warranty contradiction by **deletion**: drop `"עד 10 שנים"` from `trustStats` and the deferral clause from the FAQ. "אחריות בכתב" unqualified is free to state; the number is not. Also drop the "מאות" volume claim.                                            | `lib/content.ts:121,122,170`                                                                                  |
| 0.6 | Fix the doubled brand title: `"אודות גגוליין"` → `"אודות"`. The root template already appends the brand.                                                                                                                                                                     | `app/about/page.tsx:10`                                                                                       |
| 0.7 | Ship the OG image. It exists and is live on the media host (`imgquarry.com/gagoline/og.jpg`, 200, 38,603 bytes) but never reaches the HTML, so **every WhatsApp share renders a blank card** — on the channel this business runs on. Unblocked by 0.1.                       | `app/layout.tsx:2,40-45`                                                                                      |
| 0.8 | Delete the two untracked `.bak` files and add `*.bak` to `.gitignore`. One is a **runnable copy of the pre-shim deployer** — the full-upload logic that caused the 2026-07-30 partial outage — and it hardcodes a secrets path.                                              | `deploy/deploy-webdav.ps1.pre-shim.bak` · `site.config.json.bak`                                              |
| 0.9 | Send the owner request list (§13). It has the longest lead time of anything in this plan.                                                                                                                                                                                    | [owner-requests.md](owner-requests.md)                                                                        |

**Then deploy.** `powershell -File "deploy/deploy-webdav.ps1" -DryRun` first. Pushing to `main` deploys
nothing.

---

## 4. Phase 1 — Structural wins (weeks 2–4)

Free ranking signal that needs no content and no owner input. This is the highest
value-per-hour work in the plan.

### 4.1 Structured data: 2 of 44 pages → 44 of 44

Two edits do most of it:

- **Move `localBusinessJsonLd(manifest)` from `app/page.tsx:19` into `app/layout.tsx`.** Coverage goes
  from 2/44 to 44/44 for ~500 bytes a page, and it makes every future `provider: {"@id": ".../#business"}`
  reference resolve on its own page instead of pointing across pages.
- **Emit `BreadcrumbList` from `PageHeader` itself**, built from the same `crumbs` array it already
  renders, so markup and graph cannot drift. Target **42 pages** (every route except `/` and `/404`).

Three traps, all verified in the kit source:

1. `breadcrumbJsonLd` maps every crumb through an `abs()` helper that dereferences `path` — the trailing
   crumb has no `href`, so **it throws during static generation**. Widen the type and omit `item` on the
   last position.
2. `serviceJsonLd` hardcodes `areaServed` from the manifest and accepts no override, so the example in
   the `schema-structured-data` skill does not actually work. Add optional `areaServed` and
   `serviceType` params.
3. Normalise every internal href to a trailing slash **before** breadcrumbs ship (see 4.2) — `abs()`
   does no normalisation, so a crumb written `/services` emits an `item` that doesn't match the canonical.

Then: `Service` on 8 service pages, `Service` + `areaServed: City` on 23 city pages, `FAQPage` on the
homepage (six FAQs are already visible and ship in the DOM), `WebSite` on `/` (this is the node that
drives Google's site-name feature — but **no `SearchAction`**, that feature is retired).

Set expectations honestly: only breadcrumbs and `WebSite` change anything visible in the SERP. FAQ rich
results have been restricted to government/health sites since 2023, and `Service`/`CollectionPage` are
entity plumbing. Do it because it is cheap, correct, and what answer engines read.

### 4.2 Internal linking and the `/areas/` hub

**Build `/areas/`.** It returns 404 today, and one page fixes four defects: the city silo gets a root;
the nav stops pointing "אזורי שירות" at `/areas/tel-aviv` (which hands one city a sitewide link 22
others don't get); the self-referencing middle breadcrumb on all 23 city pages gets a real target; and
`CollectionPage` becomes emittable. 250+ words, cities grouped by sub-region.

- **Delete `cities.slice(0, 12)`** in `Footer.tsx:71`. Measured inbound degree excluding self-links: the
  12 footer cities carry **43** each, the other 11 carry **1**. That single `.slice()` is the whole
  imbalance.
- **Fix the two real orphans** — `/terms/` and `/blog/`, both in the sitemap with **zero** inbound
  links. (The backlog's "11 orphaned cities" claim was wrong; `ServiceAreas.tsx:17` maps all 23 on the
  homepage. Corrected in §5.8.)
- **Replace related-services `.slice(0, 4)`** with an explicit adjacency map. Measured: exterior-wall-sealing,
  roof-whitening and basement-sealing currently receive **zero** inbound links from the related module
  across all eight pages — the three weakest pages are the three the module refuses to link.
- **Add symmetric `nearby` adjacency** to cities (2–4 each, bidirectional) and a nearby-areas module.
  City→city edges are currently zero, so all 23 are graph leaves.
- **Add a `region` field** (גוש דן · השרון · דרום המרכז) and group every 23-item list by it.
- Normalise every internal href to a trailing slash. Note the backlog was wrong that this costs 301s
  today — Next normalises `next/link` at export — but it becomes live the moment breadcrumb JSON-LD ships.

### 4.3 Crawl and indexation hygiene

- **Derive the sitemap** from a typed route registry instead of the hand-maintained `staticPaths` array
  of 12, which will silently drop the next route added.
- **Kill `lastModified: new Date()`.** All 43 URLs currently carry the identical build timestamp, which
  tells Google the whole site changed on every deploy and trains it to distrust the file — exactly when
  fast recrawl matters most.
- **Break the three-way title cannibalisation** on the head term: the homepage, `/services/roof-sealing/`
  and `/areas/tel-aviv/` all chase איטום גגות. Move the homepage to `קבלן איטום גגות`, a distinct Tier-1
  term. Also write a real homepage description — it is currently the 50-character tagline.
- **Disallow the 44 `/index.txt` RSC payloads.** They return 200 with the full page copy in plain text —
  44 crawlable near-duplicates of the whole site.
- **Rebuild the 404** as a navigation page. It currently inherits the homepage title _and_
  `rel="canonical"` pointing at the homepage.
- **Emit `theme-color` and the Search Console token from the manifest** rather than hardcoding.

### 4.4 Tracking (do this before the season, or the season is unmeasurable)

- Move the GTM snippet from `<body>` into `<head>`.
- **Add the 8 missing `data-cta` attributes** — form WhatsApp, pricing CTA, both service-sidebar CTAs
  (on all 8 service pages), all three contact links, footer email. Without these you enter the peak
  unable to tell which services or cities produce calls — precisely the data that should direct the
  content budget.
- Instrument the Web3Forms **failure path** (`trackEvent('lead_fallback_whatsapp')`). Today a silent
  form outage would reroute every lead to WhatsApp with nothing on any dashboard.

---

## 5. Phase 2 — Content depth (weeks 3–10)

### 5.1 Ship the data model first

Split `lib/content.ts` into a barrel directory and add two typed maps — `serviceDepth:
Record<ServiceSlug, …>` and `cityContent: Record<CitySlug, …>`. Full `Record` types matter: with
`noUncheckedIndexedAccess`, a missing entry becomes a **typecheck failure**, which is the only
enforcement that survives a busy month.

Add a `RichText` type (`string | {href, text}`) and a `Prose` component in the same pass. Without it,
contextual in-copy links are physically inexpressible — copy lives in `content.ts` as plain strings, so
there is no way to put a link inside a sentence. That is why the site has **zero** contextual links
today, and retrofitting after 31 pages of Hebrew are written is 10× the work.

### 5.2 The order of writing

| Wave  | What                                                                                           | By      |
| ----- | ---------------------------------------------------------------------------------------------- | ------- |
| **A** | Service depth: roof-sealing, roof-tarring, bituminous-sheets, leak-detection (450+ words each) | 5 Sep   |
| **B** | City depth Tier A (350+ words each)                                                            | 15 Sep  |
| **C** | Articles 1–6 (900+ words each)                                                                 | 15 Sep  |
| **D** | Service depth: balcony-sealing, exterior-wall-sealing, basement-sealing                        | 30 Sep  |
| **E** | `/pricing/`, `/services/`, `/about/`, `/areas/` prose                                          | 30 Sep  |
| **F** | Articles 7–12 (in-season, problem-led)                                                         | Oct–Dec |
| **G** | roof-whitening depth + articles 13–18                                                          | Feb–Apr |

**Kill the shared `triggers` array first** (`app/services/[service]/page.tsx:32-37`). Four hardcoded
bullets about ceiling damp render verbatim on the **basement-sealing** and **roof-whitening** pages. A
homeowner on the basement page is told to look for stains on their ceiling — that single mismatch
destroys the diagnosis-first positioning the whole brand rests on, and fixing it is ~160 words of unique
copy across 8 pages.

### 5.3 What creates depth for this trade

The differentiating axis is **substrate and method**, not company. A reader currently cannot tell
איטום גגות from זיפות from יריעות ביטומניות. Each service page needs: substrate fit (what this method
does on בטון vs מרוצף vs רעפים vs איסכורית, and where it is the wrong choice), surface prep (the part
that decides whether it lasts and the part competitors omit), included/excluded, the weather window,
failure modes (מים עומדים, תזוזות תרמיות, UV, foot traffic, joints and pipe penetrations) and what each
looks like from inside the flat, and **"מתי זה לא הפתרון"**.

For city pages the seam is **roof stock**, which is publicly verifiable architectural fact and therefore
needs zero owner input: Bauhaus-era flat concrete decks with decades of accumulated זיפות in central
תל אביב; 1960s שיכונים with tiled roof decks in רמת גן/חולון/בת ים where lifting tiles vs sealing over
them is a real decision; new towers with membrane systems still inside a developer warranty; industrial
איסכורית through the חולון/אזור belt; red-tile pitched roofs in רעננה/הוד השרון/כפר סבא; coastal salt
exposure in נתניה and בת ים; and in בני ברק, solar-heater collector mounts penetrating the
waterproofing — a leak source routinely misdiagnosed as roof failure, genuinely citable and specific to
Israel.

Phrase roof stock as a statement about the built environment ("בבניינים מהתקופה הזו"), **never** as a
claim about work done there.

### 5.4 The answer block

Every service and city page opens with a 40–60 word answer under a question-form `<h2>`. This is the
span a featured snippet or an AI Overview lifts. The bar, fully written:

> **איך מאתרים מאיפה הנזילה מגיעה?**
> איתור נזילה מתחיל מהגג ולא מהכתם שבתקרה. אנחנו בודקים את שכבת האיטום הקיימת, את המרזבים, קירות הגדר
> והצנרת, ומבצעים בדיקת הצפה מבוקרת עד שהמים מסגירים את נקודת החדירה. מקור הנזילה כמעט לעולם אינו נמצא
> ישירות מעל הכתם, כי המים נעים על השיפועים ובין השכבות. רק כשהמקור ברור בוחרים שיטת איטום.

Answers in sentence one; carries the counter-intuitive fact that makes it worth quoting; names four
concrete inspection points; self-contained; states zero unconfirmed facts.

**Do not** ship 23 identical city answer blocks. Byte-identical blocks are worse than none — they make
the doorway pattern machine-legible exactly when retrieval bots start reading, and an extraction engine
deduplicates them anyway. Ship only the cities with something true to say.

### 5.5 `/pricing/` — the largest unblocked content win

`/pricing/` has ~35 unique words (its table is rendered identically on the homepage, so it earns no
credit). The important realisation: **the blocked fact is not the valuable content.** What a buyer
searches for is _why quotes differ_ and _what a fair quote contains_ — and every one of those drivers is
a professional-method statement the site is already free to make: roof area, substrate, how many old
layers must come off, ponding and falls, edge detailing around parapets and gutters, number of pipe
penetrations, access (stairs/crane/truck parking), and the condition of the existing layer. Add "how to
read a quote — 7 things that must appear in it" and a ועד בית section. Add the lead form.

---

## 6. Phase 3 — Trust and authority (parallel, owner-gated)

This is the site's worst dimension and its highest ROI. After Phase 0's deletions, everything remaining
is gated on the owner — which is why §13 goes out **this week**, not after the code work.

The build-side preparation that can happen now:

- Type the future `reviews` array with a **non-optional `sourceUrl`**, so an unverifiable testimonial is
  physically impossible to add. That is the code-level guard that stops this recurring.
- Type `credentials` to render nothing when a value is absent, so a missing licence renders no empty
  heading rather than a placeholder.
- Collapse the warranty claim into **one `warranty` constant** interpolated everywhere. "אחריות בכתב"
  appears 17 times across the repo as independently-worded strings — which is exactly how the
  "עד 10 שנים" vs deferred-duration contradiction arose.
- **Wire the image pipeline before the photos arrive.** `images: { unoptimized: true }` means
  `next/image` emits no `srcset`, so the first person to add a gallery photo ships a full-resolution
  original to every phone. The kit's `SiteImage` (which makes `alt=""` a compile error and always emits
  width/height) plus `srcsetFor` against the media host is the answer. Do this while there are zero
  images to migrate.
- **Issue a photo-capture protocol to the crews**: at diagnosis, one wide shot plus one detail shot of
  the stain; at completion, the same two from the same position; record the city; add a permission line
  to the quote sheet. Three jobs a week fills a six-pair gallery in a fortnight — and content-standards
  §2 accepts a real job photo as one of the three items a city page needs to pass the doorway test, so
  one instruction to the crews feeds the gallery, 8 service pages and 23 city pages simultaneously.

---

## 7. Phase 4 — Conversion and engagement

**The contrast fix is the single cheapest conversion win on the site**, and there is a version that
keeps the brand orange:

```css
/* app/globals.css:51 */
--color-accent-foreground: #0e2e4e; /* was #ffffff */
```

Measured: white on `#F5841F` = **2.56:1** (fails); navy on `#F5841F` = **5.40:1** (passes). `accent` is
the **default `Button` variant**, so one line repairs the hero call, both header calls, the form submit,
the sticky bar's left half, the entire `FinalCta` band, the `Process` step numbers and the 404 link.

**Two consequences that must ship in the same commit** — this is the trap in the obvious version of the
fix:

- Hover must **invert**, not darken: navy on `accent-600` is 4.05:1 and still fails. Use
  `hover:bg-accent-400` (`#F79D4D`) = **6.51:1**.
- `focus-visible:ring-accent` is an orange ring at 2.56:1 against the white page — it fails SC 1.4.11's
  3:1 bar for focus indicators on **every button on the site**. Change to `ring-primary` (13.82:1).

For WhatsApp: don't darken the green (`#1DA851` = 3.10:1, WhatsApp's own `#128C7E` = 4.14:1 — both still
fail). Use dark text on it: navy on `#25D366` = **6.97:1**. Promote it to a `--color-whatsapp` token
while you're there and kill the four hardcoded hexes.

Then:

- **`/pricing/` has no conversion surface at all** — verified live: zero `<form>` elements and no
  `FinalCta`. It is the highest-intent page on the site. Add both.
- **Per-field validation** with `aria-invalid` / `aria-describedby` / focus management, and Israeli
  phone validation that **accepts landlines** (`03-`, `09-`, `08-`) as well as `05X` mobiles — ועד בית
  contacts and older homeowners routinely give a landline, and rejecting them destroys real leads.
- **`/thank-you/`** as a real `noindex` route so there is a URL-based conversion to bid on. Keep
  `trackEvent` firing on confirmed success and use the pageview purely as the Ads target.
- The form's success state says "התקשרו אלינו" as **plain text with no `tel:` link** — the single
  highest-intent moment on the site, with nothing to tap.
- A consent line linking `/privacy/` (statement, not a checkbox — a checkbox suppresses submits).
- **One urgency/triage field**: "נזילה פעילה עכשיו" / "כתמי רטיבות שחוזרים" / "תחזוקה לפני החורף" /
  "פרויקט חדש", passed into the email subject and the WhatsApp prefill. During the November peak,
  calling the active-leak leads first is worth more than additional lead volume.
- **City-scoped CTAs** on the 23 area pages, which currently have no in-body call or WhatsApp link at
  all, with the city name in the WhatsApp prefill so distance can be qualified instantly.
- **A ועד בית path** — the audience is named in the brief and in an FAQ, and every conversion path
  assumes one homeowner deciding alone. A committee needs a document to circulate, not "we'll call you
  back". Segment the lead now; write the committee content when payment terms are confirmed.
- **Seasonal urgency that is true** — driven by a month helper, not a hardcoded string: you physically
  cannot seal a roof in the rain, so a homeowner who waits for a stain in November has missed the good
  window. No countdown timers, no "X slots left", no fabricated scarcity.
- **A roof-brief builder** (not a price calculator): 4 steps — roof type, area, symptom, duration —
  that outputs **no number**, produces a structured Hebrew summary, prefills the form and the WhatsApp
  message. It delivers the engagement mechanic without stating a price, which is the only version that
  can ship while all four price rows are unconfirmed.

---

## 8. Phase 5 — AEO / GEO

**The gate is worse than documented, and the sequencing conclusion is the opposite of what it looks
like.**

Measured live: the Cloudflare managed `robots.txt` sends `Disallow: /` to nine agents — _and_ a
user-agent probe returned **HTTP 403** for PerplexityBot, OAI-SearchBot, ChatGPT-User, ClaudeBot and
GPTBot on a page a desktop Chrome UA fetched with 200. Three of those five are **not** in the managed
robots list, so there is an **enforced bot rule on top of the advisory file**. Flipping only the AI
Crawl Control toggle will not open the gate. (Caveat for honesty: the probe spoofed the UA from a
residential IP and Cloudflare validates crawlers by IP, so some 403s may be "unverified bot" rather than
"AI bot blocked" — the AI Crawl Control request log distinguishes them.)

**But Google AI Overviews is grounded on the Googlebot-fetched search index, not on Google-Extended.**
Googlebot is allowed by both the managed block and `app/robots.ts`. So the largest Hebrew answer-engine
surface is **not gated on the owner's Cloudflare decision at all** — every answer block written now pays
off in November regardless. That makes the on-page AEO work P0 rather than speculative, and it means
the backlog's "every AEO item is capped" is true for ChatGPT/Perplexity/Claude and **false** for AI
Overviews. Confirm Googlebot is clean via Search Console URL Inspection.

Order of operations, which matters more than usual: **delete the placeholder content before opening
retrieval access.** Assistants cache what they fetch; opening the gate while the site attributes a
five-star quote to "לקוח/ה — להחלפה" makes that string the brand's machine-readable social proof, and
it will survive the fix.

What actually earns a citation for this trade — none of which exists today: a cost breakdown by roof
type, a זיפות vs יריעות vs אקרילי comparison table (columns: method · substrate it suits · service life
· disruption · weather window · when it is the wrong choice), how leak diagnosis really works, lifespan
data and what shortens it, and **when sealing is the wrong answer**. A source that says "sometimes you
should not buy this" is the one an answer engine reaches for.

Also: `public/llms.txt` with an explicit **do-not-attribute** section (warranty duration, rating,
licence, address, price — none confirmed); real `lastModified`; `datePublished`/`dateModified` on
articles with `author` as the **Organization** until a real person is named (schema.org permits it —
never invent a byline); and one canonical service-area sentence used identically everywhere (there are
currently three different phrasings, and with `sameAs` empty the site's internal consistency is the only
corroboration available).

---

## 9. Phase 6 — Performance, accessibility, security

**Performance is healthy** — 4.9 MB export, ~165 KB gzip JS, framer-motion already tree-shaken out of
every chunk. Don't invent problems. The two real levers:

- **Zero font preloads.** On an image-free site the LCP element is text, so the webfont swap _is_ the
  perceived load. Hashes change per build, so inject preloads in a `postbuild` script that reads the
  `-s.p.woff2` URLs out of the emitted CSS.
- **`/_next/static/` is served `max-age=14400, must-revalidate`** — content-hashed files that can never
  change, revalidated every 4 hours. `Cache-Control` is _not_ one of the five headers the edge sets, so
  this one **does** belong in `.htaccess`, scoped to `js|css|woff2` and guarded by
  `<IfModule mod_headers.c>` (an unguarded `Header` directive 500s the whole site on a host without
  `mod_headers`). Never let it reach HTML, or a delta deploy becomes invisible.

**Accessibility is the worst of the three and worse than the backlog recorded:**

- **No skip link anywhere** and `<main>` has no `id` — WCAG 2.4.1 is **Level A**, failing on all 44
  pages, while `/accessibility/` publicly claims keyboard-navigation support. This is the lowest bar in
  WCAG and the one an Israeli accessibility complaint reliably cites.
- Beyond the two CTAs: `text-secondary` (#1F8FD0) = **3.56:1** on the "read more" affordance of all 8
  service cards; the `SectionHeading` eyebrow `accent-600` = **3.41:1**, above nearly every section on
  the site. Move text uses to `secondary-600` (5.47:1) and `accent-700` (5.12:1). Leave the **icon**
  uses — they're non-text and pass 3:1 — and say so in the commit so nobody "fixes" them later.
- Form field borders at `border-gray-300` = 1.47:1 and placeholders at `text-gray-400` = 2.54:1.
- `TrustBar` announces every label twice; `/faq/` skips `<h1>` → `<h3>`.
- The mobile menu has `aria-expanded` and nothing else. Add `aria-controls`, Escape-to-close with focus
  return, and a scroll lock — but **no focus trap**: it is a non-modal disclosure, and trapping focus in
  one is itself a failure.

**Then make `/accessibility/` true again** — it currently claims "ניגודיות צבעים תקינה" and alt-text
practice on a site with zero images. A published IS 5568 conformance claim that a five-second check
disproves is a worse legal position than publishing no statement.

**Security is nearly done.** Five headers are already at the edge — **do not duplicate them in
`.htaccess`**. Only CSP is missing; ship it **report-only** at the edge, observe a week of real traffic
including one genuine form submit and one tracked call click, then consider enforcing. Plus: strip the
dead SMTP path from `.env.example` (a live template for mail credentials on a project with no server),
and record an `npm audit` disposition — **3 high, all inapplicable**: every Next advisory concerns
Middleware, Server Actions, rewrites or the Edge runtime, none of which a static export on Apache runs;
14.2.35 is already the newest 14.2.x, and npm's suggested remedy is a two-major-version jump. Write down
why each is not applicable and **never run `npm audit fix --force`**.

---

## 10. Keyword architecture — how to rank for more terms

The instinct is to multiply 8 services × 23 cities = 184 pages. **Don't.** That is the doorway pattern
and the penalty lands on the domain. More keyword surface comes from four moves, in this order:

**1. Depth on the 31 pages that already exist.** A page at ~80 words cannot rank for a competitive
commercial term. Depth on `/services/roof-sealing/` also picks up dozens of long-tail variants with no
new pages at all.

**2. The roof-type silo — the largest new-keyword surface with zero doorway risk.**
`איטום גג בטון` · `איטום גג מרוצף` · `איטום גג רעפים` · `איטום גג איסכורית` are all real query clusters
and **no page on the site targets any of them** — they exist only as a comma-separated tagline at
`lib/content.ts:29`. Four pages about four physically different roofs cannot be doorway pages. איסכורית
in particular buys a commercial/industrial searcher at a much higher ticket against far less
competition. _(Gated on confirming the crew works on all four — the site already claims all four
publicly, so a "no" is a content correction.)_

**3. `/services/` prose, so something owns `קבלן איטום גגות`.** It is a Tier-1 commercial term and no
page owns it: the homepage targets איטום גגות, `/about/` targets brand terms, and the services index is
a grid with zero body copy. Add 250+ words on how to choose a contractor, what an itemised quote
contains, and a **symptom → service decision table** (stain in the top-floor ceiling / damp at the base
of a wall / stain on the neighbour's ceiling below a balcony / damp in an external wall corner / top
floor that won't cool) — the most screenshot-able asset the site could add, mapping the reader's actual
input to the commercial page.

**4. The problem-led half of the universe**, which is where the higher-converting intent lives because
the searcher already has the leak: `נזילה בגג`, `רטיבות בתקרה`, `עובש`, `כתמי רטיבות`,
`נזילה ממרפסת לשכן`. This is the knowledge hub's job.

**City strategy.** Tier by population × age of flat-roof stock × ועד-בית density, not by proximity:

- **Tier A** (deep pages first): תל אביב · פתח תקווה · ראשון לציון · חולון · בני ברק
- **Tier B**: רמת גן · נתניה · בת ים · רחובות · הרצליה · כפר סבא · רעננה · הוד השרון · גבעתיים
- **Tier C** (decide deepen-vs-merge): רמת השרון · גבעת שמואל · קרית אונו · אור יהודה · יהוד ·
  גני תקווה · אזור · ראש העין · נס ציונה — the בקעת אונו five are candidates to fold into one cluster
  page, since one deep page beats five thin ones and בקעת אונו is a regional identity people actually use.

**Correction to an earlier claim:** נתניה (~30 km) and רחובות (~22 km) are **not** at the edge of the
50 km radius — רחובות is closer than several cities already on the list. The real constraint is
operational commitment, not distance. The distance framing was mis-classifying נתניה, a ~230k-resident
coastal city with a distinctive salt-exposure roof story, as an edge case to prune.

**Expansion candidates once all existing cities pass the doorway test** — the list currently skews north
and west and skips the ראשל״צ–לוד–רמלה corridor entirely: לוד and רמלה (~20–22 km, dense aged stock,
thin competition), מודיעין, אלעד (ועד-בית profile like בני ברק), יבנה, שוהם, and אשדוד if genuinely
served. Also a live decision: the Triangle towns (טירה, טייבה, כפר קאסם, ג׳לג׳וליה) — heavy private-villa
flat-concrete stock and almost no competing Hebrew-language contractor content.

**The service × city matrix stays capped.** If it ever opens: three services only (איטום גגות, זיפות
גגות, איתור נזילות) × Tier-A cities = ~15 cells, never 184, and only where something true and specific
exists that appears on neither parent page.

---

## 11. Target information architecture

```
/                                    homepage — RoofingContractor + WebSite + FAQPage
├── /services/                       hub · 250+ words · owns "קבלן איטום גגות"
│   └── /services/{slug}/            × 8 · 450+ words · Service + FAQPage + BreadcrumbList
├── /areas/                          NEW hub · 250+ words · cities grouped by region
│   └── /areas/{city}/               × 23 · 350+ words · Service + areaServed:City
├── /roof-types/                     NEW hub
│   └── /roof-types/{type}/          NEW × 4 · בטון · מרוצף · רעפים · איסכורית · 450+ words
├── /blog/                           hub (republish with content, not before)
│   └── /blog/{slug}/                NEW · Article + FAQPage · 900+ words
├── /pricing/  /about/  /contact/  /faq/
├── /thank-you/                      NEW · noindex · not in sitemap
├── /reviews/  /gallery/             restore when real assets exist
└── /privacy/  /accessibility/  /terms/
```

Route count: 44 today → ~41 after Phase 0 removals → ~52 once the hub, roof types and first articles
land. All slugs stay Latin ASCII — they are live and indexed, and switching to Hebrew slugs for
keyword-in-URL value would trade a real ranking signal for a marginal one and need a full 301 map at
the edge.

---

## 12. Off-site authority

With `sameAs: []` and no published address, **nothing outside this website corroborates that this
business exists.** Ranked by realistic impact for a small trade business:

1. **Google Business Profile** as a service-area business with a hidden address. It is the map pack, the
   review host, and the entity anchor that makes `sameAs` meaningful — and it has the longest lead time
   here (verification is typically 1–4 weeks, and reviews accumulate over weeks after that). A profile
   created in September has ~8 weeks to gather reviews before the rain; one created in November has none.
2. **Review acquisition mechanics**: a one-sentence WhatsApp ask sent three days after completion with
   the GBP short link, plus the same link as a QR on the completion sheet. Target ten before the season.
3. **Israeli directories that actually matter** — דפי זהב, זאפ, and trade/contractor indexes. Consistent
   NAP across all of them.
4. **Instagram/Facebook** — before/after roof content is natural for the format and doubles as the photo
   pipeline the gallery needs.
5. **Supplier/manufacturer co-marketing** — a membrane or coating manufacturer's installer list is a
   high-trust citation and a credential simultaneously.

Low-value busywork to skip: mass directory submission, reciprocal link schemes, and anything that would
require inventing a physical address.

---

## 13. Blocked on the owner — the numbered ask-list

This is the highest-value section for the business. It is maintained as a separate, sendable document:
**[owner-requests.md](owner-requests.md)** — 14 items, ordered by how many site surfaces each unblocks,
with a return-by date of **2026-09-10**.

The three with the longest lead time, which should be started this week regardless of everything else:
the **Google Business Profile**, the **before/after photos** (they arrive one job at a time), and the
**warranty document**.

---

## 14. Measurement

**Baseline as of 2026-08-17** — record it before anything changes, or the November numbers will be
unreadable against seasonal demand:

| Metric                                             | Today                                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Emitted routes / sitemap URLs                      | 44 / 43                                                                                 |
| Pages with any JSON-LD                             | **2 / 44**                                                                              |
| Pages with `BreadcrumbList`                        | **0 / 42**                                                                              |
| Pages rendering the 🔶 marker                      | **10**                                                                                  |
| Unique body words — service / city pages           | ~80 / ~90                                                                               |
| Inbound internal links — footer cities vs the rest | 43 vs **1**                                                                             |
| `data-cta` attributes in the repo                  | 9 (8+ missing)                                                                          |
| Failing contrast surfaces                          | accent 2.56:1 · WhatsApp 1.98:1 · secondary 3.56:1 · eyebrow 3.41:1 · focus ring 2.56:1 |
| Images sitewide                                    | **0**                                                                                   |
| `npm run typecheck`                                | **fails (4 errors)**                                                                    |

Then track: Search Console impressions/clicks for `{service} ב{city}` and Tier-3 question queries; GA4
key events for `lead_submit`, call clicks and WhatsApp clicks (marked as Key events, or they won't
appear as conversions); a GA4 referral segment for chatgpt.com / perplexity.ai / claude.ai /
gemini.google.com to make the AEO bet falsifiable; and the build-gate assertions as a ratchet.

**Wire the assertions into CI** so none of this regresses: the emitted-vs-sitemap count, unique titles
with the brand exactly once, one `<h1>` and one canonical per page, no internal href without a trailing
slash, no JSON-LD `item` without one, `BreadcrumbList` count, minimum inbound link degree, and — the one
that would have caught a live defect — **zero 🔶 in `out/`, using `grep -rlP '\x{1F536}'`**. A literal
`grep '🔶'` matches nothing under this shell's locale and silently passes; the naive form returned 0
while the `-P` form returned 10.

---

## 15. Risks and anti-goals

- **Do not scale pages before depth.** 184 service × city cells generated from 90-word copy is the
  fastest way to take the whole domain down, including the pages that would otherwise rank. The data-driven
  architecture makes it a five-minute change, which is exactly why the cap has to be written down.
- **Do not rewrite a placeholder — delete it.** The remedy for a fabricated review is removal, not better
  wording. A more convincing fake is the worst possible outcome of this plan.
- **Do not open AI crawler access while placeholders are live.** Assistants cache what they fetch.
- **Do not ship an enforcing CSP untested.** It kills analytics or the form silently, which on a lead-gen
  site is a revenue bug.
- **Do not duplicate the five edge-set security headers in `.htaccess`**, and never add an unguarded
  `Header` directive — it 500s the whole site on a host without `mod_headers`.
- **Do not add urgency, badges or counters while trust is damaged.** Pressure without proof makes the
  page worse.
- **Do not rename live slugs** without a 301 map at the edge.
- **Do not run `npm audit fix --force`** — the suggested remedy is a two-major-version jump that would
  rewrite the App Router APIs and the export config.
- **Do not "fix" the icon-only uses of `secondary` and `accent-600`** — they are non-text and pass 3:1.
- **Do not switch the FAQ accordion to conditional rendering.** `hidden` is what puts every answer in the
  HTML at first paint; changing it silently invalidates the `FAQPage` schema with no visible symptom.

---

## 16. Corrections to earlier documentation

Three claims in the acceptance-bar docs were measured and found wrong; all three have been corrected in
place, and are recorded here because agents cite those section numbers:

- **§1.8 (internal links pay a 301)** — false. Next normalises every `next/link` href at export under
  `trailingSlash: true`; there are zero slashless internal hrefs in `out/`. The defect is **latent**: it
  goes live the moment breadcrumb JSON-LD ships, because the kit's `abs()` helper does no normalisation.
- **§5.8 (11 orphaned city pages)** — overstated. `ServiceAreas.tsx` links all 23 cities from the
  homepage. It is a link-_depth_ imbalance (43 vs 1 inbound), not orphaning. The **actual** orphans are
  `/terms/` and `/blog/`, which the backlog never named.
- **BreadcrumbList target of 43** — wrong arithmetic (that is the sitemap count). 44 emitted − `/` −
  `/404` = **42**, matching the 13 `crumbs=` call sites exactly.

Also corrected: the "נתניה and רחובות sit at the edge of the 50 km radius" framing (§10), and the
placeholder-marker grep in both the CI workflow and the `qa-build-gate` skill, which used a form that
silently matches nothing.
