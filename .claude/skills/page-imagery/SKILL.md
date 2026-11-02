---
name: page-imagery
description: Which picture belongs in which slot on גגוליין and what the words around it may say — the illustration rule (owner decision 2026-10-28: renderings and the four owner-supplied AI-made images are illustrations under one site-wide note, never evidence), the slot inventory with ratios, file boxes and rendered widths, the manifest contract, draft mode, the Hebrew alt and caption rules with the banned stems and the first-name rule, what check-images-out enforces, the legitimacy checklist seeded by the six-of-ten rejection, and the never-delete policy. Use before adding, briefing, judging or captioning any image, or deciding an aspect ratio. Triggers "what image goes here", "which aspect ratio", "add a photo", "can we use this image", "image brief", "alt text", "caption", "is this image allowed".
---

# Page imagery

Two questions, always in this order:

1. **What may the words around this picture say?** On this site a picture never testifies. The
   alt, the caption, the heading and the paragraph beside it are where a claim would be made, and
   those are governed by CLAUDE.md rule 1 exactly like a testimonial.
2. **Will it fit?** Geometry — measured, not guessed.

Until 2026-10-28 the first question was "may this picture exist at all?", and for most slots the
answer was no. The owner's decisions of that day (CLAUDE.md §14, business-facts §A) moved the rule
**from the pixels to the words**. The old checklist survives in §9, because the defects it named are
still defects — they are now rejection codes in the pipeline instead of reasons to have no picture.

---

## 1. The illustration rule (owner decision 2026-10-28)

Images on gagoline.co.il are **illustrations, never evidence**. Two kinds exist and both are
disclosed the same way:

- **Renderings** made with Google Gemini through the Media Studio page-images toolkit, some with the
  two consented technicians — ניסים (manager) and שימי — in frame, faces shown.
- **The four images the owner supplied on 2026-08-27**, which the owner stated on 2026-10-28 were
  **also AI-made**. Manifest `provenance.kind: "owner-supplied"`, `originAsserted: false`. They stay
  first in the gallery (decision 3). Everywhere they are "owner-supplied, AI-made" — never
  "verified real", never "photographs of our work". The history is in `assets/images/README.md`.

**The disclosure is site-wide, in three places, verbatim from `imagesNote` in `lib/content.ts`
(contract §7).** No per-image label, no הדמיה in any alt, no file-level marker
(`metadataLabel: false`; Google's SynthID stays in the pixels and is never tampered with).

| Where                            | Text                                                                                                                                                                                                                    | Marker                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `/gallery/` intro, `/about/`     | כדי להראות איך נראית כל עבודת איטום גם כשאין צילום מהשטח, חלק מהתמונות באתר הן הדמיות שנוצרו בכלי בינה מלאכותית, בהשתתפות אנשי הצוות שלנו. הן ממחישות שיטות עבודה וחומרים, ואינן תיעוד של עבודה, לקוח או כתובת מסוימים. | `data-images-notice="gallery"` |
| Footer, every page               | חלק מהתמונות באתר הן הדמיות להמחשה — פרטים בגלריה. («פרטים בגלריה» links to `/gallery/`, plain href, no fragment)                                                                                                       | `data-images-notice="footer"`  |
| `/about/`, under the team figure | בתמונה: ניסים ושימי מצוות גגוליין. התמונות באתר שבהם הם מופיעים הן הדמיות להמחשת העבודה, לא צילומים מעבודה מסוימת.                                                                                                      | `data-images-notice="about"`   |

**What the words may never do** — in an alt, a caption, a figcaption, a heading or a paragraph
near an image:

- claim a specific **job, city, date, customer, מ״ר, rating, price or duration**;
- say **ביצענו** near a picture or near a link to `/gallery/`. The service-page gallery paragraph
  is derived from `galleryServiceNames()` and reads «איך זה נראה — בגלריה: …»;
- say **לפני ואחרי** — no two files are a genuine pair;
- name a person, except **first names in captions whose every placement is `/about/`**; never a
  surname anywhere on the site; never a name in an `alt`; never a name in a file name;
- name a **city** — not in an alt, not in a caption, and **never in a file name** (`fileSlug` is
  subject-based). The page's own H2s supply the city.

**What stays forbidden in the pixels:** a certificate, licence, insurance document, rating, star
badge, review or before/after pair; any readable text, number plate, house number, logo or third
party's branding; any person other than the two consented technicians; a customer; foreign building
stock. **The watermark is composited by the toolkit after generation, never drawn by the model** — a
drawn logo is the `sparkle-or-watermark` hard reject.

**Where renderings never go:** `og:image` (the brand share card from the manifest stays), any
JSON-LD (`ImageObject` is off; `lib/article-jsonld.ts` untouched), and the Google Business Profile —
that one wants real phone photographs, which `docs/owner-requests.md` §2 still asks for.

---

## 2. The slot inventory

Container math, unchanged since it was measured on 2026-09-01: `max-w-6xl` = 1152px with
`px-4 / sm:px-6 / lg:px-8`, so the content column is **1088px** on desktop; `sm` = 640, `lg` = 1024,
no `--breakpoint` or `--container` override in `app/globals.css`. Prose pages (`/services/`,
`/areas/`, `/about/`, `/pricing/`, `/faq/`, `/blog/<slug>/`) wrap copy in `mx-auto max-w-3xl` =
**768px**. Service and city pages use `grid gap-10 lg:grid-cols-3` with the copy in `lg:col-span-2`
= **712px** on desktop, peaking at **~975px** just below `lg` (one column). `/contact/` is
`grid gap-10 lg:grid-cols-2` = **524px** per column.

Fixed by the contract (§2): scenes **4:3**, details **3:2**, one ratio per row; size classes
`large` 1600 long edge, `half` 1200 and `tile` 1200 each ≤ 256 KB (raised 2026-10-28: phone-grain macros do not compress below ~240 KB; the 900 KB per-page sum is the budget that matters), `thumb` 480 ≤ 45 KB; every approved image also has a **phone copy** 720 px wide, ≤ 120 KB, written
after install by `page-images/tools/phone-copies.mjs` (§4);
**exactly one `priority` image per page = the first content image in DOM order**; everything else
`loading="lazy" decoding="async"`. The rendered widths for the new slots below are computed from the
container math and a `gap-8` row gap; confirm them against the built markup once the components
exist (the file boxes do not depend on them).

| Route / template    | Slot(s)                                            | Ratio · file box · class                    | Position                                                                                                                | Priority · caption                                 | Rendered width (desktop)                |
| ------------------- | -------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------- |
| `/`                 | `strip-1..3`                                       | 4:3 · 1200×900 · `tile`                     | `<FieldStrip>` between `<Hero>` and `<TrustBar>`; 2 tiles on phones                                                     | tile 1 priority (≤ 90 KB); no caption              | ≈ 341px per tile (3 across in 1088)     |
| `/`                 | `team`                                             | 3:2 · 1200×800 · `half`                     | `<TeamTeaser>` after `<WhyUs>` — image + `aboutContent.answerA` + link; same file as `/about/` team                     | —                                                  | ≤ 528px beside the text                 |
| `/services/`        | `pair-1`, `pair-2`                                 | 4:3 · 1200×900 · `half`                     | end of the answer column, before `<ServicesGrid>`                                                                       | pair-1 priority                                    | 368px each (2 in 768)                   |
| `/services/<s>/` ×8 | `main`                                             | 4:3 · **1600×1200** · `large`               | under the answer block (replaces the 2026-08-31 `photo` figure)                                                         | priority · caption                                 | 712px (~975 peak)                       |
|                     | `detail`                                           | 3:2 · 1200×800 · `half`                     | after the prep paragraph, before the gallery paragraph                                                                  | caption                                            | 712px                                   |
|                     | `work`                                             | 3:2 · 1200×800 · `half`                     | after the duration / weather paragraphs — the finished result                                                           | caption                                            | 712px                                   |
| `/areas/`           | `strip-1..3`                                       | 4:3 · 1200×900 · `tile`                     | under the intro — one roof per region (גוש דן flat concrete · השרון tiled · דרום המרכז shikun + sea haze), never a city | strip-1 priority                                   | ≈ 235px each (3 in 768)                 |
| `/areas/<c>/` ×23   | `main`                                             | 4:3 · **1600×1200** · `large`               | under the answer block — technicians on a roof typical of this city's stock                                             | priority · caption                                 | 712px (~975 peak)                       |
|                     | `detail`                                           | 3:2 · 1200×800 · `half`                     | after the stock paragraphs — a roof-stock / exposure detail, no people                                                  | caption                                            | 712px                                   |
| `/about/`           | `team` (reuse of home)                             | 3:2 · 1200×800 · `half`                     | under the answer block — both technicians                                                                               | priority · **first-name caption** + the about note | 768px                                   |
|                     | `story`                                            | 4:3 · 1200×900 · `half`                     | after the story — a flood test, one technician                                                                          | —                                                  | 768px                                   |
|                     | `work`                                             | 3:2 · 1200×800 · `half`                     | after the principles                                                                                                    | —                                                  | 768px                                   |
| `/contact/`         | `main`                                             | 4:3 · 1200×900 · `half`                     | under the details list — the crew at a roof-access door, no plates                                                      | priority                                           | 524px                                   |
|                     | `team` (reuse)                                     | 3:2                                         | a 2-tile row under the grid                                                                                             | —                                                  | 528px                                   |
| `/pricing/`         | `survey`                                           | 3:2 · 1200×800 · `half`                     | under the intro — a tape measure, no readable digits                                                                    | priority                                           | 768px                                   |
|                     | `layers`                                           | 3:2 · 1200×800 · `half`                     | after the factors — a cut edge showing old coating layers                                                               | —                                                  | 768px                                   |
| `/faq/`             | `strip-1`, `strip-2` (reuse of two service `main`) | 4:3                                         | a 2-tile strip above the accordion                                                                                      | strip-1 priority                                   | 368px each (2 in 768)                   |
| `/gallery/`         | `supplied` ×4                                      | 1:1 · 1:1 · 4:3 · 16:9 · 1200 long · `half` | first, under the intro; watermarked copies at new slugs, originals keep their URLs                                      | tile 1 priority · caption                          | **528px** (measured: 2-col grid, gap-8) |
|                     | `generated-1..8`                                   | 4:3 · 1200×900 · `half`                     | under the note and the H2 «הדמיות — כך נראית העבודה», one per service, figcaption + link to the service                 | caption                                            | 528px                                   |
| `/blog/`            | `thumb` ×8 (derived from each guide's `lead`)      | 4:3 · 480×360 · `thumb`                     | start-side in each card (`max-w-4xl`)                                                                                   | first card priority                                | small — measure once the card exists    |
| `/blog/<a>/` ×8     | `lead`                                             | 4:3 · 1200×900 · `half`                     | after the byline                                                                                                        | priority · caption                                 | 768px                                   |
|                     | `mid` (reuse of the related service `detail`)      | 3:2                                         | the new `{ kind: "figure", slot: "mid" }` block after the 2nd H2                                                        | —                                                  | 768px                                   |

**100 new renders, 48 content pages, every one ≥ 2 images.** Excluded routes carry no content
image: `/privacy/ /terms/ /accessibility/ /404/ /thank-you/ /reviews/`.

**Not photo slots** — never propose a picture for these:

| Surface     | File / intrinsic                                                         | Markup                                                                   | Rendered                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header logo | `gagoline_logo_h120.png` 434×120 (3 KB palette PNG of the 600-px master) | `Header.tsx` — `h-9 w-auto sm:h-10`; eager, so React preloads it         | 130 → **145px** wide                                                                                                                               |
| Footer logo | `gagoline_logo_dark_bg_h120.png` 409×120 (5 KB, same)                    | `Footer.tsx` — `h-10 w-auto`, `loading="lazy"`; a separate file for navy | **136px** wide                                                                                                                                     |
| Favicon     | `gagoline_favicon.webp` 50×50                                            | `app/layout.tsx` declares the derived `.png` + `.ico`                    | 16–32px; no apple-touch-icon (source is 50px)                                                                                                      |
| OG card     | `gagoline/og.jpg` on imgquarry.com                                       | `manifest.images.og`, sha256-pinned, brand not photo                     | **1200×630**                                                                                                                                       |
| Hero        | —                                                                        | `Hero.tsx` — two radial gradients, text + lead form                      | **No image** (owner decision 6). The font preload stays the LCP lever on phones; on desktop the first figure may become LCP — measure after deploy |

The 600-px masters `gagoline_logo.png` and `gagoline_logo_dark_bg.png` stay in `public/` (never
delete a published file); a new `_h120` copy is made from them with sharp in Media Studio
(`resize({ height: 120 })`, `png({ palette: true, effort: 10, compressionLevel: 9 })`), never with
a dependency here. The two masters are the watermark masters in `Media Studio\sites\gagoline\brand\`
(`logo-navy.png`, `logo-white.png`), byte-identical to the Drive copies.

---

## 3. Nothing on this site crops

**There is no `object-cover`, no `object-contain`, no `aspect-*` and no CSS background image
anywhere in `app/` or `components/`** (measured 2026-09-01; the new `Figure`, `FieldStrip` and
`TeamTeaser` keep it that way). Every image is `w-full` with its intrinsic `width`/`height` emitted.

- **What is framed is what ships.** The bottom-right corner must be plain roof, wall or sky,
  because the logo is composited there.
- **The file's aspect ratio becomes the page's layout**, so the ratio is fixed per slot by the
  contract, and a row never mixes ratios. The gallery's four supplied images are the one ragged row
  (1:1, 1:1, 4:3, 16:9) — kept as supplied, by decision.
- **A focal point cannot rescue anything.** `focal` in the manifest is read by nothing.
- Master width: `large` 1600 for the 712px-rendered figures that peak at ~975 CSS px (1.6× there);
  `half`/`tile` 1200 everywhere else; `thumb` 480.

---

## 4. The markup contract

`images: { unoptimized: true }` in `next.config.mjs`, so **`next/image` emits no `srcset`** and only
adds client JS. Every content image goes through **`components/ui/Figure.tsx`**: the kit's
`SiteImage` in ad-hoc mode (`src`/`alt`/`width`/`height`), `priority` on the first content image
only, `loading="lazy" decoding="async"` on the rest, an optional figcaption, `data-image-id`, and a
dev-only badge «טיוטה — ממתין לאישור» when the entry is a `candidate`. `FieldStrip` renders 2–3
tiles and nothing below 2; `TeamTeaser` renders the team image beside `aboutContent.answerA` and a
link.

- **`width` and `height` are mandatory** and equal to the manifest's measured pixels. They reserve
  the box; CLS stays 0 by construction.
- **Exactly one `priority` per page.** The gate counts `fetchpriority="high"` and checks it is the
  first `/images/` image in the DOM.
- **Phones get the phone copy through `<picture>`.** A static export has no resizer and the kit's
  `SiteImage` serves a local file verbatim, so `Figure` wraps it: `<source media="(max-width: 640px)"
srcSet="…-w720.webp">` around the same `<img>`. Below 640 px a phone downloads about 39 KB instead
  of 136 KB. Never hand-write a `sizes` without a `srcset`; nothing here needs one. The gate fails an
  approved entry with no copy, and a figure that does not offer it.
- **Anything in `public/` is copied into `out/` and published by every deploy.** Approved files live
  in `public/images/<group>/`; staged candidates in `public/images/_candidates/` (gitignored) are
  pruned from `out/` unless `IMAGES_DRAFT=1`.
- Each image carries the anchor `#img-<id>`; the review board links to it.

---

## 5. The manifest and the plan

Two JSON files under `content/images/`:

- **`plan.json` — authored here**, by the `image-art-director` agent, Prettier-formatted. One entry
  per new render: `id` (route key + slot: `home-strip-1`, `services-roof-sealing-main`,
  `areas-strip-2`, `cities-tel-aviv-detail`, `blog-<slug>-lead`), `route`, `slot`, `order`, `group`,
  `fileSlug` (ASCII, subject-based, no city), `aspect`, `longEdge`, `sizeClass`, `priority`,
  `caption`, `people` (`none | nissim | shimi | both`), `phase` (`done | in-progress | diagnosis |
materials`), `season`, `time`, `service`, `city`, `subject` (English, 40–120 words), `context`
  (a Hebrew excerpt from the page), `differentiateFrom`; plus a `reuse` list. The toolkit only
  reads it (`plan lint`).
- **`manifest.json` — written by the toolkit** (`stage`, `install`), listed in `.prettierignore`,
  never hand-edited except to flip `gates.minPerContentPage` from 0 to 2 once every content route
  has its two images. Entry: `id`, `file`, `legacySrc`, `width`, `height`, `bytes`, `sha256`,
  `sizeClass`, `alt`, `caption`, `altEn`, `thumb`, `placements[{route, slot, order}]`, `status`
  (`candidate | approved | rejected | retired`), `people[]`, `phase`, `service`, `city`,
  `provenance` (`ai-generated` with tool/model/created/prompt/promptSha/masterSha/refs, or
  `owner-supplied`), `watermark`, `review.automated` + `review.owner`, `approved`, `retired`.

`lib/images.ts` validates the manifest at module init and `scripts/images/check-images-out.mjs`
validates it again on `out/` (§8): unique ids and files; a known content route and `SlotId` per
placement; approved files under `public/images/`, candidates under `_candidates/`, no file for
`rejected`, files kept ≥ 60 days for `retired`; `legacySrc` wins over `file`; the alt and caption
rules of §7; `watermark` on every entry except the untouched legacy originals;
`review.automated.verdict` of `pass` or `pass-with-note` before `status: approved`. It exports
`imagesFor(route, slot)`, `imageFor`, `stripFor`, `galleryServiceNames` and `imagesDraftMode`.

`manifest.images.gallery` in `site.config.json` stays `null`; `ops/sync-media.ps1` and the roster
are not involved in page images. Never edit either for an image.

---

## 6. Draft mode — a candidate is a 🔶

Without `IMAGES_DRAFT=1` only `approved` entries render. With it (`npm run dev:images`, or
`IMAGES_DRAFT=1 npm run build` for a one-off proof) `candidate` entries render too, from
`/images/_candidates/`, with the dev badge. A draft build writes **`out/.images-draft` and
`out/.live-draft`**, so the hub's `deploy-site.ps1` refuses it and `keep-previous-assets` skips it.
CLAUDE.md rule 2 applies: an image whose status is not `approved` must never reach a visitor. If
either marker file exists in `out/`, rebuild without the variable.

---

## 7. alt and caption

Hebrew, because the page is `lang="he" dir="rtl"`. Written by the toolkit's `alt` step from the
finished pixels, edited on the board or by the art director, validated by `lib/images.ts` and the
gate. They live in the manifest — the one kind of visitor-facing text that does not sit in
`lib/content.ts`, which is why the validator exists.

**Describe what is inside the frame. Nothing else.**

- `alt`: non-empty, contains Hebrew letters, 20–200 characters (the writer aims for 40–160 with
  ≥ 60 % Hebrew letters). No `תמונה של`. No city name (all 23 from `lib/site-config.ts`). No
  4-digit year. No digits before `מ״ר`, `מ״מ` or `מ"ר`. No `לפני ואחרי`. No `כוכב`, `דירוג`, `★`,
  `מומלץ`. No `הדמיה`, `AI`, `בינה` — the disclosure is site-wide, not per image. No ASCII `"` or `'`
  touching a Hebrew letter. **Never a first name.**
- `caption`: the same rules, 40–200 characters, trade context the picture supports — an activity,
  never a finding, never a result claim ("the roof is dry now"). **First names allowed only when
  every placement of the entry is `/about/`.**
- Abbreviations take גרש `׳` and גרשיים `״` — `מ״מ`, `מ״ר`, `ק״מ` — never ASCII quotes.
- The bar: _would this sentence still be true if the picture were a real photograph?_ If it names
  anything the camera could not have seen, it fails.

Register references — the shipped alt of the first supplied image, and a caption in the new form:

> `גג שטוח מכוסה יריעות ביטומניות, עם פתח ניקוז ורשת ומעטפת איטום סביב ארובה נמוכה`

> `ציפוי אלסטומרי מתחיל בפרטי הקצה — המעקה והחיבור לקיר — ורק אחר כך בשטח הגג.`

The about note («בתמונה: ניסים ושימי …») is `imagesNote.about` in `lib/content.ts`, rendered under
the team figure — it is not a caption and the first-name rule for captions does not extend it to
other pages.

---

## 8. What the gate enforces — and what it still cannot

`node scripts/images/check-images-out.mjs out` runs in `postbuild` after `seo-assert` and before
`keep-previous-assets`, as `npm run images:check`, and inside `npm run gate` (same shape as
`seo-assert.mjs`; dependency-free — `scripts/images/lib/imageinfo.mjs` reads headers without a
library). It fails the build on:

- a manifest that breaks §5 or an alt/caption that breaks §7, including an ASCII quote touching
  Hebrew;
- an `approved` file missing from `public/` or `out/`, or whose header dimensions or bytes differ
  from the manifest, or over its class budget (`large`, `half` and `tile` 256 KB, `thumb` 45 KB);
- any `<img>` on any page without numeric `width`/`height` or with an empty `alt` (unless
  `aria-hidden`);
- a `_candidates` or `rejected` reference in a non-draft build, or an `out/.images-draft` marker;
- a referenced `/images/*` path that does not exist or is not `approved`;
- **an unreferenced file under `public/images/`** (except `retired` ≤ 60 days) — a file nobody
  placed is a stray;
- a content page below `gates.minPerContentPage` images, or whose summed image bytes exceed 900 KB;
- zero or more than one `fetchpriority="high"` on an image-bearing page, or one that is not the
  first content image;
- a `/images/` path inside any `application/ld+json` or `og:image`;
- a missing disclosure marker (`footer` on every page, `gallery`, `about`);
- `out/images` over 20 MB in total; a file shared between two `/areas/*` pages.

It prints a per-route coverage table. **What no script checks:** whether the scene is plausible,
whether the trade kit is right, whether the face is the consented person, whether the frame looks
like a snapshot or a photoshoot. The toolkit's two judges, the `image-qa-reviewer` agent and the
owner's board are that enforcement. Per `docs/README.md` §3 — a rule no script enforces is a
suggestion, so say which half a finding belongs to.

---

## 9. The legitimacy checklist — seeded by the six-of-ten precedent

2026-08-27, commit `787b55e`: ten images supplied, four published, six rejected and moved to
`.rejected-photos/` (gitignored, outside `public/`). **Do not re-add any of the six.** What rejected
them is now a rejection code in the pipeline (contract §9):

| Rejected then            | Why                                                                                                                | Code now                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `gagoline_9`, `_10`      | AI-generated with an invented product — "MEMBRANE PRO-SERIES / ROOFSEAL-X4" — and garbled glyphs where a logo sits | `text`, `branding`, `sparkle-or-watermark` |
| `gagoline_4`             | A third party's branding, "ULTRA-SEAL PRECISION FLASHING SYSTEMS", over a North American skyline                   | `branding`, `foreign`                      |
| `gagoline_2`, `_5`, `_8` | Stock photography; `_2` is a northern-European tile roof                                                           | `photoshoot-look`, `foreign`               |

**HARD** — any judge, any reviewer → reject or regenerate: `text` · `branding` · `plate-or-number` ·
`extra-person` · `face-mismatch` · `wrong-trade` · `foreign` · `impossible` (floating or duplicated
objects, hands, merged limbs) · `unsafe-edge` · `rating-or-document` · `landmark` ·
`sparkle-or-watermark` · `nsfw-or-minor`.

**SOFT** — both judges must pass: `photoshoot-look` · `cluttered` · `low-quality` · `scene-mismatch`
· `safety-gear-indoors` · `busy-corner` · `season-mismatch`.

The four kept images are Israeli sites with no foreign branding, but they carry in-frame
manufacturer stamping and text the new checklist would reject. The owner keeps them (decision 3);
the board shows them with their QA notes so they can be swapped one by one when the owner wants.

---

## 10. Never delete

A deployed `public/images/*` file is never deleted or renamed casually: crawled HTML, Google Images
and shared links keep the URL. Replacement = a new slug, `retired: "YYYY-MM-DD"` on the old entry,
the old file kept ≥ 60 days, then removed in one commit with its entry. Revoked consent is handled
the same way with a people-free twin at the same box. A rollback never deletes an image. The history
of every file is in `assets/images/README.md` and the sidecars in `Media Studio\masters\gagoline\`.

---

## 11. Where the pixels come from

```
content/images/plan.json  ──▶  Media Studio page-images: brief → digest → owner yes → approve
                               → generate → qa → alt → finish          (masters/, finished/)
                               → stage ──▶ public/images/_candidates/ + manifest `candidate`
                               → review (board + npm run dev:images) → the owner decides
                               → install ──▶ public/images/<group>/ + manifest `approved`
                                              → out/ → deploy (ask)
```

The runbook with every command is skill `page-images-pipeline`; the toolkit's own rules are Media
Studio's skill `page-images` and `page-images/docs/contract.md`. The site repo carries no `sharp`,
no toolkit code and no reference portrait — only the plan, the manifest, the approved files, the
components and the gate.
