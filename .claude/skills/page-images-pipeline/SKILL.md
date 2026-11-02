---
name: page-images-pipeline
description: The site-side runbook for putting AI page images on גגוליין — the policy that must already be in place, the authored slot plan, the Media Studio page-images toolkit in order (brief → digest → the owner's one yes → generate → qa → alt → finish → stage), review on npm run dev:images and the board, install, npm run gate, deploy (ask first) and the post-deploy image checks, the cost table, the retire and revocation policy, and what is site-specific for the next fleet site. Use when adding, regenerating, replacing or retiring images, when a candidate needs review, or when images:check fails. Triggers "generate the images", "run the image pipeline", "approve the batch", "replace this image", "retire an image", "images:check failed", "stage the candidates".
---

# Page images — the pipeline, site side

Read first: `CLAUDE.md` §14 (the decisions), skill `page-imagery` (what the words may say, the slot
inventory, the manifest contract) and the contract that fixes every path and command —
`C:\Users\robiu\antigravity\Projects\Media Studio\page-images\docs\contract.md`. Where this file and
the contract disagree, the contract wins.

The toolkit lives in Media Studio, not here. This repo contributes the slot plan, the components,
the validator (`lib/images.ts`) and the gate (`scripts/images/check-images-out.mjs`); it carries no
`sharp` and no new dependency.

## The owner's five touches — everything else runs unattended

| #   | Touch                                                                                 | Where                                                 |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Approve the plan (done 2026-10-28)                                                    | chat                                                  |
| 2   | Keep the consent record for ניסים and שימי (relayed in chat; signed copies to follow) | `Media Studio\refs\gagoline\CONSENT.md` (outside git) |
| 3   | One "yes" on the prompt-batch digest                                                  | `Media Studio\sites\gagoline\plan-digest.md` → chat   |
| 4   | One board session (~110 cards: "approve all passing" + spot checks)                   | `http://localhost:4310` beside `npm run dev:images`   |
| 5   | Confirm the deploy                                                                    | `ops/deploy-site.ps1 -Domain gagoline.co.il -Confirm` |

Expected unattended time ≈ 1.5 h; expected spend ≈ US$28 against a hard cap of US$50.

## 0. Prerequisites

- The policy is in place: `CLAUDE.md` §14, this skill, `page-imagery`, the agents, the docs. The retired-wording grep from the plan's step 8.1 (`C:/Users/robiu/.claude/plans/i-want-to-create-clever-stearns.md`) returns nothing over `CLAUDE.md docs .claude lib app`.
- `npm run gate` is green with the manifest as it is (an empty `images[]` passes while
  `gates.minPerContentPage` is 0).
- Media Studio: `cd page-images && npm install && npm test`; `secrets/.env` holds `GEMINI_API_KEY`
  (billing on) and `ANTHROPIC_API_KEY` — referred to by name, never printed.
- `Media Studio\refs\gagoline\` holds the portraits (`nissim-0N.png`, `shimi-0N.png`),
  `prepared\*.jpg` and `CONSENT.md`. Nothing from that folder is ever copied into this repo.
- `node page-images/cli.mjs doctor --site gagoline` is all green.

Toolkit commands below run from the Media Studio root:
`cd "C:\Users\robiu\antigravity\Projects\Media Studio"` then
`node page-images/cli.mjs <cmd> --site gagoline [--dry-run]`. Every command prints what it would do
with `--dry-run`; use that form before anything that spends money or writes into this repo.

## 1. The slot plan

`content/images/plan.json` is authored here by the `image-art-director` agent: one entry per new
render (100 of them; the inventory is in `page-imagery` §2 and contract §2), plus a `reuse` list.
Subjects are English scene briefs; `context` is a Hebrew excerpt from the page the image sits
beside; `fileSlug` is subject-based and **never contains a city name**. Then:

```powershell
node page-images/cli.mjs plan lint --site gagoline
```

The lint refuses duplicate ids or slugs, unknown routes or slots, a content route with fewer than
two images counting reuse, mixed aspects in one row, a city in a slug, two city slots with the same
(subject stem, people, time) tuple, and people where the policy forbids them.

## 2. Prompts and the digest

```powershell
node page-images/cli.mjs brief --site gagoline       # prompts/gagoline/<slot-id>.md, approved: null
node page-images/cli.mjs digest --site gagoline      # sites/gagoline/plan-digest.md
```

The digest is one page: one line per slot, the fixed blocks (PEOPLE, TRADE, CAMERA, ISRAEL, NO
TEXT, COMPOSITION) once, the consent record, the disclosure text, the cost estimate, and the batch
fingerprint `<sha8>`. Give it to the owner.

## 3. The owner's yes → approve

Only after the owner says yes **in chat** to that digest:

```powershell
node page-images/cli.mjs approve --batch <sha8> --by "owner in chat"
```

Stamps `approved: YYYY-MM-DD  # batch <sha8>, owner in chat; QA amendments pre-authorised` into every
prompt whose fingerprint matches; refuses any prompt edited since. Nobody edits `approved:` by hand.
"QA amendments" covers the auto-regenerate's `## Fix after attempt N` additions only; a new scene
is a new batch.

## 4. Calibrate the judges once

```powershell
node page-images/cli.mjs qa --site gagoline --calibrate
```

Both vision judges score the labelled frames already on disk (thermoleak's 45, the galbath sparkle
set, the 3locksmiths rejects, `gagoline_9`/`_10`). Go only when every HARD code reaches ≥ 90 %
recall. About US$3.

## 5. Generate → qa → alt → finish → stage, in batches

Batch order: services + gallery (32) → home, about, contact, pricing, areas hub (14) → cities (46)
→ guides (8). For each batch:

```powershell
node page-images/cli.mjs generate --site gagoline --only services- --dry-run
node page-images/cli.mjs generate --site gagoline --only services- --cap 50
node page-images/cli.mjs qa       --site gagoline --only services-
node page-images/cli.mjs alt      --site gagoline
node page-images/cli.mjs finish   --site gagoline
node page-images/cli.mjs stage    --site gagoline --dry-run
node page-images/cli.mjs stage    --site gagoline
```

- `generate` is idempotent by render key, runs 2 at a time with 6 s pacing, retries 429/5xx, writes
  every paid call to `logs/page-images/gagoline.ledger.jsonl` and refuses past the cap. Measure the
  refusal rate on the first ten frames with people; a Gemini refusal on a face prompt gets one
  framing retry (three-quarter from behind), then a people-free variant of the same slot.
- `qa` = deterministic checks (ratio, edge strips, corner sparkle, near-duplicates, blur) + two
  judges with the HARD/SOFT codes (`page-imagery` §9). Auto-regenerate up to 3 attempts, then
  `needs-owner` with the best attempt kept.
- `alt` writes the Hebrew alt and caption from the finished pixels; two re-asks, then
  `alt-needs-edit` on the board. Never type alt text into the manifest yourself.
- `finish` resizes to the exact slot box, composites the logo bottom-right (white with a shadow on
  dark corners, navy on light), writes WebP q80 (q74 above 160 KB), drops metadata.
- `stage` copies candidates to `public/images/_candidates/<group>/` (gitignored) and appends
  `status: "candidate"` entries to `content/images/manifest.json`.

## 6. Review on the real pages

```powershell
npm run dev:images                                  # next dev with IMAGES_DRAFT=1, here
node page-images/cli.mjs review --site gagoline     # the board at http://localhost:4310
```

Candidates render in place with the «טיוטה — ממתין לאישור» badge; each board card links to
`http://localhost:3000<route>#img-<id>`. Before the owner's session, run the `image-qa-reviewer`
agent for a second-opinion pass and fix what it finds (regenerate, or edit the alt on the board).
Decisions persist to `Media Studio\review\gagoline\decisions.json`.

Prove the draft markers once: `IMAGES_DRAFT=1 npm run build` leaves `out/.images-draft` and
`out/.live-draft`, and the hub's `deploy-site.ps1 -Domain gagoline.co.il -DryRun` refuses that
build. Then rebuild without the variable before anything else.

## 7. Install, status, gate

```powershell
node page-images/cli.mjs install --site gagoline --dry-run
node page-images/cli.mjs install --site gagoline
# replacing an approved image? retire the old entry here, before anything builds: status retired,
# retired <date>, approved null. install does not do it, and lib/images.ts throws on two approved
# entries in one slot.
node page-images/tools/phone-copies.mjs --site gagoline   # the 720-px copy of every newly approved image
npm run images:status          # plan vs manifest per route
npm run gate                   # lint · typecheck · format:check · build (+postbuild) · seo:assert · links:check · contrast:check · images:check
```

Approved → `public/images/<group>/<file>`, `status: "approved"`, the owner's edited text; rejected
→ deleted from `_candidates/` (never entered git), copy kept under `Media Studio\finished\gagoline\rejected\`;
regenerate → queued for the next batch. `git status` must show only `public/images/**`,
`content/images/manifest.json` and `content/revisions.ts`; never `assets/`, never `_candidates/`.
Commit only when asked.

When every content route has its two images: flip `gates.minPerContentPage` to 2 in the manifest,
bump `content/revisions.ts` for `/`, `/services/`, `/areas/`, `/about/`, `/contact/`, `/pricing/`,
`/faq/`, `/gallery/`, `/blog/` and each guide's `dateModified`, and write the measured numbers into
backlog §10.2 and §2.6.

## 8. Deploy — ask first

Skill `deploy-gagoline`: `-DryRun`, show the delta and the drift check, wait for the owner,
`-Confirm`. Then the post-deploy image checks from that skill: every sitemap URL carries ≥ 2
content images with width/height/alt, the footer note on every page, `og:image` unchanged, a sample
`/images/...webp` answers 200 `image/webp`, PageSpeed mobile on `/`, one service and one city
(LCP ≤ 2.5 s, CLS 0), Rich Results Test on one service and one guide (no image in schema), Search
Console URL Inspection after a week. Then `node page-images/cli.mjs mirror --site gagoline`.

## Cost table

| Item                                           | Unit (USD)              | Expected              |
| ---------------------------------------------- | ----------------------- | --------------------- |
| `gemini-3-pro-image` frame with people, 2K     | 0.134                   | ≈ 95 renders ≈ 12.7   |
| `gemini-nano-banana-2.1` people-free frame, 2K | 0.0504                  | ≈ 65 renders ≈ 3.3    |
| Two judges per render                          | per provider list price | ≈ 6                   |
| Scene writing + alt/caption                    | per provider list price | ≈ 3                   |
| Calibration                                    | —                       | ≈ 3                   |
| **Total**                                      |                         | **≈ 28, hard cap 50** |

`status` prints the running total from the ledger. When `generate` refuses past the cap, stop and
report — the cap is the owner's number.

## Retire, replace, revoke

- A published `public/images/*` file is **never deleted or renamed casually**. Replacement = new
  slug + `retired: "YYYY-MM-DD"` on the old entry; file kept ≥ 60 days; then removed in one commit
  with its entry. `keep-previous-assets` is not extended — stable URLs do not need it.
- Rollback never deletes an image: `wrangler pages deploy .\out.prev` (copy the newest
  `_next/static` in first, CLAUDE.md §10) or `git revert` of the manifest commit.
- Revoked consent: a people-free twin at the same dimensions for every frame the person is in,
  installed as above, old entries retired, the refs deleted the same day, live removal within 14 days.
  Live removal means every public copy of those frames: the full file, the `-w720` phone copy and any
  thumbnail. The 14-day promise to the person beats the 60-day keep: set `revoked: "YYYY-MM-DD"` on
  each retired entry, and the gate then requires those files gone instead of kept.
- The four owner-supplied images stay first in the gallery (decision 3). The board shows them with
  their QA notes so they can be swapped one by one when the owner wants.

## Troubleshooting

| Symptom                                               | Do                                                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `images:check` fails on alt/caption stems             | Fix the text on the board (or ask the art director); never in the manifest by hand, never by weakening the stems                                              |
| `images:check`: unreferenced file                     | A file in `public/images/` with no manifest placement — install path skipped, or a stray copy. Fix the manifest through the toolkit; never delete a live file |
| `images:check`: two `fetchpriority="high"`            | A component passed `priority` twice; the first content image in DOM order is the only one                                                                     |
| `images:check`: `/images/` inside JSON-LD or og:image | Renderings never go there — remove the reference, not the check                                                                                               |
| `out/.images-draft` exists                            | The last build ran with `IMAGES_DRAFT=1`; rebuild without it                                                                                                  |
| Judge disagreement                                    | Regenerate; the board flags it; the owner decides                                                                                                             |
| `needs-owner`                                         | The best attempt is kept; list it for the board                                                                                                               |
| Gemini refuses a face prompt repeatedly               | The framing fallback already ran; accept the people-free variant for that slot                                                                                |

## What is site-specific for the next site

`Media Studio\sites\<slug>\site.json` carries the owner's policy (faces, names and where, proof of
work, decorative only, snapshot look, real-first, disclosure mode, metadata label, excluded routes,
city image mode), the people and their consent lines, the brand and logo files, the claim stems and
the models. On the site side: the slot table and components, the disclosure texts in
`lib/content.ts`, the banned stems in `lib/images.ts`, the excluded routes, and `plan.json`. The
onboarding steps are `Media Studio\runbooks\page-images-for-a-site.md`.

## Reviewing on a PC shared with other sessions

The board links to port 3000, which another site's dev server may hold. Give this site its own port:

```powershell
$env:IMAGES_DRAFT = '1'; npx next dev -p 3101          # in the site repo
$env:PAGE_IMAGES_DEV_ORIGIN = 'http://localhost:3101'  # in Media Studio, same shell
node page-images/cli.mjs review --site gagoline --no-dev
```

Follow one link before handing the board over. A production build and a dev server cannot share
`.next/`, so stop the dev server before `npm run gate` or a deploy.
