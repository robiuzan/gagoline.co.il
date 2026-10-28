---
name: qa-build-gate
description: The release gate before any deploy — clean build, lint, typecheck and format:check, a route-count assertion, title/canonical/JSON-LD greps, the placeholder-marker check, sitemap parity with the emitted tree, orphan detection, and the auditor sweep. Use before every deploy or when asked whether the site is ready to ship. Triggers "run the build gate", "is this ready to ship", "pre-deploy check", "QA the site", "verify the build".
---

# Build gate

> **Most of this file is now executable.** `npm run gate` runs lint, typecheck, format:check, build,
> then `scripts/seo-assert.mjs` (markers, doubled brand, title uniqueness, one H1, canonicals,
> trailing slashes, unsourced ratings, sitemap parity), `scripts/link-graph-check.mjs` (orphans,
> inbound degree, BreadcrumbList item URLs) and `scripts/images/check-images-out.mjs` (§11 — every
> image rule, also in `postbuild`). Prose gates do not fail builds — and one of the greps
> below was silently broken for weeks. Prefer the scripts; keep the manual commands for diagnosis.

Everything here runs against `out/` — the artifact that actually ships. A passing `npm run build` is
the start of this gate, not the end of it.

## 1. Clean build

```bash
rm -rf .next out
npm run lint && npm run typecheck && npm run format:check && npm run build
```

**The `rm -rf .next` matters.** A polluted `.next/` — usually a `next dev` run's artifacts surviving
into the export — has shipped ~14 MB of dev-only chunks per deploy on sibling fleet sites. This repo is
clean (no JS over 1 MB; `out/` was 4.9 MB before images, 12 MB on 2026-10-18 with the carried
`_next/static` chunks, and grows by the approved images — `out/images` ≤ 20 MB is gate-held); the clean
build is what keeps it that way.
Deleting files out of `out/` afterwards is never the fix.

All four commands must pass. `format:check` is included because a Stop hook formats changed files — an
unformatted file means something bypassed it.

## 2. Route count

```bash
find out -name index.html | wc -l          # expect 54 (51 content + /404/ + /reviews/ + /thank-you/)
grep -c '<url>' out/sitemap.xml            # expect 51 (the two noindexed routes are excluded)
test -f out/robots.txt && echo ok
```

If the counts move, something was added or dropped. The sitemap is derived from `app/` and the data
arrays (backlog §1.3), so a new route lands in it automatically; a noindexed route must be added to
`EXCLUDED` in `app/sitemap.ts`, or `seo-assert` fails the build on an advertised noindex page.

## 3. Titles — the doubled-brand check

```bash
grep -rho '<title>[^<]*</title>' out --include=index.html | sort | uniq -c | sort -rn | head
grep -rl 'גגוליין | גגוליין' out --include=index.html
```

The second command must return **nothing**. Clean since Phase 0 (2026-08-17) — protect it.
Also confirm no two routes share a `<title>` or a description — the homepage and `/404/` legitimately
share one, and nothing else should.

## 4. Canonicals

```bash
grep -rL 'rel="canonical"' out --include=index.html      # expect empty
```

Every page needs exactly one self-referencing canonical with a trailing slash, matching its
`sitemap.xml` `<loc>` byte for byte. Currently clean — this is a passing check to protect.

## 5. One H1

```bash
for f in $(find out -name index.html); do
  n=$(grep -o '<h1' "$f" | wc -l); [ "$n" -ne 1 ] && echo "$f: $n";
done
```

Expect no output. Currently clean across all 54 routes.

## 6. Placeholder markers — stop-ship

```bash
grep -rlP '\x{1F536}' out --include=index.html      # NOT grep -rl '🔶' — see below
grep -rl 'להחלפה\|בקרוב נעלה' out --include=index.html
```

**Use the `-P` codepoint form.** A literal `grep -rl '🔶'` matches **nothing** under this environment's
shell locale and the check silently passes — verified 2026-08-17, when the naive form returned 0 files
and `grep -rlP '\x{1F536}'` returned **10**. Any gate written the naive way is decorative.

Both must return **nothing**, and both are clean since Phase 0. Before that they returned **10 pages**,
including `/faq/`, which shipped the marker **inside the `FAQPage` JSON-LD** — i.e. as machine-readable
structured data. See backlog §7.1–7.9 and `docs/business-facts.md` §A. **This is the highest-severity check in this file** —
everything else is a ranking issue; this one is fabricated content served to customers and to crawlers.

## 7. Structured data

```bash
grep -rL 'application/ld+json' out --include=index.html   # pages with no schema — expect none
grep -rl 'BreadcrumbList' out --include=index.html | wc -l  # expect 52 (all but / and /404/)
grep -rl 'aggregateRating\|"@type": *"Review"' out --include=index.html  # expect none until sourced
grep -rl 'application/ld+json' out --include=index.html | xargs grep -l '/images/' | xargs grep -c '"image"'   # expect 0 — no rendering in any graph
```

Measured on the 2026-10-18 export: **54/54** pages carry JSON-LD and **52** carry a `BreadcrumbList`.
Any `Review` or `AggregateRating` without a verifiable public source is a **stop-ship**, not a warning
(`docs/schema-graph.md` §4). No rendering ever enters the graph or `og:image` (CLAUDE.md §14).

## 8. Sitemap parity

```bash
find out -name index.html | sed 's|^out||; s|index.html$||' | sort > /tmp/emitted.txt
grep -o '<loc>[^<]*</loc>' out/sitemap.xml | sed 's|</\?loc>||g; s|https://gagoline.co.il||' \
  | sort > /tmp/sitemap.txt
diff /tmp/emitted.txt /tmp/sitemap.txt
```

`/404/` is expected to differ — it is correctly excluded. Nothing else should. Slugs are ASCII here, so
unlike the Hebrew-slug fleet sites no URL-decoding step is needed.

## 9. Orphans

```bash
# The live surfaces (CLAUDE.md §13) are sitewide chrome: the announcement bar and the seasonal
# cards sit on every page, hidden until their season, so their links are boilerplate, not context.
# Strip both regions before collecting links (links:check strips them from its contextual check
# too), or a seasonal line would mask a real orphan.
find out -name index.html -print0 \
  | xargs -0 perl -0777 -ne 's/<div class="live-topbar".*?<\/div><\/div>//gs; s/<div class="live-dialogs".*?<\/dialog><\/div>//gs; print' \
  | grep -o 'href="/[^"]*"' | sed 's|href="||; s|"$||' | sort -u > /tmp/linked.txt
comm -23 /tmp/emitted.txt /tmp/linked.txt
```

Prefer `npm run links:check` — this naive version counts a page's own breadcrumb as an inbound link,
which hides real orphans. It prints `/404/` plus the unlinked `/reviews/` and `/thank-you/`, both
expected. `links:check --strict` enforces a floor of 4 inbound links per route (backlog §9.2, closed
2026-08-31) — see [docs/link-graph.md](../../../docs/link-graph.md).

## 10. Output weight

```bash
find out -name '*.js' -size +1M -exec ls -lh {} \;    # expect nothing
du -sh out out/images                                  # 12 MB on 2026-10-18 + the images; out/images ≤ 20 MB is gate-held
```

## 11. Images

```bash
npm run images:check                                   # = node scripts/images/check-images-out.mjs out
npm run images:status                                  # plan vs manifest, per route
test -f out/.images-draft && echo "DRAFT BUILD - stop"  # expect nothing
grep -rL 'data-images-notice="footer"' out --include=index.html          # expect nothing
grep -c 'fetchpriority="high"' out/services/roof-sealing/index.html      # expect 1
grep -o '<img[^>]*/images/[^>]*>' out/areas/tel-aviv/index.html | wc -l  # expect 2 once installed
find out/images -type f | wc -l; du -sh out/images                       # every file placed; ≤ 20 MB
```

`check-images-out.mjs` runs in `postbuild` after `seo-assert` and before `keep-previous-assets`, and
fails the build on: a manifest that breaks the contract (ids, routes, slots, status, provenance,
watermark, `review.automated` before `approved`); an alt or caption outside the Hebrew rules (20–200
chars, no `תמונה של`, no city, no year, no digits before מ״ר/מ״מ, no לפני ואחרי, no rating words, no
הדמיה/AI, no ASCII quote touching Hebrew, no first name outside an `/about/`-only caption); an
`approved` file missing from `public/` or `out/`, with different header dimensions or bytes, or over
its class budget (`large` 220 KB, `half`/`tile` 170 KB, `thumb` 45 KB); any `<img>` without numeric
width/height or with an empty alt unless `aria-hidden`; a `_candidates` or `rejected` reference, or
`out/.images-draft`, in a non-draft build; a referenced `/images/*` that is missing or not approved;
**an unreferenced file under `public/images/`** (except `retired` ≤ 60 days); a page under
`gates.minPerContentPage` images or over 900 KB of images; zero or two `fetchpriority="high"`, or one
that is not the first content image; a `/images/` path inside `application/ld+json` or `og:image`; a
missing disclosure marker (`footer` on every page, `gallery`, `about`); `out/images` over 20 MB; a
file shared by two `/areas/*` pages. It prints a per-route coverage table. The full list is skill
`page-imagery` §8; the second-opinion pass that no script can do is agent `image-qa-reviewer`.

## 12. Content floors

Spot-check that no page regressed below `docs/content-standards.md` §1. Strip tags **and the Next.js
flight-data payload** — a naive `sed 's/<[^>]*>//g'` inflates every count by hundreds of words — then
subtract ~130 words of chrome. The thinnest routes are the 23 city pages (~90 words) and the 8 service
pages (~80).

## 13. Auditor sweep

For a substantive change, run the relevant agents against the fresh `out/`:

| Changed                                  | Run                     |
| ---------------------------------------- | ----------------------- |
| metadata, routes, sitemap                | `seo-auditor`           |
| JSON-LD                                  | `schema-auditor`        |
| copy, claims, imagery                    | `eeat-trust-auditor`    |
| image candidates, captions, the manifest | `image-qa-reviewer`     |
| components, colours, fonts               | `perf-a11y-auditor`     |
| headers, form, deps                      | `security-auditor`      |
| any TS/React                             | `ts-react-reviewer`     |
| links, nav, hubs                         | `ia-auditor`            |
| CTAs, form, tracking                     | `conversion-auditor`    |
| copy depth, city pages                   | `content-depth-auditor` |

## Stop-ship list

- **Any 🔶 or placeholder text in the rendered HTML.**
- Any `Review` / `AggregateRating` without a source.
- A doubled brand suffix in any `<title>`.
- A missing or non-self-referencing canonical.
- Zero or multiple `<h1>` on any page.
- A route in `out/` missing from `sitemap.xml`.
- Any unreferenced file over 1 MB under `out/_next/`.
- `lint`, `typecheck`, `format:check` or `build` failing.
- A live claim that `docs/business-facts.md` marks 🔶.
- Any `<img>` without dimensions or alt; a `/images/` path in schema or `og:image`; a `candidate` or
  `_candidates/` reference; `out/.images-draft` present; a stray or unapproved file under
  `out/images/`; a missing `data-images-notice` marker.

## Then

`/deploy-gagoline` — dry run first. **Pushing to `main` does not deploy.**
