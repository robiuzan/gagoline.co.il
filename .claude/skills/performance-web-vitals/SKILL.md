---
name: performance-web-vitals
description: Core Web Vitals for a static export on Cloudflare Pages — font preloads as the real LCP lever on an image-free site, wiring the kit's SiteImage/mediaUrl/srcsetFor pipeline before the first image ships, CLS reserves, the INP client-JS budget, and keeping out/ clean. Use before shipping or when LCP, CLS or INP regress. Triggers "perf pass", "Core Web Vitals", "LCP slow", "image optimization", "bundle size", "srcset".
---

# Core Web Vitals

Static HTML on Cloudflare Pages — TTFB and edge caching are already good, and the build output is clean.
**Start by knowing what's already fine, so you spend effort where it matters.**

## The baseline is healthy

`out/` is **4.9 MB with no JS bundle over 1 MB.** Sibling fleet sites have shipped ~14 MB of dev-only
chunks per deploy (a polluted `.next/` surviving into the export); this repo does not. Keep it that way
by running `rm -rf .next out` before a release build — the fix is clearing `.next`, never deleting
files out of `out/`.

CLS is sound: the sticky mobile bar has its `h-16 lg:hidden` spacer in `app/layout.tsx:81`. Preserve
that property when adding any fixed or late-loading element.

## Fonts are the LCP story — because there are no images

The site currently has **zero images**: no `next/image`, no `<img>`, anywhere. So the LCP element on
every route is text — the `Hero` heading on `/`, the `PageHeader` band on inner pages.

Heebo + Rubik are self-hosted via `next/font/google` with `display: swap` — correct. But there is **no
`<link rel="preload">`**, so both families FOUT on first paint on every page. On a text-LCP site that
is the single highest-leverage performance change available.

Preload the two subsets actually used above the fold, and verify the LCP element per route type rather
than assuming — a service page and a location page have different first paints from the homepage.

## Before the first image ships — read this

`next.config.mjs` sets `images: { unoptimized: true }`, so `next/image` renders a bare `<img>` with
**no srcset**, and any `sizes` prop is inert. A 360px phone would download exactly what a 4K desktop
does. On sibling fleet sites this shipped as 14 `sizes` props that looked correct in review and did
nothing.

The kit ships a complete pipeline that is currently unused:

```ts
import { SiteImage } from "@ishub/site-kit/components";
import { mediaUrl, srcsetFor, preloadPropsFor } from "@ishub/site-kit/media";
```

`SiteImage` emits a real `srcset` against the `imgquarry.com` media host already declared in the
manifest (and already `preconnect`ed in `app/layout.tsx:58-60`), and it **requires a non-empty `alt` at
compile time**. `preloadPropsFor()` generates the LCP preload.

Wire this **before** the gallery and before/after photos land (backlog §7.2, §7.3), not after. Two
viable routes — pick one deliberately, don't mix:

1. **Adopt `SiteImage`** for content imagery. This is what the kit exists for and what the manifest is
   already configured for.
2. **Keep `next/image`** and pre-generate width variants, hand-writing `srcset`. More files to manage,
   no host dependency.

The worst option is passing `sizes` to an unoptimized image, because it looks right and does nothing.

## JS budget (INP)

Four client components:

- `LeadForm` and `Reveal` genuinely need client.
- `Header` is `"use client"` for **one boolean**, shipping the nav, logo and button tree to the client
  on every page.
- `Faq` is client for accordion state and could be `<details>`/`<summary>` with zero JS — **while
  keeping answers in the DOM**, which `FAQPage` schema depends on (`/schema-structured-data` §4.3).

`framer-motion@^11` is a dependency **imported nowhere** — `Reveal` is hand-rolled with
`IntersectionObserver`. Remove it from `package.json` and the lockfile.

## Measuring

The auditor reads the artifact; it does not measure a browser. For real numbers run Lighthouse or PSI
against the **live** URL, mobile profile, and check field data in Search Console where available. Test
a service page and a location page, not just the homepage.

## Checklist

- [ ] Fonts preloaded; LCP element identified per route type.
- [ ] `out/` contains no unreferenced file over 1 MB.
- [ ] Content images (when they exist) emit a real `srcset` via the kit pipeline.
- [ ] At most one `priority` / preloaded image per page.
- [ ] No `"use client"` without a stated reason.
- [ ] `framer-motion` removed.
- [ ] CLS reserves intact for every new block.

```bash
find out -name '*.js' -size +1M -exec ls -lh {} \;   # expect nothing
du -sh out                                            # ~4.9 MB today
grep -c 'rel="preload"' out/index.html
grep -c 'srcset' out/index.html
```
