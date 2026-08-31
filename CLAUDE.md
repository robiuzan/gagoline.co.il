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

> ⚠️ **Placeholder content is live right now.** Three invented testimonials render on `/` and
> `/reviews/`, six empty tiles on `/gallery/`, and a "coming soon" `/blog/` sits in the sitemap — all
> four with a visible 🔶 in the shipped copy. See [docs/business-facts.md](docs/business-facts.md) §A
> and the backlog §7. **Removing a placeholder is always correct; rewriting one is not.**

---

## 2. Golden rules

1. **Never fabricate a business fact.** Warranty terms, prices, volumes, licences, insurance, ratings,
   reviews, customer names, hours. If it is not in the roster manifest, `lib/site-config.ts`, or
   `lib/content.ts` as confirmed, mark it `// 🔶 confirm` and add a row to
   [docs/business-facts.md](docs/business-facts.md). A fabricated review is a Google policy violation,
   not a style problem.
2. **A 🔶 must never reach a visitor.** The marker is an internal signal. If a surface can't be filled
   with something true, remove or `noindex` the surface — don't ship the marker. Four pages break this
   today.
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
9. **Never edit generated or vendored output** — `node_modules/`, `.next/`, `out/`.

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
  page.tsx                # homepage — RoofingContractor JSON-LD
  sitemap.ts robots.ts    # /sitemap.xml, /robots.txt
  not-found.tsx           # 404
  services/               # index + [service] × 8
  areas/[city]/           # 23 pages (no /areas/ index — see backlog §5.5)
  about/ contact/ pricing/ faq/ reviews/ gallery/ blog/
  privacy/ accessibility/ terms/
components/
  ui/          Button Container Section SectionHeading Reveal EmailAddress
  layout/      Header Footer PageHeader MobileCtaBar
  marketing/   Hero TrustBar ServicesGrid WhyUs Process Reviews
               PricingTeaser ServiceAreas Faq FinalCta
  forms/       LeadForm
lib/
  site-config.ts   # ⭐ NAP, services[8], cities[23], telHref, whatsappHref
  content.ts       # ⭐ all Hebrew copy
  utils.ts         # cn()
site.config.json   # SiteManifest — SYNCED FROM THE ROSTER, do not edit here
brief.md           # the strategy/intake document this site was built from
docs/              # the acceptance bars every agent cites
deploy/            # the WebDAV deploy shim
```

Place by responsibility: reusable presentation primitive → `ui/`; page section → `marketing/`;
structural chrome → `layout/`.

**Route count: 44 emitted, 43 in the sitemap** (the difference is `/404/`, correctly excluded).

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
        │                      priceRows · testimonials · faqs · navItems
        ▼
app/**/page.tsx  →  components/**
```

Rule of thumb: **identity and NAP go up the chain to the roster; wording goes in `lib/content.ts`;
layout goes in components.** Copy never gets typed directly into JSX —
`app/services/[service]/page.tsx:32-37` and `app/about/page.tsx:14-21` both break this today and are
listed in the backlog, not treated as precedent.

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
  `<loc>`. All 44 routes have one — don't regress it.
- **JSON-LD** is built with `@ishub/site-kit/seo` — `localBusinessJsonLd`, `serviceJsonLd`,
  `faqJsonLd`, `breadcrumbJsonLd`, `jsonLdScript`. Target graph:
  [docs/schema-graph.md](docs/schema-graph.md). Only **2 of 44** pages emit any schema today.
  `Review`/`AggregateRating` ship **only** when sourced.
- **Accessibility target: WCAG 2.1 AA + IS 5568**, and `/accessibility/` publishes a conformance
  statement — so a contrast failure makes a published statement false. The accent CTA is at **2.56:1**
  and the WhatsApp CTA at **1.98:1** against white. See the `responsive-accessibility` skill.

---

## 9. Build gate

```
npm run lint && npm run typecheck && npm run format:check && npm run build
```

All four must pass before any deploy. The `qa-build-gate` skill adds the output assertions on `out/`
(route count, unique titles, one H1, canonicals, JSON-LD presence, sitemap parity, no placeholder
markers, no oversized chunks).

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

---

## 11. Commands

| Task             | Command                                   |
| ---------------- | ----------------------------------------- |
| Dev server       | `npm run dev`                             |
| Production build | `npm run build`                           |
| Lint             | `npm run lint`                            |
| Type-check       | `npm run typecheck`                       |
| Format / check   | `npm run format` · `npm run format:check` |

---

## 12. Scope guardrails

- Implement real UI, sections, or content only when asked. Don't opportunistically redesign.
- Don't add a 24th city until all 23 pass the doorway test in
  [docs/content-standards.md](docs/content-standards.md).
- Don't add dependencies without a reason that survives "can the platform already do this?"
- Don't put PII in `dataLayer`.
- Cloudflare zone settings (AI crawler policy, Scrape Shield, cache rules) and cPanel configuration are
  **the owner's to change**. Document the exact toggle; never assume it was done.
