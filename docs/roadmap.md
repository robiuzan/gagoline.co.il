# Implementation roadmap — pre-season 2026

**Authored 2026-08-31. Every "still open" claim below was measured against the repo, the export in
`out/`, and the live site on that date.** This file supersedes the phase ordering in
[growth-plan.md](growth-plan.md) §3–§9, which was written on 2026-08-17 under two assumptions that are
no longer true — see §1.

Sprint status lives in [optimization-backlog.md](optimization-backlog.md). This file holds the
**order** and the **reasoning for the order**; the backlog holds the defects.

---

## 1. What changed, and why the order is different

**The AI-crawler block is gone.** On 2026-08-16 Cloudflare's edge sent `Disallow: /` to every major AI
crawler with a bot rule returning 403 on top, and the docs concluded that AEO work was capped. Re-probed
2026-08-31: the served `robots.txt` carries the fleet allow list and **all nine tested agents return
200** (`npm run aeo:check`). AEO moves from "not worth doing" to **the highest-leverage cheap work
available**, because the site now has seven articles and real service depth for those crawlers to read.

**The content depth push landed.** Service pages went from ~80 unique words to ~1,040; city pages from
~90 to ~654. The doorway risk that dominated the old plan is materially reduced. That frees the
sequence to move from _writing_ to _harvesting_.

**Measurement did not land.** Nothing in this repo proves a GA4 property exists for this domain, and
GTM still loads from `<body>`. This is now the biggest single risk in the plan — see §2.

---

## 2. The two clocks

**Clock A — the crawl deadline (hard, ~4 weeks).** Demand spikes with the first rain, typically
mid-to-late October. Content that must rank in November has to be **published and crawled by the end of
September**. Anything shipped in October ranks for the season after this one.

**Clock B — the measurement deadline (harder, and usually missed).** If GA4 is not live and receiving
key events _before_ the first rain, the entire season produces no attributable data. There is no
retrofit: traffic that arrived unmeasured stays unmeasured forever. **A season measured badly costs
more than a sprint delivered late**, because it removes the evidence needed to plan the next one.

Clock B is why Sprint 0 is an owner escalation and not a coding sprint.

---

## Sprint 0 — Escalate the human blockers (day 1, parallel to everything)

No code. These have lead times measured in weeks and every one of them gates work below.

| Ask                                     | Gates                                           | Owner action                                        |
| --------------------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| **GA4 property for gagoline.co.il**     | All of Clock B, Sprint 2                        | Create property, send measurement ID for the roster |
| **Google עסק שלי (GBP) verification**   | Local pack, reviews, the whole `/reviews/` path | Start now — postcard verification takes weeks       |
| **Confirm the four ₪/m² price ranges**  | §4.8 `Offer` schema, `/pricing/` credibility    | Confirm or correct the numbers                      |
| **Warranty duration**                   | Any warranty claim beyond "אחריות בכתב"         | State the real term                                 |
| **A named person + role**               | §6.5 authorship, article bylines, E-E-A-T       | Name, role, years in trade                          |
| **`בלי קבלני משנה` + winter emergency** | Two claims **live on `/about/` today**, 🔶      | Confirm or they come down                           |
| **`www` → apex 301**                    | §1.10 — a full duplicate copy is live           | Cloudflare redirect rule                            |
| **CSP: approve report-only rollout**    | §12.2                                           | Approve; it ships where the other 5 headers are set |

The sheets already exist: [owner-requests.md](owner-requests.md),
[owner-requests.he.md](owner-requests.he.md), [owner-requests.whatsapp.md](owner-requests.whatsapp.md).
**They have never been sent.** Sending them is the single highest-value action in this document.

---

## Sprint 1 — Measurement and the AEO unlock (week 1)

Everything here is cheap, unblocked, and time-critical. Nothing here needs a business fact.

**1.1 GTM into `<head>`** — backlog §13.1. Currently rendered in `<body>` (`app/layout.tsx`), so the
container is blocked behind body parsing. The `<noscript>` iframe correctly stays in `<body>`.
_Accept:_ `googletagmanager.com/gtm.js` appears before `<body` in the export; `gtm.js?id=GTM-KWGGH438`
returns 200.

**1.2 Publish `public/llms.txt`** — backlog §6.3. Now worth shipping for the first time. Business
identity, service list, coverage, the canonical URLs of the seven articles, and the contact route. No
unconfirmed facts. _Accept:_ 200 live; every URL in it resolves; no 🔶.

**1.3 Answer blocks on service and city pages** — backlog §6.2, spec in
[content-standards.md](content-standards.md) §5. A question-form `<h2>` followed by a **40–60 word**
extractable answer, before any marketing copy. Highest AEO leverage per hour on the site.
_Accept:_ every service and city page opens with one; word count enforced by a new gate assertion.

**1.4 Real `lastModified` in the sitemap** — backlog §1.4. All URLs are stamped `new Date()`, so every
page claims to have changed on every deploy and the freshness signal is worthless. Articles already
carry real `dateModified`; extend the pattern. **Seasonal content is judged on freshness — this matters
more in September than in any other month.** _Accept:_ no two deploys produce identical `lastmod` churn.

**1.5 Derive `staticPaths` from the data** — backlog §1.3. A hand-kept array of 12 in `app/sitemap.ts`;
a new route is silently unlisted. This bit `/blog/` once already. _Accept:_ adding a route requires no
sitemap edit; `seo-assert` parity still passes.

**1.6 Wire `npm run aeo:check` into the deploy routine** — not the gate (it needs network and hits
production), but a mandatory post-deploy step in the `deploy-gagoline` skill. A zone revert must not go
unnoticed for two weeks a second time.

---

## Sprint 2 — Conversion completeness (week 2)

The season converts on the phone. Every gap here is a lead that arrives and leaves.

**2.1 GA4 key events** — the moment the property exists (Sprint 0). Mark `lead_submit`, call clicks and
WhatsApp clicks as key events. Wire `/thank-you/` as the Google Ads conversion and `lead_submit` as the
GA4 key event — **one signal per system**, per
[measurement-architecture.md](measurement-architecture.md) §3.

**2.2 A lead form on `/pricing/`** — backlog §8.8. The highest buying-intent page on the site offers a
table and no way to act. _Accept:_ `LeadForm` present; `pricing-*` CTAs measurable.

**2.3 404 that recovers the visit** — backlog §1.9. 17 lines, no `metadata` export, no service or phone
links. In-season, a 404 is a lead standing in the rain. _Accept:_ metadata present, links to the top
services, `/areas/`, and a click-to-call.

**2.4 Related services by relevance** — backlog §9.4. `app/services/[service]/page.tsx` uses
`.filter(...).slice(0, 4)`, which always returns the first four in array order, so the flagship services
absorb nearly all internal equity. _Accept:_ a declared relevance map; no service is a related link on
more than N pages.

**2.5 Service ↔ city cross-links** — backlog §9.3. Zero today. This is what makes the 8×23 matrix behave
like a mesh instead of two separate lists.

---

## Sprint 3 — Citability and trust surface (weeks 3–4, before the crawl deadline)

**3.1 Something worth citing** — backlog §6.7. The gap AEO actually rewards: a cost breakdown by roof
type, a זיפות-vs-יריעות comparison, lifespan data, and "when sealing is the wrong answer." Generic
reassurance is never quoted. **Constrained by [business-facts.md](business-facts.md)** — publish only
what is confirmed; a fabricated comparison table is worse than no table.

**3.2 Freshness and authorship** — backlog §6.5. Articles carry dates; nothing carries an author.
Blocked on a named person (Sprint 0). If the name arrives, byline the seven articles and add `author`
to the `Article` schema. If it does not, authorship stays `Organization` and star rich results stay
off — that is a correct outcome, not a failure.

**3.3 Images on service and city pages** — backlog §7.3. Four verified photographs exist and are used
only in `/gallery/`. For a visual trade this is a trust gap. Reuse them where they are truthful; do not
caption beyond what is inside the frame. Wire the kit's `SiteImage`/`srcsetFor` pipeline **before** the
first image ships, or CLS regresses.

**3.4 `/gallery/` out of `ALLOWED_ZERO`** — backlog §9.8, found 2026-08-31. It got real photographs and
left `noindex` on 2026-08-27 but was never removed from the exemption set, so the gate has not checked
it since. It has 52 inbound (footer) and **1 contextual**, and that one is an accident of
`/thank-you/`. Give it a real contextual link from a service page, **then** remove the exemption in the
same commit.

**3.5 `Offer` schema on `/pricing/`** — backlog §4.8. Ships only if Sprint 0 confirms the prices.
Emitting machine-readable prices that are assumptions is worse than emitting none.

---

## Sprint 4 — Performance, accessibility, security (weeks 5–6, safe to run in-season)

Low regression risk, no content dependency. Deliberately after the crawl deadline.

**4.1 Font preloads** — backlog §10.3. Measured **0** preload links in the export. Heebo + Rubik
self-host via `next/font/google` with `display: swap`, so both FOUT on first paint. On an
image-light site the font is the LCP element; this is the single biggest CWV lever available.

**4.2 Drop `framer-motion`** — backlog §10.4. In `package.json`, **0 imports** anywhere. `Reveal` is
hand-rolled with `IntersectionObserver`.

**4.3 `TrustBar` SR duplication** — backlog §11.7. `<dt class="sr-only">{stat.label}</dt>` followed by
the same label visibly in `<dd>`; screen readers hear every label twice.

**4.4 Mobile menu keyboard completeness** — backlog §11.6. `aria-expanded` is present; no
`aria-controls`, no Escape handler, no focus trap, no scroll lock.

**4.5 CSP, report-only first** — backlog §12.2. Five security headers are already served at the edge and
CSP is the only one missing. GTM is injected via `dangerouslySetInnerHTML` and a static export cannot
mint a per-request nonce, so the policy needs a hash or a strict-dynamic path. **Find out whether the
existing five come from Pages defaults or a Transform Rule before adding `public/_headers`, or they
will be duplicated.** Report-only for a week, then enforce.

**4.6 Housekeeping** — §9.7 derived footer year; §2.7 read `verification.google` and `brand.themeColor`
from the manifest instead of the hardcoded value at `app/layout.tsx:57`.

---

## Sprint 5 — Owner-gated (whenever the facts arrive)

Cannot be scheduled, only unblocked. Each ships **in the same commit** that removes its guard:

- **Real reviews** → `/reviews/` gains content, leaves `noindex`, leaves `ALLOWED_ZERO`, re-enters the
  sitemap and the nav. `Review`/`AggregateRating` only with a resolvable public source.
- **Confirmed prices** → §3.5 above.
- **Warranty term** → the specific duration returns to `trustStats`.
- **Named person** → §3.2 above.
- **GBP verified** → NAP consistency audit against the manifest, then local-pack work.

> **The rule that governs this whole sprint, from `link-graph-check.mjs`'s own header:** an exemption
> added for a temporary state outlives the state unless removing it is part of the same commit that
> ends the state. That is how `/blog/` shipped orphaned with a green gate, and how `/gallery/` is
> sitting unchecked right now.

---

## 3. Gate additions this roadmap requires

A rule no script enforces is a suggestion. Each sprint adds its own ratchet:

| Sprint | Assertion to add                                                   |
| ------ | ------------------------------------------------------------------ |
| 1      | Answer block present on every service/city page, 40–60 words       |
| 1      | GTM script index precedes `<body` in every page                    |
| 1      | `llms.txt` exists; every URL in it appears in the sitemap          |
| 2      | Every page carrying buying intent has a reachable form or call CTA |
| 3      | No image without dimensions (CLS reserve)                          |
| 4      | Font preload present for both families                             |
| 4      | `package.json` has no dependency with zero imports                 |

---

## 4. Sequencing rules

1. **Never ship a route into the sitemap and the nav in different commits.** Content, `robots`,
   sitemap entry, nav link and gate exemption move together or not at all.
2. **Never state a business fact that [business-facts.md](business-facts.md) has not confirmed.** A
   🔶 must never reach a visitor; removing a surface is always correct, rewriting a placeholder is not.
3. **Verify against the live site, not the deploy log.** The deployment URL updates before the custom
   domain does, and a WebDAV upload once reported "106 ok, 0 failed" while changing nothing public.
4. **Re-probe the edge after any Cloudflare change** — `npm run aeo:check`. The repo cannot see zone
   settings, and the last block went unnoticed for two weeks.
5. **One sprint per deploy where possible.** `out.prev/` holds exactly one rollback.
