---
name: page-imagery
description: Which picture belongs in which slot on גגוליין — the provenance rule that decides whether a photograph may exist at all, the measured inventory of every image position with its rendered width and the markup contract, why nothing on this site crops, alt and caption rules, and the six-of-ten rejection precedent. Use before adding a photo, writing an image prompt, judging a supplied batch, or deciding an image's aspect ratio. Triggers "what image goes here", "which aspect ratio", "add a photo", "can we use this image", "image brief", "alt text".
---

# Page imagery

Two questions, always in this order:

1. **May this picture exist on this page at all?** A photograph on a roofing site asserts _we did
   this work_. That is a business fact under CLAUDE.md rule 1, exactly like a testimonial.
2. **Will it fit?** Geometry — and the answers are measured, not guessed.

On most sites question 2 is the hard one. **Here it is question 1**, and the correct answer is often
"no picture; ask the owner for a real one".

---

## 1. The provenance rule

> A portfolio gallery asserts "this is our work", so an unsourced photo is a fabricated review with
> better production values. — the header comment over `galleryImages` in `lib/content.ts`

**Provenance-bound slots.** The picture must be a real photograph of this business's own work:

- `galleryImages` in `lib/content.ts` → `/gallery/`
- `serviceImage` in `lib/content.ts` → the figure on a service page (it reuses `galleryImages`)

Into those, a generated image, a stock image, or a photograph of somebody else's job is a
**fabricated claim** — not a placeholder, not a temporary stand-in. No approved-prompt route makes it
acceptable, because the defect is not in how the pixels were made. It is in what the page says about
them.

**Non-evidential surfaces.** A picture here claims no job:

| Surface                             | Status                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Logo (header, footer), favicon      | Brand marks. Already shipped                                               |
| OG share card                       | Generated from the manifest by `ops/make-og-card.ps1` — brand, not a photo |
| A labelled diagram or cross-section | Legitimate, and none exists yet. It illustrates; it does not testify       |

**City pages carry no photograph, deliberately.** A picture on `/areas/ramat-gan/` asserts a job in
רמת גן, and no location is sourced (business-facts §A). Backlog §7.3 records this as a decision, not
an omission.

**A photograph is never captioned as a specific job** — no city, no date, no customer, no מ״ר, no
לפני/אחרי. None of that is sourced, and a caption fabricates a fact exactly as easily as a
testimonial does.

---

## 2. The slot inventory

The container is `max-w-6xl` (**1152px**) with `px-4 / sm:px-6 / lg:px-8`, so the content column
maxes at **1088px**. Tailwind defaults are unmodified — there is no `--breakpoint` or `--container`
override in `app/globals.css` — so `sm` = 640px and `lg` = 1024px. The widths below are computed
from that.

| Slot                | File / intrinsic                    | Governing markup                                                                            | Rendered width                                                            |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Gallery tile ×4** | `public/gagoline_{1,3,6,7}.jpg`     | `app/gallery/page.tsx` — `grid gap-8 sm:grid-cols-2`, `SiteImage` at `w-full rounded-xl`    | **528px** desktop · peaks at **~607px** at a 639px viewport (one column)  |
| **Service figure**  | reuses three of the gallery photos  | `app/services/[service]/page.tsx:127` — plain `<img>` in `lg:col-span-2` of a `gap-10` grid | **712px** desktop · peaks at **~975px** just below `lg` (one column)      |
| **Header logo**     | `gagoline_logo.png` 600×166         | `components/layout/Header.tsx` — `h-9 w-auto sm:h-10`                                       | 130 → **145px** wide (36/40px tall)                                       |
| **Footer logo**     | `gagoline_logo_dark_bg.png` 600×176 | `components/layout/Footer.tsx` — `h-10 w-auto`; a separate file because the footer is navy  | **136px** wide                                                            |
| **Favicon**         | `gagoline_favicon.webp` 50×50       | `app/layout.tsx:48` declares the derived `.png` + `.ico`                                    | 16–32px. **No apple-touch-icon** — iOS wants 180×180 and the source is 50 |
| **OG card**         | `gagoline/og.jpg` on imgquarry.com  | `manifest.images.og`, sha256-pinned, 38,603 bytes                                           | **1200×630**, fixed by every social platform                              |
| **Hero**            | —                                   | `components/marketing/Hero.tsx` — two CSS radial gradients on `bg-primary`                  | **No image.** LCP is the H1 text, so the font preload is the LCP lever    |
| **Article figure**  | —                                   | **Does not exist.** `content/articles/types.ts` has no `image` block kind                   | Adding one is a code change, not an art-direction call                    |

Two of those are **not photo slots**: the logos and the favicon. Never propose a photograph for
either.

The logo masters are ~4× the pixels they need even at 2× DPR (600px for a 145px render, 40KB). That
is a perf note, not an art-direction one — leave them alone unless asked.

---

## 3. Nothing on this site crops

**There is no `object-cover`, no `object-contain`, no `aspect-*` and no CSS background image
anywhere in `app/` or `components/`** (measured 2026-09-01). Every image is `w-full` with its
intrinsic `width`/`height` emitted.

That inverts the usual advice:

- **Composition does not need to survive a crop.** What is framed is what ships.
- **The file's aspect ratio becomes the page's layout.** Choosing 16:9 over 4:3 is a layout decision
  disguised as a photo decision, and nobody reviews it as one.
- **Mixed ratios go ragged in the gallery grid.** Row 1 pairs two 1:1 files and lands flush. Row 2
  pairs `gagoline_6` (4:3 → 396px tall) with `gagoline_3` (16:9 → 297px tall) and leaves ~99px of
  dead space beneath the wider one. **Ask for gallery photographs in pairs of matching ratio**, or
  accept the ragged row deliberately.
- **A focal point cannot rescue anything.** The manifest carries `focal` and nothing here reads it,
  because nothing crops.

Master width: **1000px is the floor, and it is already tight.** The service figure renders at ~975
CSS px just under `lg`, so a 1000px file is effectively 1× on a retina tablet. Ask for **1600px on
the long edge** for anything destined for a service page.

---

## 4. The markup contract

`images: { unoptimized: true }` in `next.config.mjs`, so **`next/image` emits no `srcset`** here and
only adds client JS. Every image is therefore either the kit's `SiteImage` or a plain `<img>` with an
`eslint-disable-next-line @next/next/no-img-element`.

- **`width` and `height` are mandatory** and must be the file's true intrinsic pixels. They reserve
  the box; without them CLS regresses with no build error to catch it.
- **Exactly one `priority` per page.** On `/gallery/` it is tile 1 (`i === 0`); everything else is
  `loading="lazy" decoding="async"`.
- **Local `public/` paths get no `srcset`, correctly.** A static export has no resizer, so `srcsetFor`
  emits nothing — advertising widths the origin cannot produce would be a lie. Never hand-write a
  `sizes` without a `srcset`: it reviews as correct and does nothing.
- **Anything in `public/` is copied into `out/` and published by every deploy**, whether or not a page
  references it. Two rejected photos were reachable on the live domain exactly this way until
  2026-08-27.

---

## 5. alt and caption

Hebrew, because the page is `lang="he" dir="rtl"`. Both are authored in `lib/content.ts`, never in
JSX.

Describe **what is inside the frame**. Nothing else.

- No `תמונה של`.
- No city, date, customer name, מ״ר, duration or price — none is sourced.
- No `לפני`/`אחרי` unless the two images are a genuine pair, which none of the four are.
- No rating, no volume claim, no years of experience. An unsourced claim is no more acceptable in an
  `alt` attribute than in an `<h2>`, and it is far less likely to be noticed.

The shipped set is the register reference — concrete, physical, free of anything the camera did not
see:

> `גג שטוח מכוסה יריעות ביטומניות, עם פתח ניקוז ורשת ומעטפת איטום סביב ארובה נמוכה`

A caption may add trade context the picture itself supports:

> `איטום נוזלי סביב חדירת צינור בגג פח — נקודות החדירה הן המקום שממנו נזילות מתחילות.`

Hebrew abbreviations take גרש `׳` / גרשיים `״` — `מ״מ`, `מ״ר` — never ASCII quotes.

---

## 6. What is not enforced — read this before trusting the gate

`npm run gate` runs lint, typecheck, format:check, build, `seo:assert`, `links:check` and
`contrast:check`. **None of them looks at an image.** `scripts/seo-assert.mjs` contains no `alt`,
`img` or image assertion of any kind (measured 2026-09-01).

The only automated guard that touches imagery is the rendered-🔶 check, and it fires on copy, not on
pixels. So:

- A photograph with no provenance passes the gate.
- Alt text asserting a rating passes the gate.
- A missing `width`/`height` passes the gate and ships the CLS.

Per `docs/README.md` §3 — _a rule that no script enforces is a suggestion._ On this site the review
**is** the enforcement. Do it properly.

---

## 7. Where the pixels come from

Two routes, and today the photographs use the older one:

```
owner's phone  →  public/*.jpg  →  out/  →  deploy         ← the four gallery photos, today
Media Studio   →  imgquarry.com →  ops/sync-media.ps1  →  roster + site.config.json → manifest.images
                                                           ← the OG card only, today
```

`manifest.images.gallery` is `null`. When the photographs move to the media host they become
`images.gallery` and `app/gallery/page.tsx` passes `image={...}` instead of `src/alt/width/height`;
nothing else in that file changes. Until then a photograph is a committed file, and its dimensions
are measured from the bytes rather than assumed.

`site.config.json` is synced from `Israeli services sites/roster/sites/gagoline.json` — **never edit
either by hand** for an image. `ops/sync-media.ps1` writes that block.

---

## 8. The precedent — six of ten rejected

2026-08-27, commit `787b55e`. Ten photographs supplied, **four published and six rejected**, moved to
`.rejected-photos/` (gitignored, deliberately outside `public/` so no build can ship them):

| Rejected                 | Why                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `gagoline_9`, `_10`      | AI-generated. `_9` carries an invented product — "MEMBRANE PRO-SERIES / ROOFSEAL-X4" — and a smear of garbled glyphs where a logo would sit |
| `gagoline_4`             | A **third party's** branding: "ULTRA-SEAL PRECISION FLASHING SYSTEMS", over a North American skyline                                        |
| `gagoline_2`, `_5`, `_8` | Stock photography. `_2` is a northern-European tile roof                                                                                    |

The four kept are Israeli sites, with real manufacturer stamping and no foreign branding.

**Do not re-add any of the six.** The criteria they establish are the working checklist in §2 of the
`image-art-director` agent.
