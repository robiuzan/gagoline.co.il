# assets/images — masters and review copies (not shipped)

Local, per-machine copies of the material behind `public/images/`. **Only this README is in git**:
`/assets/images/*` is gitignored (the repo is public, and the masters show two named people in
scenes that will never be published as-is), and nothing in this folder is deployed. What ships is
`public/images/<group>/<file>.webp`, written by the Media Studio page-images toolkit's `install`
step, and described entry by entry in `content/images/manifest.json`.

| Folder     | What lives here                                                                                                                                                   | Source of truth                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `masters/` | Full-size renders and their `.json` sidecars (model, prompt sha, refs sha, aspect, size, cost, attempt, QA verdict) for every image that reached `public/images/` | `Media Studio/masters/gagoline/<slot-id>/<renderKey8>-a<n>.<ext>` (durable, gitignored there too) |
| `review/`  | Copies of the board decisions, QA notes and rejected candidates for this site                                                                                     | `Media Studio/review/gagoline/decisions.json`, `Media Studio/finished/gagoline/rejected/`         |

- **Fresh clone / another machine:** this folder holds only this file. The durable copies live in
  Media Studio on the workstation that ran the pipeline (and in its `mirror` target). Nothing in the
  build reads this folder, so an empty one is fine.
- **Never put a file here to "get it on the site".** The only way pixels reach `public/images/` is
  the toolkit's `stage → review → install` path (CLAUDE.md §14, skill `page-images-pipeline`). A
  file dropped straight into `public/images/` with no manifest entry fails `npm run images:check`.
- **Reference portraits never come here.** They live in `Media Studio/refs/gagoline/` (gitignored,
  never uploaded, never copied into any site repo) with the consent record `CONSENT.md` beside them.

## Provenance of the four supplied images

This history moved here on 2026-10-28 from the header comment over `galleryImages` in
`lib/content.ts`, which no longer exists (the four are manifest entries now).

- **2026-08-27, commit `787b55e`.** The owner supplied ten images, `gagoline_1` … `gagoline_10`.
  Four were published to `/gallery/` — `gagoline_1.jpg`, `gagoline_3.jpg`, `gagoline_6.jpg`,
  `gagoline_7.jpg` — and from 2026-08-31 three of them also sat on the service pages they depict
  (roof sealing, bituminous sheets, leak detection). Six were rejected and moved to
  `.rejected-photos/` (gitignored, deliberately outside `public/` so no build can ship them):
  `_9` and `_10` were visibly AI-generated (`_9` carries an invented product name, "MEMBRANE
  PRO-SERIES / ROOFSEAL-X4", and garbled glyphs where a logo would sit), `_4` carries a third
  party's branding ("ULTRA-SEAL PRECISION FLASHING SYSTEMS") over a North American skyline, and
  `_2`, `_5`, `_8` are stock photography (`_2` is a northern-European tile roof).
- **2026-10-28.** The owner stated that the four published images were **also AI-made**. They were
  described in this repo until that day as "verified photographs"; that wording was wrong and has
  been removed everywhere. The four stay on the site (owner decision 3 of 2026-10-28) as
  **owner-supplied, AI-made** illustrations: manifest `provenance.kind: "owner-supplied"` with
  `originAsserted: false`, under the site-wide disclosure note, first in the gallery. Their original
  files keep their live URLs (`/gagoline_1.jpg` etc., via `legacySrc`); the watermarked copies the
  toolkit writes live at new slugs under `public/images/gallery/`.
- **Do not re-add any of the six rejected files.** The reasons they were rejected — text and
  branding in frame, foreign building stock, stock-photo look — are now HARD and SOFT codes in the
  toolkit's QA (skill `page-imagery` §9), so a generated frame with the same defects is rejected
  the same way.

## The never-delete rule

A file under `public/images/` that has been deployed is **never deleted or renamed casually**.
Crawled HTML, Google Images and shared links keep the URL. To replace an image: generate the
replacement, install it at a **new slug**, set `retired: "YYYY-MM-DD"` on the old manifest entry,
keep the old file for at least 60 days, and only then remove it — in one commit that also drops the
manifest entry. Revoked consent is handled the same way (a people-free twin at the same dimensions,
swapped in, old entry retired). A rollback never deletes an image either: redeploy `out.prev/` or
revert the manifest commit (CLAUDE.md §10, §14).
