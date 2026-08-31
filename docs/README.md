# docs/ — the map

Eleven strategy documents, thirteen agents and seventeen skills govern this repo. This page is the
index none of them had: **which file owns which decision, and which agent enforces it.**

Read [CLAUDE.md](../CLAUDE.md) first. It outranks everything here except where noted.

---

## 1. Precedence — when two documents disagree

```
Israeli services sites/roster/sites/gagoline.json   business facts, NAP, schema, analytics
        ▼
brief.md                                            strategy and brand voice
        ▼
CLAUDE.md                                           engineering rules for this repo
        ▼
docs/*.md                                           the acceptance bars
        ▼
the code
```

A business fact settles at the roster. A voice question settles at `brief.md`. An engineering rule
settles at `CLAUDE.md`. **If a doc and the live site disagree, the live site wins and the doc is a
bug** — see §4.

---

## 2. Topic → the file that owns it

| If you are asking about                                                      | Read                                                                                                                 | Enforced by                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Where anything lives; how the site is built                                  | skill `gagoline-architecture`                                                                                        | —                                                       |
| **What is true about the business** — prices, warranty, reviews, credentials | [business-facts.md](business-facts.md)                                                                               | agent `eeat-trust-auditor`                              |
| What may be stated as fact; Hebrew depth bar; answer blocks                  | [content-standards.md](content-standards.md)                                                                         | agent `content-depth-auditor`                           |
| Keyword tiers, the 8×23 matrix, title/H1/description formulas                | [keyword-map.md](keyword-map.md)                                                                                     | agent `seo-auditor`, skill `seo-metadata`               |
| **What to build next, in what order, and why**                               | [roadmap.md](roadmap.md) — supersedes growth-plan.md §3–§9                                                           | —                                                       |
| The original strategy and the seasonal clock                                 | [growth-plan.md](growth-plan.md)                                                                                     | —                                                       |
| The ranked defect list — cite findings as "backlog §N.N"                     | [optimization-backlog.md](optimization-backlog.md)                                                                   | every auditor agent                                     |
| JSON-LD target graph                                                         | [schema-graph.md](schema-graph.md)                                                                                   | agent `schema-auditor`, skill `schema-structured-data`  |
| Internal linking, orphans, inbound degree floors                             | [link-graph.md](link-graph.md)                                                                                       | `scripts/link-graph-check.mjs`, agent `ia-auditor`      |
| Local SEO, NAP, service-area-business model                                  | skill `local-seo-il`                                                                                                 | agent `local-seo-strategist`                            |
| AEO / GEO, llms.txt, answer-block form                                       | skill `aeo-answer-content`                                                                                           | agent `aeo-geo-strategist`                              |
| Conversion, the lead form, CTA coverage                                      | skill `conversion-cro`                                                                                               | agent `conversion-auditor`                              |
| WCAG 2.1 AA + IS 5568, contrast, focus, tap targets                          | skill `responsive-accessibility`                                                                                     | `scripts/contrast-check.mjs`, agent `perf-a11y-auditor` |
| Core Web Vitals, fonts, images, bundle budget                                | skill `performance-web-vitals`                                                                                       | agent `perf-a11y-auditor`                               |
| Security headers, CSP, form PII                                              | skill `web-security-headers`                                                                                         | agent `security-auditor`                                |
| Hebrew, RTL, logical utilities, LTR islands                                  | skill `hebrew-rtl`                                                                                                   | agent `rtl-frontend-engineer`                           |
| **Multilingual — adding English**                                            | [i18n-architecture.md](i18n-architecture.md)                                                                         | — (decision not yet taken)                              |
| **Mobile thumb-zone and geo personalization**                                | [personalization-and-mobile.md](personalization-and-mobile.md)                                                       | agent `conversion-auditor`                              |
| **GTM, GA4, server-side tagging, CRM**                                       | [measurement-architecture.md](measurement-architecture.md), skill `tracking-analytics`                               | —                                                       |
| What Cloudflare does to this site that the repo cannot                       | [cloudflare-runbook.md](cloudflare-runbook.md)                                                                       | —                                                       |
| Shipping                                                                     | skill `deploy-gagoline`, skill `qa-build-gate`                                                                       | `npm run gate`                                          |
| What to ask the owner for                                                    | [owner-requests.md](owner-requests.md) · [.he.md](owner-requests.he.md) · [.whatsapp.md](owner-requests.whatsapp.md) | —                                                       |

---

## 3. The gate — what a document is worth if nothing checks it

```bash
npm run gate   # lint · typecheck · format:check · build · seo:assert · links:check · contrast:check
```

Three of those are custom assertions written **because the defect they catch actually shipped**:

- `scripts/seo-assert.mjs` — the placeholder-marker check builds its pattern from a codepoint,
  because a literal `🔶` in a shell grep matched nothing under some locales and reported clean while
  ten pages were failing.
- `scripts/link-graph-check.mjs` — inbound degree **excludes self-links**, because breadcrumbs made
  every orphan look like a degree-2 page. It also enforces reachability from outside a route's own
  subtree, because `/blog/` shipped reachable only from its own children.
- `scripts/contrast-check.mjs` — proves itself against known ratios (21.00 and 4.54) on every run and
  exits non-zero if it cannot, because the first contrast calculator was wrong in a way that looked
  entirely plausible as a table of numbers.

**A rule that no script enforces is a suggestion.** When adding a standard to any doc here, ask what
would fail if it were violated.

---

## 4. Doc freshness — the standing hazard

These documents drift, and drift silently, because nothing rebuilds them. Two live examples found on
2026-08-31:

- `business-facts.md` §F asserted the Cloudflare AI-crawler block "caps the entire AEO/GEO goal."
  **Re-probed live: all major AI crawlers now return 200 and the served `robots.txt` allows them.**
  Corrected in place.
- `content-standards.md` §6 carried a ⚠️ saying placeholder testimonials were "currently being
  violated in production." They were deleted on 2026-08-17. Corrected in place.
- `optimization-backlog.md` still carries ❌ on roughly a dozen items closed by commits after
  2026-08-24 (breadcrumbs, `/areas/`, city and service depth, contrast, footer cities, `data-cta`).

**Convention going forward:** any claim about the live site carries the date it was measured. A claim
without a date is treated as unverified. When you close a backlog item, edit the row in the same
commit — an exemption or a status that outlives its cause is how `/blog/` shipped orphaned with a
green gate.
