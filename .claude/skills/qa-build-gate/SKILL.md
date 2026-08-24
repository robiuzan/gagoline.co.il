---
name: qa-build-gate
description: The release gate before any deploy — clean build, lint, typecheck and format:check, a route-count assertion, title/canonical/JSON-LD greps, the placeholder-marker check, sitemap parity with the emitted tree, orphan detection, and the auditor sweep. Use before every deploy or when asked whether the site is ready to ship. Triggers "run the build gate", "is this ready to ship", "pre-deploy check", "QA the site", "verify the build".
---

# Build gate

Everything here runs against `out/` — the artifact that actually ships. A passing `npm run build` is
the start of this gate, not the end of it.

## 1. Clean build

```bash
rm -rf .next out
npm run lint && npm run typecheck && npm run format:check && npm run build
```

**The `rm -rf .next` matters.** A polluted `.next/` — usually a `next dev` run's artifacts surviving
into the export — has shipped ~14 MB of dev-only chunks per deploy on sibling fleet sites. This repo is
currently clean (`out/` is ~4.9 MB with no JS over 1 MB); the clean build is what keeps it that way.
Deleting files out of `out/` afterwards is never the fix.

All four commands must pass. `format:check` is included because a Stop hook formats changed files — an
unformatted file means something bypassed it.

## 2. Route count

```bash
find out -name index.html | wc -l          # expect 44 (43 content + 404)
grep -c '<url>' out/sitemap.xml            # expect 43
test -f out/robots.txt && echo ok
```

If the counts move, something was added or dropped. Reconcile before shipping — `staticPaths` in
`app/sitemap.ts:19` is a hand-maintained array of 12, so a new page can build fine and be silently
absent from the sitemap.

## 3. Titles — the doubled-brand check

```bash
grep -rho '<title>[^<]*</title>' out --include=index.html | sort | uniq -c | sort -rn | head
grep -rl 'גגוליין | גגוליין' out --include=index.html
```

The second command must return **nothing**. It currently matches `out/about/index.html` (backlog §2.1).
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

Expect no output. Currently clean across all 44 routes.

## 6. Placeholder markers — stop-ship

```bash
grep -rlP '\x{1F536}' out --include=index.html      # NOT grep -rl '🔶' — see below
grep -rl 'להחלפה\|בקרוב נעלה' out --include=index.html
```

**Use the `-P` codepoint form.** A literal `grep -rl '🔶'` matches **nothing** under this environment's
shell locale and the check silently passes — verified 2026-08-17, when the naive form returned 0 files
and `grep -rlP '\x{1F536}'` returned **10**. Any gate written the naive way is decorative.

Both must return **nothing**. They currently return **10 pages**: `/`, `/reviews/`, `/gallery/`,
`/blog/`, `/about/`, `/pricing/`, `/privacy/`, `/terms/`, `/accessibility/` and `/faq/` — the last one
ships the marker **inside the `FAQPage` JSON-LD**, i.e. as machine-readable structured data. See
backlog §7.1–7.4 and `docs/business-facts.md` §A. **This is the highest-severity check in this file** —
everything else is a ranking issue; this one is fabricated content served to customers and to crawlers.

## 7. Structured data

```bash
grep -rL 'application/ld+json' out --include=index.html   # pages with no schema
grep -rl 'BreadcrumbList' out --include=index.html | wc -l  # target 43 (all but / and /404)
grep -rl 'aggregateRating\|"@type": *"Review"' out --include=index.html  # expect none until sourced
```

Currently **2 of 44** pages carry any JSON-LD and **0** carry a breadcrumb. Any `Review` or
`AggregateRating` without a verifiable public source is a **stop-ship**, not a warning
(`docs/schema-graph.md` §4).

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
grep -rho 'href="/[^"]*"' out --include=index.html | sed 's|href="||; s|"$||' | sort -u > /tmp/linked.txt
comm -23 /tmp/emitted.txt /tmp/linked.txt
```

Currently prints 11 city pages — `Footer.tsx:71` renders `cities.slice(0, 12)` (backlog §5.8). Note the
comparison is slash-sensitive and most internal hrefs omit the trailing slash (§1.8), which will show
up here as noise until that's fixed.

## 10. Output weight

```bash
find out -name '*.js' -size +1M -exec ls -lh {} \;    # expect nothing
du -sh out                                             # ~4.9 MB today
```

## 11. Content floors

Spot-check that no page regressed below `docs/content-standards.md` §1. Strip tags **and the Next.js
flight-data payload** — a naive `sed 's/<[^>]*>//g'` inflates every count by hundreds of words — then
subtract ~130 words of chrome. The thinnest routes are the 23 city pages (~90 words) and the 8 service
pages (~80).

## 12. Auditor sweep

For a substantive change, run the relevant agents against the fresh `out/`:

| Changed                    | Run                  |
| -------------------------- | -------------------- |
| metadata, routes, sitemap  | `seo-auditor`        |
| JSON-LD                    | `schema-auditor`     |
| copy, claims, imagery      | `eeat-trust-auditor` |
| components, colours, fonts | `perf-a11y-auditor`  |
| headers, form, deps        | `security-auditor`   |
| any TS/React               | `ts-react-reviewer`  |

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

## Then

`/deploy-gagoline` — dry run first. **Pushing to `main` does not deploy.**
