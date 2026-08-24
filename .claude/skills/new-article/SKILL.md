---
name: new-article
description: Publish a Hebrew knowledge-hub article under /blog/[slug]/ — the typed block model, author attribution and dates, Article + BreadcrumbList + FAQPage schema derived from the blocks, the answer-block opening, and internal links into services and cities. Use when adding editorial content for topical authority and AEO. Triggers "write an article", "blog post", "knowledge hub", "מדריך", "topical authority", "guide".
---

# Publish an article

`/blog/` exists as a **stub** — `app/blog/page.tsx` renders "תכני הבלוג בדרך 🔶" and sits in the
sitemap, indexable. So the first decision is not what to write; it is whether the hub ships at all.

**If no article is imminent, `noindex` or remove `/blog/` first** (backlog §7.4). An indexed empty page
spends crawl budget to demonstrate that the site is unfinished. Publishing one real article is the
better fix — this is where the Tier-3 questions in `docs/keyword-map.md` §2 get answered properly, and
it is the whole topical-authority and AEO gap in one route.

## Route

`/blog/` (index) and `/blog/[slug]/` (detail). Slugs are **Latin ASCII**, matching the rest of the
site — no Hebrew-route percent-encoding machinery needed. Fully static-export compatible:
`generateStaticParams` + `dynamicParams = false`.

## Typed blocks, not MDX

Articles live in `content/articles/<slug>.ts` as typed data:

```ts
export type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "answer"; q: string; a: string } // → the AEO block + schema
  | { kind: "faq"; items: { q: string; a: string }[] } // → FAQPage
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "callout"; tone: "note" | "warn"; text: string }
  | { kind: "cta"; text: string };

export interface Article {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string; // ISO
  authorId: string; // → team[] in lib/content.ts
  heroImage?: { src: string; alt: string };
  blocks: Block[];
  relatedServices: readonly ServiceSlug[];
  relatedCities?: readonly CitySlug[];
}
```

Why typed blocks rather than MDX: no new dependency and no second build step in a repo whose build is
already the release gate; strict TS and `noUncheckedIndexedAccess` stay meaningful; and — the real
reason — **`FAQPage` and the answer block are derived from the `faq` and `answer` blocks**, so the
schema cannot drift from the copy as it is edited.

## Structure

1. `<h1>` = the question, verbatim.
2. **An `answer` block within the first 60 words** — the complete answer before any preamble
   (`docs/content-standards.md` §5).
3. Body with **question-form `<h2>`s**. Each section answerable on its own.
4. At least one `table` or `list` a reader would screenshot — a cost breakdown by roof type, a
   זיפות-versus-יריעות comparison, a materials matrix. This is what makes the page citable rather than
   merely correct.
5. A `faq` block, 3–5 questions.
6. Author byline, `datePublished`, `dateModified`.
7. 2–3 in-copy links to services and 1–2 to cities, with descriptive Hebrew anchors and trailing
   slashes.
8. A `cta` block.

900-word floor. Depth is the point; a 900-word article that repeats the service page is worse than no
article.

## Schema

`Article` with `headline`, `description`, `image`, `datePublished`, `dateModified`, `author`
(a `Person` with a **real** name), `publisher` (`@id` → `#organization`), `mainEntityOfPage`. Plus
`BreadcrumbList` (`בית › בלוג › {title}`) and `FAQPage` derived from the `faq` blocks. See
`docs/schema-graph.md` §6.

**The author must be a real named person** — blocked on `docs/business-facts.md` §B, which is empty
because nobody is named anywhere on this site. **Never invent a byline.** A fabricated author is a
worse trust signal than no author, and this repo already demonstrates how long fabricated content
survives once it ships.

## Topic selection

Start from `docs/keyword-map.md` §2 Tier 3 — the questions people actually type. High-value openers,
each of which the site currently answers with one sentence or not at all:

- כמה עולה איטום גג? (a real breakdown by roof type and method, not a range restatement)
- יש לי נזילה בתקרה — איך מאתרים מאיפה היא מגיעה? (flood testing, and why the source is rarely above
  the stain — this is the brand's whole positioning, currently asserted rather than explained)
- זיפות או יריעות ביטומניות — מה עדיף ולמה?
- כמה זמן מחזיק איטום גג ומה מקצר את זה?
- אפשר לאטום גג מרוצף בלי להרים את הריצוף?
- מתי הזמן הנכון לאטום לפני החורף — ומה עושים אם כבר יורד גשם?

Each should answer the question **better than the service page does**, then link to the service page
for the commercial action. An article that duplicates a service page cannibalises it.

## Steps

1. Pick a Tier-3 question; confirm no existing page already targets it.
2. Create `content/articles/<slug>.ts`.
3. Write to the structure above; every claim free or 🔶 (`docs/content-standards.md` §6) — and no 🔶
   in rendered copy.
4. Register the slug so `generateStaticParams` and `app/sitemap.ts` pick it up.
5. Replace the `/blog/` stub with a real index listing the articles.
6. Wire `Article` + `BreadcrumbList` + `FAQPage`.
7. Add links from the related service and city pages back to the article.
8. `npm run lint && npm run typecheck && npm run build`; verify the route and the sitemap entry.

## Checklist

- [ ] `/blog/` is no longer a placeholder.
- [ ] ≥900 unique words; answers the question better than any existing page.
- [ ] `answer` block in the first 60 words, complete in the first sentence.
- [ ] Question-form `<h2>`s; one `<h1>`.
- [ ] At least one table or comparison worth citing.
- [ ] Real author, real dates.
- [ ] `Article` + `BreadcrumbList` + `FAQPage` emitted, FAQ derived from the blocks.
- [ ] 3+ contextual internal links with descriptive anchors and trailing slashes.
- [ ] Present in `out/` and `out/sitemap.xml`.
