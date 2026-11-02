---
name: performance-web-vitals
description: Core Web Vitals for a static export on Cloudflare Pages — the LCP element per route now that every content page carries images (text hero on phones, the first figure or the home strip on desktop), the Figure/SiteImage contract (one priority per page, baked dimensions, byte budgets, lazy rest, the phone copy through <picture>, never delete a published file), the shipped font preloads, CLS reserves, the INP client-JS budget, and keeping out/ clean. Use before shipping or when LCP, CLS or INP regress. Triggers "perf pass", "Core Web Vitals", "LCP slow", "image optimization", "bundle size", "srcset".
---

# Core Web Vitals

Static HTML on Cloudflare Pages — TTFB and edge caching are already good, and the build output is clean.
**Start by knowing what's already fine, so you spend effort where it matters.**

## The baseline is healthy

No JS bundle over 1 MB; `out/` was 4.9 MB before images and 12 MB on 2026-10-18 with the carried
`_next/static` chunks (`keep-previous-assets`), and it grows by the approved images — `out/images` is
capped at 20 MB by the gate. Sibling fleet sites have shipped ~14 MB of dev-only chunks per deploy (a
polluted `.next/` surviving into the export); this repo does not. Keep it that way by running
`rm -rf .next out` before a release build — the fix is clearing `.next`, never deleting files out of
`out/`, and **never deleting a file under `public/images/`** (CLAUDE.md §14).

CLS is sound: the sticky mobile bar has its `h-16 lg:hidden` spacer in `app/layout.tsx:81`. Preserve
that property when adding any fixed or late-loading element.

## Fonts are preloaded; images now exist — know the LCP element per route

Heebo + Rubik self-host via `next/font/google`, and since 2026-08-31 `scripts/font-preload.mjs`
(postbuild) preloads the two Hebrew faces (backlog §10.3) — the FOUT and the CLS this section used to
describe are closed.

Since 2026-10-28 every content page carries **two or more images** (CLAUDE.md §14). The hero stays
text + form (owner decision 6), so on phones the LCP element is still the H1; on desktop the first
figure — about 500 px down on a service or city page, the home strip directly under the hero — can
become the LCP candidate. That is why **the first content image on a page is its single `priority`
image** (`fetchpriority="high"`, never lazy — lazy-loading an in-viewport LCP image is the known
regression) and is byte-capped at 220 KB (`large`), 90 KB for the home strip's first tile. Measure
with PageSpeed Insights after each deploy that changes images: mobile LCP ≤ 2.5 s, CLS 0; if the home
strip regresses LCP, it moves below `TrustBar`.

## The image contract

`next.config.mjs` sets `images: { unoptimized: true }`, so `next/image` is not used. Every content
image renders through `components/ui/Figure.tsx` over the kit's `SiteImage` in ad-hoc mode:

- `width`/`height` baked from the manifest's measured pixels — CLS 0 by construction;
- exactly one `priority` per page (the first content image in DOM order); everything else
  `loading="lazy" decoding="async"`;
- **phones get a phone copy through `<picture>`** — a static export has no resizer, so `srcsetFor`
  emits nothing and a hand-written `sizes` would be inert. `Figure` wraps the kit's `<img>` in a
  `<picture>` whose `<source media="(max-width: 640px)">` names the `-w720.webp` copy that
  `page-images/tools/phone-copies.mjs` writes after install. The `<img>`, its box and its loading
  attributes stay exactly as the kit writes them. The worst option is still passing `sizes` to an
  image with no `srcset`, because it looks right and does nothing;
- byte budgets, enforced by `scripts/images/check-images-out.mjs`: `large` (1600 long edge), `half`
  and `tile` (1200) each ≤ 256 KB, `thumb` (480) ≤ 45 KB, the phone copy (720) ≤ 120 KB, ≤ 900 KB of
  images per page, ≤ 20 MB under `out/images` (phone copies included; 18.3 MB on 2026-11-01, so the
  next large batch needs a decision on this cap); WebP q80 from the toolkit, q76 for phone copies;
- **never delete or rename a published file** — a replacement is a new slug plus a `retired` date
  (CLAUDE.md §14). The imgquarry/`srcsetFor` route (real width variants against the media host) stays
  a follow-up; file names are kept compatible with it.

## JS budget (INP)

Four client components:

- `LeadForm` and `Reveal` genuinely need client.
- `Header` is `"use client"` for **one boolean**, shipping the nav, logo and button tree to the client
  on every page.
- `Faq` is client for accordion state and could be `<details>`/`<summary>` with zero JS — **while
  keeping answers in the DOM**, which `FAQPage` schema depends on (`/schema-structured-data` §4.3).

`framer-motion` was removed on 2026-08-31 (backlog §10.4); `Reveal` is hand-rolled with
`IntersectionObserver`. `Figure`, `FieldStrip` and `TeamTeaser` are server components and add no
client JS.

## Measuring

The auditor reads the artifact; it does not measure a browser. For real numbers run Lighthouse or PSI
against the **live** URL, mobile profile, and check field data in Search Console where available. Test
a service page and a location page, not just the homepage.

## Checklist

- [ ] LCP element identified per route type (the H1 on phones; the first figure or the home strip on desktop).
- [ ] Exactly one `priority` / `fetchpriority="high"` image per page, and it is the first content image.
- [ ] Every image inside its byte budget; `out/images` ≤ 20 MB (`npm run images:check`).
- [ ] `out/` contains no unreferenced file over 1 MB.
- [ ] No `"use client"` without a stated reason.
- [ ] CLS reserves intact for every new block; every `<img>` has width/height.
- [ ] No `public/images/*` file deleted or renamed.

```bash
find out -name '*.js' -size +1M -exec ls -lh {} \;   # expect nothing
du -sh out out/images                                 # out/images ≤ 20 MB
grep -c 'rel="preload"' out/index.html                # the two Hebrew faces
grep -c 'fetchpriority="high"' out/services/roof-sealing/index.html   # expect 1
npm run images:check
```
