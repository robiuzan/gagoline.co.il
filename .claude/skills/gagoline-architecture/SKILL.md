---
name: gagoline-architecture
description: Start-here orientation for gagoline.co.il — the roster → site.config.json → lib/site-config.ts → lib/content.ts → routes data flow, the file map, static-export constraints (no headers, redirects, middleware or API routes), the Cloudflare Pages hosting model, the npm scripts, and the deploy truth. Use at the start of any task in this repo, or when unsure where content, routes, metadata or business facts come from. Triggers "where does X live", "how is this site built", "orient me", "architecture", "why is this not working in production".
---

# gagoline.co.il architecture

גגוליין — roof waterproofing (איטום גגות), תל אביב והמרכז, active since 2014. Hebrew RTL marketing
site, 44 routes, Next.js 14 App Router compiled to static HTML. Read this before changing anything.

## The stack, and what it forbids

Next **14.2** · React **18** · TypeScript strict + **`noUncheckedIndexedAccess`** · Tailwind **v4**
(CSS-first `@theme` in `app/globals.css` — **there is no `tailwind.config.ts`**) · `lucide-react` ·
`cn()` from `clsx` + `tailwind-merge` · `@ishub/site-kit` (hub tarball, ships raw TS, hence
`transpilePackages`).

```js
// next.config.mjs
output: "export",       trailingSlash: true,
images: { unoptimized: true },
transpilePackages: ["@ishub/site-kit"],
```

`output: "export"` **forbids** `headers()`, `redirects()`, `rewrites()`, middleware, API routes, ISR
and server actions. If a task seems to need one of them, the answer is at the host or the edge, not in
Next.

## The hosting model — the thing people get wrong

**Cloudflare Pages, direct upload via wrangler.** Project `gagoline`, serving `gagoline.pages.dev`,
`gagoline.co.il` and `www.gagoline.co.il`. The roster is authoritative:
`hosting.target: "cloudflare-pages"`.

> Corrected 2026-08-17. This section previously described an Apache/cPanel host, inferred from the
> leftover `deploy/deploy-webdav.ps1` and `public/.htaccess`. Both are dead artifacts of the
> previous host, and acting on them cost a deploy that reported success and shipped nothing.

Consequences, all of which have bitten someone:

- **`public/_headers` and `public/_redirects` are live features** — this is Pages. Neither file
  exists yet. `public/.htaccess` is inert; Apache serves nothing for this site.
- **Cloudflare Scrape Shield email obfuscation is ON.** It rewrites any `mailto:` it finds into a
  `/cdn-cgi/l/email-protection#…` URL that 404s, and plain-text addresses into "[email protected]"
  mid-Hebrew-sentence. `components/ui/EmailAddress.tsx` wraps the address in real
  `<!--email_off-->` HTML comments to opt out. Don't "simplify" it — see commit `ac48484`.
- **`/robots.txt` may not be what `app/robots.ts` emits.** Cloudflare can prepend a managed block at
  the edge. Always `curl` the live file before reasoning about crawlers.

## Data flow — the thing to internalise

```
Israeli services sites/roster/sites/gagoline.json    ← EDIT HERE for NAP, brand, schema, analytics
        │  (ops sync)
        ▼
site.config.json          SiteManifest               ← NEVER edit directly
        │
        ▼
lib/site-config.ts        manifest · siteConfig · services[8] · cities[23]
        │                 telHref · whatsappHref()
        ├─► lib/content.ts   serviceCards · differentiators · processSteps · trustStats
        │                    priceRows · testimonials · faqs · navItems
        ▼
app/**/page.tsx  →  components/**
```

**Identity and NAP go up to the roster. Wording goes in `lib/content.ts`. Layout goes in components.**
Copy typed into a component is a bug: `app/services/[service]/page.tsx:32-37` holds a shared `triggers`
array and `app/about/page.tsx:14-21` holds a `values` array. Both are in the backlog, not treated as
patterns.

`brief.md` is the strategy document the site was built from. It explains _why_ the copy says what it
says. It is **not** a fact sheet — anything it marks 🔶 is still 🔶.

## Routes — 44 emitted, 40 in the sitemap

| Route                                                          | Source                            | Count |
| -------------------------------------------------------------- | --------------------------------- | ----- |
| `/`                                                            | `app/page.tsx`                    | 1     |
| `/services/`                                                   | `app/services/page.tsx`           | 1     |
| `/services/{slug}/`                                            | `app/services/[service]/page.tsx` | 8     |
| `/areas/{city}/`                                               | `app/areas/[city]/page.tsx`       | 23    |
| `/about/ /contact/ /pricing/ /faq/ /reviews/ /gallery/ /blog/` | static dirs under `app/`          | 7     |
| `/privacy/ /accessibility/ /terms/`                            | static dirs under `app/`          | 3     |
| `/404`                                                         | `app/not-found.tsx`               | 1     |
| `/sitemap.xml` `/robots.txt`                                   | `app/sitemap.ts` `app/robots.ts`  | —     |

**Slugs are Latin ASCII with Hebrew display names** — `/services/roof-sealing/`, `/areas/tel-aviv/`.
Unlike the fleet's Hebrew-slug sites there is **no percent-encoding trap**: dynamic params match
directly against the config arrays, and `app/sitemap.ts` needs no `encodeURI`. Don't copy the
`decodeURIComponent().normalize("NFC")` matcher in from a sibling repo; it solves a problem this site
doesn't have.

**There is no `/areas/` index route.** `navItems` points "אזורי שירות" at `/areas/tel-aviv`, and each
location page's middle breadcrumb links to itself. Backlog §5.5.

`/reviews/`, `/gallery/` and `/blog/` are emitted but `noindex` and out of the sitemap until they hold
real content (Phase 0, 2026-08-17) — hence 40 sitemap URLs, not 43.

## What `@ishub/site-kit` gives you

| Subpath        | Symbols                                                                                 | Used here                                                    |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `./contact`    | `telHref`, `whatsappHref`, `phoneDisplay`                                               | yes                                                          |
| `./seo`        | `localBusinessJsonLd`, `serviceJsonLd`, `faqJsonLd`, `breadcrumbJsonLd`, `jsonLdScript` | only `localBusinessJsonLd` — **the rest are the schema gap** |
| `./analytics`  | `gtmHeadSnippet`, `gtmNoScriptSrc`, `trackEvent`                                        | yes                                                          |
| `./media`      | `mediaUrl`, `srcsetFor`, `ogImageMeta`, `preloadPropsFor`                               | only `ogImageMeta` — the site has no images yet              |
| `./components` | `SiteImage` (media-host srcset)                                                         | **unused** — wire it before the first image ships            |
| `./types`      | `SiteManifest` and friends                                                              | yes                                                          |

## Commands

```
npm run dev · build · lint · typecheck · format · format:check
```

Build gate: `npm run lint && npm run typecheck && npm run format:check && npm run build`.

## Deploy

**Cloudflare Pages via wrangler. Pushing to `main` deploys nothing.**
Use the hub's `ops/deploy-site.ps1 -Domain gagoline.co.il`, which drift-checks the Pages project
against the Cloudflare API before uploading. **Never run `deploy/deploy-webdav.ps1`** — it targets a
docroot that is no longer served and reports success while changing nothing. `.github/workflows/ci.yml` is build-only CI. See `/deploy-gagoline`.

## The state of the site, in one paragraph

Structurally sound, content-thin, and shipping placeholders. Canonicals, H1 uniqueness, RTL discipline
and build hygiene are all above the fleet average. But **2 of 44 pages carry any JSON-LD**, all 23
location pages are find-and-replace clones, service pages carry ~80 unique words, and three invented
testimonials plus an empty gallery are live in production with a visible 🔶. Start at
`docs/optimization-backlog.md` §3, §4 and §7.

## Where to go next

`/seo-metadata` · `/schema-structured-data` · `/hebrew-rtl` · `/local-seo-il` · `/aeo-answer-content` ·
`/internal-linking` · `/conversion-cro` · `/tracking-analytics` · `/performance-web-vitals` ·
`/responsive-accessibility` · `/web-security-headers` · `/new-service` · `/new-city` · `/new-article` ·
`/qa-build-gate` · `/deploy-gagoline`. The acceptance bars live in `docs/`:
`optimization-backlog.md`, `content-standards.md`, `keyword-map.md`, `schema-graph.md`,
`business-facts.md`, and `cloudflare-runbook.md` for anything at the edge.
