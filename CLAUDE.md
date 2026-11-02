# CLAUDE.md — גגוליין (gagoline.co.il) project rulebook

> The operating manual for any AI agent (and human) working in this repo. Project rules here
> **override** global defaults. When this file and the code disagree, fix the code. When this file and
> `brief.md` disagree about strategy or voice, **the brief wins**. When either disagrees with
> `Israeli services sites/roster/sites/gagoline.json` about a business fact, **the roster wins**.

---

## 1. Business context

- **Business:** גגוליין (Gagoline) — roof **waterproofing / sealing** (איטום גגות). Founded **2014**
  (`foundedYear: 2014` in the manifest — "מאז 2014" is a confirmed fact, not a claim).
- **Phone (click-to-call):** `03-3829118` · WhatsApp `055-6601006` (**a different line** — the phone is a landline, so WhatsApp stays on the shared fleet mobile) · `info@gagoline.co.il`.
- **Service area:** תל אביב והמרכז, up to a ~50 km radius. 23 location pages, 8 service pages.
- **Audience:** private homeowners (35–65), ועדי בתים / shared buildings, property managers, commercial
  buildings.
- **Positioning — diagnosis first:** find the **source** of the leak, seal it with advanced materials,
  give a **written warranty**, quote a **transparent price**. Out-modernize the veteran competitors
  rather than out-aging them.
- **Voice reference:** _"לפני שאנחנו אוטמים — אנחנו מבינים מאיפה הנזילה מגיעה."_
- **Conversion goals, in order:** (1) phone call, (2) WhatsApp, (3) lead form. Every page keeps a call
  and a WhatsApp action within reach; the mobile CTA bar is sticky.
- **The season sells.** Demand spikes with the first rain. Content that must rank in November has to be
  published and crawled by September.

> ℹ️ **Images are illustrations, never evidence (owner decision 2026-10-28).** Every content page
> carries two or more images: AI renderings made through the Media Studio page-images toolkit (some
> with the two consented technicians, ניסים and שימי) and the four gallery images the owner supplied
> on 2026-08-27, which were AI-made too. One site-wide note discloses them; no image is a record of a
> job. The decision, its limits and the consent record are in
> [docs/business-facts.md](docs/business-facts.md) §A ("Resolved 2026-10-28"); the rules are §14
> below. The placeholder testimonials, empty gallery tiles and "coming soon" blog that this note used
> to describe were deleted on 2026-08-17 — content-standards §6 keeps the worked example.
> **Removing a placeholder is always correct; rewriting one is not.**

---

## 2. Golden rules

1. **Never fabricate a business fact.** Warranty terms, prices, volumes, licences, insurance, ratings,
   reviews, customer names, hours. If it is not in the roster manifest, `lib/site-config.ts`, or
   `lib/content.ts` as confirmed, mark it `// 🔶 confirm` and add a row to
   [docs/business-facts.md](docs/business-facts.md). A fabricated review is a Google policy violation,
   not a style problem. **Images are illustrations, never evidence (owner decision 2026-10-28).** A
   rendering shows how a kind of work looks; the rule is on the **words** around it — no alt,
   caption, heading or paragraph may present an image as a specific job, city, date, customer, מ״ר,
   rating, price or duration, and ביצענו never sits next to a picture or a link to `/gallery/`.
   What stays forbidden: a certificate, licence, insurance document, rating, star badge, review or
   before/after pair inside an image; generated text, plates, house numbers or logos in frame; any
   person other than the two consented technicians; a third party's branding. Renderings never go
   into `og:image`, JSON-LD or the Google Business Profile. The watermark is composited after
   generation, never drawn by the model. The four supplied gallery images are owner-supplied AI, not
   "verified real". `scripts/images/check-images-out.mjs` enforces the machine-checkable half of this
   (§8, §9); the toolkit's two judges, the `image-qa-reviewer` agent and the owner's review board are
   the rest.
2. **A 🔶 must never reach a visitor.** The marker is an internal signal. If a surface can't be filled
   with something true, remove or `noindex` the surface — don't ship the marker. Clean since
   2026-08-17, and `seo-assert` fails the build on a rendered marker. **An image whose manifest
   status is not `approved` is a 🔶:** it renders only under `IMAGES_DRAFT=1`, which writes
   `out/.images-draft` and `out/.live-draft` so the hub's deploy script refuses the build.
3. **Never edit `site.config.json` directly.** It is synced downstream from
   `Israeli services sites/roster/sites/gagoline.json`. Edit the roster, then sync. The file says so in
   its own `_comment`.
4. **Pushing to `main` does not deploy.** Production is **Cloudflare Pages, direct upload via
   wrangler**, driven by the hub's `ops/deploy-site.ps1 -Domain gagoline.co.il`. See §10.
   `deploy/deploy-webdav.ps1` and `public/.htaccess` are **dead artifacts of a previous cPanel host** —
   do not use them (verified 2026-08-17: the WebDAV docroot is no longer served).
5. **No page ships under the content bar in [docs/content-standards.md](docs/content-standards.md).**
   A location or service page a find-and-replace could regenerate is a doorway page. All 23 location
   pages currently are one.
6. **Business facts come from `lib/site-config.ts`, never hardcoded in components.** Import
   `siteConfig`, `services`, `cities`, `telHref`, `whatsappHref`. Copy comes from `lib/content.ts`,
   never typed into JSX.
7. **Don't touch `components/ui/EmailAddress.tsx` without reading its header.** Cloudflare Scrape
   Shield email obfuscation is **on** for this zone and rewrites any `mailto:` it finds into a 404 URL.
   The `email_off` / `email_on` HTML comments are what keep the business email working (commit
   `ac48484`). It looks like over-engineering; it isn't.
8. **A GTM snippet in the HTML proves nothing.** Whenever a container id changes, assert
   `https://www.googletagmanager.com/gtm.js?id=<ID>` returns **200**. Two fabricated ids once cost the
   IL fleet 18 days of zero analytics across every site.
9. **Never edit generated or vendored output** — `node_modules/`, `.next/`, `out/`, and
   `content/images/manifest.json` (written by the Media Studio toolkit, §14).

---

## 3. Stack

Next.js **14.2** App Router · React **18** · TypeScript strict (**`noUncheckedIndexedAccess` is on**) ·
Tailwind **v4** (CSS-first `@theme` in `app/globals.css` — there is no `tailwind.config.ts`) ·
`lucide-react` · `clsx` + `tailwind-merge` via `cn()` · `@ishub/site-kit` (hub tarball).
Flat layout (no `src/`), path alias `@/* -> ./*`.

**`next.config.mjs` — the constraints that shape everything:**

```js
output: "export",          // static HTML into out/
trailingSlash: true,       // every URL ends in /
images: { unoptimized: true },
transpilePackages: ["@ishub/site-kit"],
```

**Static export forbids** `headers()`, `redirects()`, `rewrites()`, middleware, API routes, server
actions and ISR. Because the host is **Cloudflare Pages**, response headers come from
`public/_headers` and redirects from `public/_redirects` — both are live features here, and neither
file exists yet. `public/.htaccess` is inert (previous host) and Apache serves nothing for this site.

> Corrected 2026-08-17. This section previously said the opposite — that `_headers`/`_redirects` did
> nothing and headers came from `.htaccess`. That was inferred from the leftover cPanel tooling in
> `deploy/` and cost a misdirected production deploy. The roster is authoritative:
> `hosting.target: "cloudflare-pages"`, `pagesProject: "gagoline"`.

**Route slugs are Latin ASCII** (`/services/roof-sealing/`, `/areas/tel-aviv/`) with Hebrew display
names. Unlike the fleet's Hebrew-slug sites, there is no percent-encoding trap in the dynamic routes
and `app/sitemap.ts` needs no `encodeURI`. The slugs are live and indexed — renaming one needs a 301.

---

## 4. Layout

```
app/
  layout.tsx              # metadata, fonts, GTM, <html lang="he" dir="rtl">
  page.tsx                # homepage — RoofingContractor + WebSite + FAQPage JSON-LD
  sitemap.ts robots.ts    # /sitemap.xml (derived from app/ + the data arrays), /robots.txt
  llms.txt/route.ts       # /llms.txt, generated from the same arrays
  not-found.tsx           # 404
  services/               # index + [service] × 8
  areas/                  # hub (shipped 2026-08-24) + [city] × 23
  blog/                   # index + [slug] × 8 guides (content/articles/)
  about/ contact/ pricing/ faq/ reviews/ gallery/ thank-you/
  privacy/ accessibility/ terms/
components/
  ui/          Button Container Section SectionHeading Reveal EmailAddress Prose Figure
  layout/      Header Footer PageHeader MobileCtaBar
  marketing/   Hero TrustBar FieldStrip ServicesGrid WhyUs TeamTeaser Process
               PricingTeaser ServiceAreas Faq FinalCta
  forms/       LeadForm
  blog/        ArticleBody
lib/
  site-config.ts   # ⭐ NAP, services[8], cities[23], telHref, whatsappHref
  content.ts       # ⭐ all Hebrew copy, incl. imagesNote (the site-wide image disclosure)
  service-depth.ts city-depth.ts article-jsonld.ts
  images.ts        # manifest validator + imagesFor/imageFor/stripFor/galleryServiceNames; honours IMAGES_DRAFT
  utils.ts         # cn()
content/
  articles/        # the 8 guides (typed blocks, incl. { kind: "figure" })
  images/          # plan.json — authored slot plan · manifest.json — toolkit-written, never hand-edited
  live/            # live-surface registers (§13)
  revisions.ts     # per-section lastModified
public/images/     # approved images, tracked — never deleted or renamed casually (§14) · _candidates/ gitignored
assets/images/     # masters/ and review/ for this PC (gitignored); README.md tracked — the provenance history
scripts/
  seo-assert.mjs font-preload.mjs keep-previous-assets.mjs link-graph-check.mjs contrast-check.mjs ai-crawler-check.mjs
  images/          # check-images-out.mjs (postbuild gate) · images-status.mjs · images-dev.mjs · lib/imageinfo.mjs
  live/            # live-kit copies (byte-locked, §13)
site.config.json   # SiteManifest — SYNCED FROM THE ROSTER, do not edit here
brief.md           # the strategy/intake document this site was built from
docs/              # the acceptance bars every agent cites
deploy/            # dead WebDAV deploy shim (§10) — kept until deletion is confirmed
```

Place by responsibility: reusable presentation primitive → `ui/`; page section → `marketing/`;
structural chrome → `layout/`.

**Route count: 54 emitted, 51 in the sitemap** (2026-10-14; the difference is `/404/` plus the two
noindexed routes, `/reviews/` and `/thank-you/`).

---

## 5. Data flow & source of truth

```
Israeli services sites/roster/sites/gagoline.json   ← EDIT HERE for NAP/brand/schema/analytics
        │  (ops sync)
        ▼
site.config.json  (SiteManifest)                   ← never edit directly
        │
        ▼
lib/site-config.ts   manifest · siteConfig · services[8] · cities[23] · telHref · whatsappHref
        │
        ├── lib/content.ts     serviceCards · differentiators · processSteps · trustStats
        │                      priceRows · faqs · navItems · imagesNote · galleryContent
        │
        ├── content/images/plan.json      ← authored here (image-art-director); the toolkit only READS it
        │       │   Media Studio page-images: brief → the owner's yes → generate → qa → alt → finish → stage / install
        │       ▼
        ├── content/images/manifest.json  ← WRITTEN BY THE TOOLKIT (status · alt · caption · provenance); never hand-edited
        │       ▼
        ├── lib/images.ts      validates at module init · imagesFor(route, slot) · honours IMAGES_DRAFT=1
        ▼
app/**/page.tsx  →  components/**   (Figure · FieldStrip · TeamTeaser render every content image)
```

Rule of thumb: **identity and NAP go up the chain to the roster; wording goes in `lib/content.ts`;
layout goes in components.** Copy never gets typed directly into JSX —
`app/services/[service]/page.tsx:32-37` and `app/about/page.tsx:14-21` both break this today and are
listed in the backlog, not treated as precedent. Image pixels and provenance come from the Media
Studio toolkit through the manifest; the slot plan is authored here; an image's alt and caption live
in the manifest — the one visitor-facing text outside `lib/content.ts`, which is why `lib/images.ts`
validates it.

---

## 6. RTL & localization — NON-NEGOTIABLE

- `<html lang="he" dir="rtl">` is set in `app/layout.tsx`. Do not remove it.
- Israeli formats: phone `0XX-XXX-XXXX`, currency `₪` after the number, dates `dd/mm/yyyy`.
- **Logical Tailwind utilities ONLY** for horizontal spacing/positioning: `ps-*`/`pe-*`, `ms-*`/`me-*`,
  `start-*`/`end-*`, `text-start`/`text-end`, `space-x-reverse`.
  **BANNED:** `pl-* pr-* ml-* mr-* left-* right-* text-left text-right`. The only exception is a
  genuinely direction-agnostic case, which must carry an explanatory comment.
- Let `dir="rtl"` mirror flex/grid — don't force `flex-row-reverse` except to wrap an LTR island.
- Latin/LTR snippets inside Hebrew (phone, email, URL, price) get `dir="ltr"` and the `.ltr` helper
  from `app/globals.css`.
- Hebrew punctuation: use גרש `׳` and גרשיים `״` — `ק״מ`, `מ״ר` — not straight ASCII quotes.
- Keep user-facing strings Hebrew. Don't mix languages mid-sentence.

See the `hebrew-rtl` skill for the full rule set.

---

## 7. Code style

- **TypeScript strict.** No `any` (use `unknown` + narrowing). No non-null `!` to silence the
  compiler — handle the null case. `noUncheckedIndexedAccess` means indexed reads are `T | undefined`;
  narrow them.
- **RSC by default.** Add `"use client"` only for state, effects, or browser APIs. Keep client
  components small and leaf-level. Currently client: `Header`, `Faq`, `LeadForm`, `Reveal`.
- Imports use the `@/*` alias. No `../../..` chains.
- Compose conditional classes with `cn()` from `@/lib/utils`.
- Tailwind utilities only, **mobile-first**. Use the `@theme` tokens (`primary`, `secondary`,
  `accent`, `font-heading`, `font-sans`) — **never hardcode a brand hex in a component**. (The
  WhatsApp green `#25D366` currently is hardcoded in four places; it belongs in the theme.)
- Components PascalCase; hooks `useXxx.ts`; utilities camelCase.

---

## 8. SEO, schema, accessibility

- **One `<h1>` per page**, matched to search intent. Everything else `<h2>`/`<h3>`, no skipped levels.
- **Titles:** the root `template` in `app/layout.tsx:33` already appends `| גגוליין`. A page's own
  `title` must therefore **never append the brand again** — `app/about/page.tsx:10` does, and it is the
  one live doubled title. See the `seo-metadata` skill.
- **Canonicals:** self-referencing, with the trailing slash, byte-identical to the `sitemap.xml`
  `<loc>`. `seo-assert` runs in `postbuild`, so a deploy that builds (not `-DeployOnly`) stops unless
  every content page carries exactly one canonical, inside `<head>`, equal to
  `https://gagoline.co.il<route>`, and the sitemap and the canonicals name the same URLs. `/404/` is
  exempt: it inherits the root canonical, harmlessly (noindex; `/404/` itself answers 200, real misses
  answer 404). **Google's choice is a separate fact, and a deploy can break it.** URL Inspection on
  2026-10-13 (last crawl 2026-10-07) reports the homepage as "Duplicate without user-selected
  canonical", Google canonical `https://www.747live.bet/` (a casino site), although the tag has been
  in the code since `f2a6eec` (2026-07-30) and was in the build Google crawled. By Google's own
  definitions, the copy it processed had no canonical. **Leading explanation, unproven:** a render
  made after a deploy had deleted chunks the crawled HTML needed. If Google still held the old
  runtime but not the layout chunk, Next would render its default "Application error" page (no
  title, meta or canonical; the same line on every site on this Next version), and Google clusters
  identical pages across sites. That state reproduced 6 of 6 times locally on 2026-10-14. Against the
  live export as served (runtime gone too), the page rendered normally 5 of 5 times, and the theory
  also needs a render at least 5 days after the 10-07 crawl. A Sept 2026 case (SEJ, 2026-09-18)
  showed the same symptom; Google's Mueller called the shared-error-page explanation "an option".
  `scripts/keep-previous-assets.mjs` closes this path from the next building deploy on (§10).
  Backlog §1.1.
- **JSON-LD** is built with `@ishub/site-kit/seo` — `localBusinessJsonLd`, `serviceJsonLd`,
  `faqJsonLd`, `breadcrumbJsonLd`, `jsonLdScript`. Target graph:
  [docs/schema-graph.md](docs/schema-graph.md). Every emitted page carries JSON-LD (54/54 on the
  2026-10-18 export; `BreadcrumbList` on 52 — all but `/` and `/404/`). `Review`/`AggregateRating`
  ship **only** when sourced, and no image ever enters the graph (§14).
- **Images (§14).** Exactly one `priority` image per page and it is the first content image in DOM
  order; everything else `loading="lazy" decoding="async"`. `width`/`height` mandatory and equal to
  the file's true pixels. Hebrew `alt` describing only what is in frame — 20–200 chars, no
  `תמונה של`, no city name, no 4-digit year, no digits before מ״ר/מ״מ, no לפני ואחרי, no rating
  words, no הדמיה/AI (the disclosure is site-wide), no ASCII quote touching a Hebrew letter, never a
  first name; captions the same, first names only when every placement is `/about/`. The three
  disclosure markers `data-images-notice="footer|gallery|about"` must be present. No `/images/`
  path inside any `application/ld+json` or `og:image`. A published `public/images/*` file is never
  deleted or renamed casually (§10, §14). `scripts/images/check-images-out.mjs` asserts all of this
  on `out/`; the `page-imagery` skill carries the full list. Below 640 px a phone loads the 720-px
  copy through `<picture>` (`-w720.webp`, about 39 KB against 136 KB); the gate fails an approved
  image without one.
- **Accessibility target: WCAG 2.1 AA + IS 5568**, and `/accessibility/` publishes a conformance
  statement — so a contrast failure makes a published statement false. The accent CTA is at **2.56:1**
  and the WhatsApp CTA at **1.98:1** against white. See the `responsive-accessibility` skill.

---

## 9. Build gate

```
npm run lint && npm run typecheck && npm run format:check && npm run build && npm run images:check
```

All five must pass before any deploy (`npm run gate` runs them plus `seo:assert`, `links:check` and
`contrast:check`). The `qa-build-gate` skill adds the output assertions on `out/` (route count, unique
titles, one H1, canonicals, JSON-LD presence, sitemap parity, no placeholder markers, no oversized
chunks, and the image assertions of §14). The build's `postbuild` runs `font-preload` →
`check-live-out` → `seo-assert` → `check-images-out` → `keep-previous-assets`; a failure in
`seo-assert` or `check-images-out` fails the build and so stops `ops/deploy-site.ps1` (§10).

---

## 10. Deploy — read this before shipping

**Production is Cloudflare Pages, direct upload via wrangler. Pushing to `main` deploys nothing.**

Project `gagoline`, serving `gagoline.pages.dev`, `gagoline.co.il` and `www.gagoline.co.il`.

```powershell
# preview — builds nothing, changes nothing, and runs the drift check
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/deploy-site.ps1" -Domain gagoline.co.il -DryRun

# execute — only when the user asks
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/deploy-site.ps1" -Domain gagoline.co.il -Confirm
```

The script resolves the Pages project from the roster, runs a **drift check** against the Cloudflare
API to confirm that project actually serves this domain, busts the two staleness traps (npm caches
`file:` tarballs; Next caches under `.next/`), gates the output, preserves `out.prev/` for rollback,
and logs to `logs/deploys.csv`.

> ⚠️ **`deploy/deploy-webdav.ps1` is dead. Do not run it.** It targets a cPanel Web Disk whose docroot
> is no longer served. On 2026-08-17 it uploaded 106 files and reported "106 ok, 0 failed" while
> changing nothing the public could see. `public/.htaccess` is dead for the same reason. Both are
> kept only until someone confirms they can be deleted. The drift check in `ops/deploy-site.ps1` is
> the guard that makes the Pages path safe; the WebDAV path has no equivalent.

**Deploying is a production mutation — always ask first.** See the `deploy-gagoline` skill.

Because Cloudflare proxies the zone, several things are true and easy to forget — verified live on
2026-08-16/17 and written up in [docs/cloudflare-runbook.md](docs/cloudflare-runbook.md):

- **`/robots.txt` is not necessarily what `app/robots.ts` emits.** Cloudflare can prepend a managed
  block at the edge, and on 2026-08-16 it sent `Disallow: /` to every major AI crawler with a bot rule
  returning **403** on top of it. **Re-verified live 2026-08-31: both are gone** — the served file
  carries the fleet allow list and all six probed AI agents return 200. The lesson stands even though
  the block does not: **the served file is the only evidence.** `curl` it; never infer it from
  `app/robots.ts`.
- **Five security headers are already served** (HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) with no `public/_headers` in the repo. Only CSP is missing.
  Find out whether they come from Pages defaults or a Transform Rule **before** adding `_headers`, or
  you will duplicate them.
- **`www.gagoline.co.il` serves a full 200 copy** — both hostnames are bound to the same Pages project.
- **Scrape Shield rewrites email addresses**, which is why `EmailAddress.tsx` exists (§2, rule 7).
- **A deploy is not verified until the live site proves it.** Re-fetch and diff; the deployment URL
  updates before the custom domain does.
- **A Pages deploy replaces every file, but Google renders crawled HTML later, from a queue.** Until
  2026-10-14 each deploy deleted the previous build's hashed chunks, and a late render could then
  break (§8). `scripts/keep-previous-assets.mjs` (postbuild) keeps every build's `/_next/static`
  files in the gitignored `.static-archive/` and carries them into each export for 60 days **after
  that build stopped being the newest/live export** (it records each build's own files in
  `.static-archive/.builds.json`; `out.prev/` counts as live until the deploy that rotates it out).
  Never delete `.static-archive/` — a fresh clone or another machine starts it empty. Three gaps,
  all in the hub's `ops/deploy-site.ps1`, not this repo: `-DeployOnly` skips postbuild (no gate, no
  carry); the printed rollback `wrangler pages deploy .out.prev` ships without the newest build's
  chunks (run `robocopy out_nextstatic out.prev_nextstatic /E /XC /XN /XO` first); and a
  local build that was never deployed is archived and shipped too (harmless JS/CSS, but to purge
  one, delete its files from `.static-archive/`, `out/` and `out.prev/` and redeploy).
- **Never delete or rename a published `public/images/*` file as part of a deploy or a rollback.**
  Crawled HTML, Google Images and shared links keep the URL. Replacement is a new slug plus a
  `retired` date on the old entry, file kept ≥ 60 days (§14). `keep-previous-assets` does not cover
  `/images/` and does not need to — the URLs are stable.
- **A draft build must never ship.** `IMAGES_DRAFT=1` writes `out/.images-draft` and
  `out/.live-draft`; the hub's `deploy-site.ps1` refuses an `out/` holding either marker or a
  leftover `out/images/_candidates/` (`Test-OutDir`), and never keeps one as `out.prev/`
  (`Test-DraftExport`). If either file is in `out/`, rebuild without the variable before anything
  else.

---

## 11. Commands

| Task             | Command                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| Dev server       | `npm run dev`                                                               |
| Draft dev server | `npm run dev:images` (`next dev` with `IMAGES_DRAFT=1` — candidates render) |
| Production build | `npm run build`                                                             |
| Lint             | `npm run lint`                                                              |
| Type-check       | `npm run typecheck`                                                         |
| Format / check   | `npm run format` · `npm run format:check`                                   |
| Image gate       | `npm run images:check` (= `node scripts/images/check-images-out.mjs out`)   |
| Image coverage   | `npm run images:status` (plan vs manifest per route)                        |
| Full gate        | `npm run gate`                                                              |

---

## 12. Scope guardrails

- Implement real UI, sections, or content only when asked. Don't opportunistically redesign.
- Don't add a 24th city until all 23 pass the doorway test in
  [docs/content-standards.md](docs/content-standards.md).
- Don't add dependencies without a reason that survives "can the platform already do this?"
- `sharp` and the image toolkit live in Media Studio `page-images/` (its own `package.json`), never
  here. `scripts/images/lib/imageinfo.mjs` reads image headers without a dependency; keep it that way.
- Don't put PII in `dataLayer`.
- Cloudflare zone settings (AI crawler policy, Scrape Shield, cache rules) and cPanel configuration are
  **the owner's to change**. Document the exact toggle; never assume it was done.

## 13. Live surfaces — the announcement bar, the seasonal card, the updates strip

Fleet live-kit (owner decision 2026-10-11; canonical in
`../3locksmiths.co.il/fleet/live-kit/`, see its README). Every page carries a thin announcement
bar above the header (not sticky) whose line is chosen before first paint by the Israeli calendar
— memorial days and fasts silence it, Shabbat and chag silence the seasonal lines — and by the
fleet status switch (`https://imgquarry.com/status/fleet.json`: quiet / reduced / off). One
seasonal card (a native `<dialog>`, the pilot's rules: 2nd page or 20 s + scroll, never from
search, once per 14 days, never on calm or no-card pages, never over the open mobile menu). The
homepage shows an updates strip after the answer block; it hides itself 45 days after the
newest item.

- **Edit here:** `content/live/_campaigns.mjs` (lines, windows, the card) and
  `content/live/_updates.mjs` — wording only from sentences the site already shows, each quoted
  in `source`; nothing 🔶, and never a line quoted from `content/images/` (an AI caption is not a
  sentence the site asserts — `live.config.mjs` lists it under `forbiddenSources`). Calm / no-card
  pages and this site's own ⛔ claim stems: `live.config.mjs`. Both registers need the owner's
  `approved: "YYYY-MM-DD — who, how"`, or the build fails (`LIVE_DRAFT=1 npm run build` previews a
  draft locally only).
- **Never edit:** `lib/live/**`, `scripts/live/**`, `public/assets/live.js`,
  `content/live/_calendar*.json`, `live-kit.lock.json` — byte-locked kit copies;
  `scripts/live/check-live-copy.mjs` fails the build if they change. Fix the kit upstream and
  re-sync.
- **Gates:** `prebuild` = check-live-copy → check-live-register → check-live-schedule;
  `postbuild` = font-preload → check-live-out → seo-assert → check-images-out → keep-previous-assets
  (the built pages must carry exactly what the registers say). `links:check` strips the live regions
  as chrome.
- **Popups:** gagoline had no written rule against them; the card is the owner's 2026-10-11
  fleet decision and never stacks a second sticky surface (it is modal and short-lived).

## 14. Page images — renderings under one note

**Owner decisions, 2026-10-28** (the record, with the consent and the limits:
[docs/business-facts.md](docs/business-facts.md) §A):

| #   | Decision                                                                                                                                                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Disclosure:** one site-wide Hebrew note — the gallery intro, a footer line on every page, an about line. No per-image label. Alt and captions never claim a specific job, city, date, customer, מ״ר, rating, price or duration                                |
| 2   | **Technicians:** ניסים (manager) and שימי both consented; faces shown; **first names only**, and only in captions on `/about/`. Never a surname, never a name in `alt` or in a file name. Consent record: `Media Studio/refs/gagoline/CONSENT.md` (outside git) |
| 3   | **Gallery:** the four owner-supplied images stay first; generated scenes follow under the note                                                                                                                                                                  |
| 4   | **Scope:** 48 content pages. Not `/privacy/ /terms/ /accessibility/ /404/ /thank-you/ /reviews/`                                                                                                                                                                |
| 5   | **The four supplied images were AI-made.** Everywhere: "owner-supplied, AI-made" — never "verified real"                                                                                                                                                        |
| 6   | **Homepage top:** a 3-image strip directly under the hero; the hero stays text + lead form                                                                                                                                                                      |
| 7   | **Spend:** Media Studio's Gemini key; `gemini-3-pro-image` for frames with people (`gemini-nano-banana-2.1` without); hard cap US$50                                                                                                                            |

Defaults, changeable without the owner: renderings never in `og:image`, JSON-LD or the Google
Business Profile; no IPTC/C2PA marker (`metadataLabel: false`; Google's SynthID stays in the pixels
and is never tampered with); a harness only near an unguarded edge, no hard hats or hi-vis indoors,
plain navy polos, no plates, no customers; ניסים is "manager", never inferred to be the founder.

**The pipeline in one paragraph.** `content/images/plan.json` (authored by `image-art-director`:
subject, Hebrew context, people/phase/season rotation, never a city in a file name) → the Media Studio
toolkit, `cd "C:/Users/robiu/antigravity/Projects/Media Studio"` then
`node page-images/cli.mjs <cmd> --site gagoline`: `plan lint` → `brief` (prompts with
`approved: null`) → `digest` (one page for the owner) → the owner's **yes in chat** →
`approve --batch <sha8> --by "owner in chat"` → `qa --calibrate` once → `generate` (idempotent, every
paid call in the ledger, refused past the cap) → `qa` (deterministic checks + two vision judges; a HARD code from
either rejects, except `impossible`, `unsafe-edge`, `wrong-trade` and `foreign`, which need both
judges or one at confidence ≥ 0.8; SOFT codes need both) → `alt` (Hebrew alt + caption from the finished
pixels) → `finish` (exact slot box, logo bottom-right, WebP q80) → `stage` (candidates into
`public/images/_candidates/` plus `candidate` manifest entries) → **review** (`npm run dev:images`
and the board at `http://localhost:4310`, each card linking to `#img-<id>` on the real page; the
`image-qa-reviewer` agent checks every frame first, and again for any frame re-rendered after
that: on gagoline the judges passed 13 of 93 frames a reviewer sent back) → `install` (approved → `public/images/<group>/`,
rejected deleted from `_candidates/`, regenerate queued) → `node page-images/tools/phone-copies.mjs
--site gagoline` (the phone copy of each new image) → `npm run images:status` → `npm run gate`
→ deploy (ask) → the post-deploy image checks in the `deploy-gagoline` skill. Every command prints
its plan with `--dry-run`. Full runbook: skill `page-images-pipeline`. The contract every path, slot
id, text and command obeys: `Media Studio/page-images/docs/contract.md`.

- **`IMAGES_DRAFT=1`** (read in RSC at build/dev time, like `LIVE_DRAFT`) renders `candidate`
  entries from `/images/_candidates/` with a «טיוטה — ממתין לאישור» badge. Without it only `approved`
  entries render and `_candidates/` is pruned from `out/`. A draft build writes `out/.images-draft`
  **and** `out/.live-draft`; never ship one.
- **Edit here:** `content/images/plan.json` (the slot plan); alt and captions on the board or, for
  `candidate` entries, the two text fields in the manifest; the disclosure texts `imagesNote` in
  `lib/content.ts` only with the owner's word. **Never edit by hand:** the manifest's structure,
  `status`, `approved` or `provenance` (the toolkit writes them; `lib/images.ts` and the gate validate
  them), anything under `public/images/`, `site.config.json` or the roster for an image.
- **Install** means the toolkit's `install`; nothing else moves a file into `public/images/`. A file
  there without a manifest placement fails `images:check` as a stray.
- **Retire, never delete.** Replacement = a new slug + `retired: "YYYY-MM-DD"` on the old entry; the
  old file stays ≥ 60 days, then goes in one commit with its entry. Revoked consent = a people-free
  twin at the same box, swapped the same way, the refs deleted the same day, live removal within 14
  days of written notice. Live removal covers every public copy (full file, `-w720` phone copy,
  thumbnail): that promise to the person beats the 60-day keep. `revoked: "YYYY-MM-DD"` on the retired
  entry makes the gate require those files gone instead of kept.
- **Fleet reuse.** The toolkit is site-agnostic; the per-site policy (faces, names, proof of work,
  disclosure, excluded routes) lives in `Media Studio/sites/<slug>/site.json`. Onboarding the next
  site: `Media Studio/runbooks/page-images-for-a-site.md` and that project's skill `page-images`.
  `sharp` and the toolkit code live there, never here; this repo keeps the plan, the manifest, the
  approved files, `lib/images.ts`, the three components and the gate.
