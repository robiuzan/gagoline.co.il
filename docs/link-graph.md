# Link graph — the target internal-link structure

`ia-auditor` measures against this file; `internal-linking` implements it. It exists because internal
linking was the one dimension with a skill but no written acceptance bar — which is exactly how the
backlog came to state two internal-linking findings that measurement disproved (§1.8 and §5.8, both
corrected 2026-08-17).

**Rule for anyone editing this file: every number here is measured, never estimated.** The commands
that produce them are at the bottom. If you change a threshold, re-run them and update the baseline in
the same commit.

---

## 1. Tiers

| Tier  | Routes                                                                           | Job                                                    |
| ----- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **0** | `/`                                                                              | Entry point; distributes to both silos                 |
| **1** | `/services/` · `/areas/` _(missing)_ · `/pricing/` `/about/` `/faq/` `/contact/` | Silo roots and commercial hubs                         |
| **2** | 8 × `/services/{slug}/` · 23 × `/areas/{city}/`                                  | The money pages — where commercial intent lands        |
| **3** | `/blog/{slug}/` _(none yet)_                                                     | Editorial; feeds Tier 2 rather than competing with it  |
| **—** | `/privacy/` `/accessibility/` `/terms/`                                          | Legal; footer-linked only                              |
| **—** | `/reviews/` `/gallery/` `/blog/`                                                 | **Parked** — `noindex`, deliberately unlinked (see §4) |

---

## 2. Required edges

| From                | To                                                                               |
| ------------------- | -------------------------------------------------------------------------------- |
| Footer (every page) | all 8 services · **all 23 cities** · both silo roots · all 3 legal pages         |
| Header              | both silo roots, and — once the mega-menu ships — all 31 Tier-2 children         |
| `/services/`        | its 8 children · `/areas/` · `/pricing/` · 2–3 contextual in-copy links          |
| `/areas/`           | its 23 children, grouped by sub-region · `/services/`                            |
| Each service page   | 4 related services **by adjacency map** · 4–6 cities · `/pricing/` · 2–3 in-copy |
| Each city page      | all 8 services · 2–4 **nearby** cities (reciprocal) · `/areas/` · 2–3 in-copy    |
| Every nested route  | `/` and its silo root via breadcrumb, mirrored in `BreadcrumbList`               |

---

## 3. Thresholds

- **Minimum non-self inbound degree: 4** for every indexable route.
- **Zero indexable routes with 0 inbound links.**
- **Every internal `href` ends in a trailing slash.** Next normalises `next/link` at export, so this
  is currently latent rather than live — but `breadcrumbJsonLd` builds its `item` URLs through an
  `abs()` helper that does **no** normalisation, so the defect goes live the moment BreadcrumbList
  ships. Fix the source strings first.
- **No route's inbound links come only from sitewide boilerplate.** A city with 43 footer links and
  nothing else is reachable but not _related_ to anything.
- **Related services come from an explicit adjacency map**, never array order.

---

## 4. Measured baseline — 2026-08-24, post-Phase-0

The distribution is bimodal, and one `.slice()` is responsible:

| Group                                     | Non-self inbound | Note                                                     |
| ----------------------------------------- | ---------------- | -------------------------------------------------------- |
| 12 footer cities, 8 services, hubs, legal | **43**           | Sitewide boilerplate                                     |
| **11 cities** past the footer slice       | **1**            | Only the homepage `ServiceAreas` chip — `Footer.tsx:71`  |
| `/reviews/` `/gallery/` `/blog/`          | **0**            | **Intentional** — parked, `noindex`, unlinked in Phase 0 |
| `/404/`                                   | 0                | Correct                                                  |

The 11 at degree 1: `azor` · `bat-yam` · `ganei-tikva` · `hod-hasharon` · `holon` · `kfar-saba` ·
`nes-ziona` · `netanya` · `raanana` · `rehovot` · `rishon-lezion`.

**Two corrections this baseline records**, so they are not re-derived wrongly a third time:

- These 11 are **not orphans**. `ServiceAreas.tsx:17` maps the full `cities` array on the homepage, so
  every city has at least one inbound link. It is a link-_depth_ imbalance, not orphaning.
- `/terms/` **was** a genuine orphan — emitted, sitemapped, zero inbound links — and the backlog never
  named it. Fixed 2026-08-24 by adding it to the footer legal list; it now sits at 43.

**Not yet built:** `/areas/` returns 404, so the 23 city pages hang directly off the homepage with no
silo root, and each one's middle breadcrumb points at _itself_.

---

## 5. Verify

```bash
# every emitted route
find out -name index.html | sed 's|^out||; s|index.html$||' | sort > /tmp/emit.txt

# every internal edge, with its source page recorded
for f in $(find out -name index.html); do
  s=${f#out}; s=${s%index.html}
  grep -o 'href="/[^"]*"' "$f" | sed 's|href="||;s|"$||' \
    | grep -v '^/_next' | sort -u | sed "s|^|$s |"
done > /tmp/edges.txt

# inbound degree, EXCLUDING self-links
awk '$1!=$2{print $2}' /tmp/edges.txt | sort | uniq -c | sort -n

# routes with zero non-self inbound links
comm -23 /tmp/emit.txt <(awk '$1!=$2{print $2}' /tmp/edges.txt | sort -u)

# any internal href missing its trailing slash
grep -rho 'href="/[^"]*"' out --include=index.html \
  | sed 's|href="||;s|"$||' | grep -v '^/_next' | grep -v '/$'
```

**The `$1!=$2` matters.** Counting a page's own breadcrumb self-link as inbound is what disguised the
11 low-degree cities as degree-2, and it is why the naive orphan check in the `internal-linking` skill
under-reported. `scripts/link-graph-check.mjs` enforces all of this in CI.
