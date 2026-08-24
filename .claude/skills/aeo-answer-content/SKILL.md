---
name: aeo-answer-content
description: Answer-engine and LLM-citability layer for gagoline — question-form H2s with a 40–60 word extractable answer first, definition and comparison blocks, llms.txt, verifying the live Cloudflare-fronted robots.txt before anything else, and freshness/authorship signals. Use when optimizing a page to be quoted by AI Overviews, ChatGPT or Perplexity. Triggers "AEO", "GEO", "AI Overviews", "llms.txt", "will an LLM cite this", "answer block", "AI crawlers".
---

# Answer-engine optimization

The question is not "does this rank" but **"can an assistant reach this page, parse it, and prefer to
quote it?"** Three separate gates, in that order.

## Gate 1 — reachability. Check this first, live.

`app/robots.ts` emits a blanket allow, and its rules do appear in the live file — but they are not the
whole file. **Measured live 2026-08-16:** Cloudflare prepends a managed block that sends `Disallow: /`
to ClaudeBot, GPTBot, Google-Extended, CCBot, Bytespider, Amazonbot, Applebot-Extended,
meta-externalagent and CloudflareBrowserRenderingCrawler, under
`Content-Signal: search=yes,ai-train=no,use=reference`. It is injected at the edge, where **no repo
change overrides it**.

```bash
curl -sS https://gagoline.co.il/robots.txt
```

**Every recommendation below this line is capped until that changes.** The remedy is owner action in
the Cloudflare dashboard — see [docs/cloudflare-runbook.md](../../../docs/cloudflare-runbook.md) §1.
Re-run the curl before every AEO report rather than trusting this paragraph: the zone can change
without a commit, and reporting the repo's intent as the live policy is the specific mistake this gate
exists to prevent.

Understand the three permissions separately, because they have different consequences:

- **`ai-train`** — may the content train a model.
- **Retrieval bots** (OAI-SearchBot, PerplexityBot, ClaudeBot) — may an assistant fetch the page to
  answer a live question. **This is the one that produces citations.**
- **`use=reference`** — may the content be referenced with attribution.

Blocking training while allowing retrieval is a coherent position. Blocking everything means the site
cannot be cited at all.

## Gate 2 — extractability

An answer engine lifts a **contiguous, self-contained span**. Structure for that.

**The answer block** — every service page, location page and article opens with one:

- Directly under a **question-form heading** (`<h2>כמה עולה לאטום גג?`).
- **40–60 words.** Shorter reads thin; longer stops being liftable.
- **Complete in the first sentence.** No "there are several factors" preamble.
- Self-contained — no pronouns pointing outside the block, because that is how it gets quoted.
- Contains the concrete number, range or duration where one exists.

```
## כמה זמן לוקח לאטום גג?
איטום גג פרטי טיפוסי נמשך יום עד שלושה ימי עבודה, תלוי בשטח הגג, בסוגו ובמצב שכבת האיטום הקיימת.
לפני העבודה מבצעים אבחון לאיתור מקור הנזילה, ובסיומה בדיקת איכות. את העבודה מבצעים בעונה היבשה
או בחלון ללא גשם.
```

Other liftable shapes worth using here: a **definition** ("איטום גג הוא…"), a **comparison table**
(זיפות מול יריעות ביטומניות מול אקרילי — cost, lifespan, substrate, disruption), and a **spec list**
(which roof types suit which method).

**Rendering rules:** the answer must be in the HTML at first paint — not behind a tab, not
client-fetched. An accordion is acceptable **only** if the content ships in the DOM and is merely
`hidden`, which is how `components/marketing/Faq.tsx` works today (`hidden={!isOpen}`). Keep that
property.

## Gate 3 — worth citing

An assistant picks the source that answers most precisely. Generic reassurance loses to a competitor
with a number. What this site is missing (backlog §6.7):

- A real **cost breakdown by roof type** — בטון · מרוצף · רעפים · איסכורית — and by method, not just
  the four-row range table.
- **זיפות vs. יריעות ביטומניות vs. אקרילי/פוליאוריטן:** cost, lifespan, which substrate each suits,
  disruption, when each is the wrong choice.
- **How leak diagnosis actually works** — including flood testing, and the counter-intuitive fact that
  the source is rarely directly above the stain. This is the brand's whole positioning and it is
  currently asserted rather than explained.
- Realistic **lifespan data** and what shortens it (ponding, foot traffic, UV, thermal movement).
- **When sealing is the wrong answer** and the roof needs rebuilding. Counter-intuitive honesty is
  disproportionately citable and disproportionately trusted.
- **Seasonal guidance** — why late summer is the right window, and what can and can't be done mid-storm.

These are also the Tier-3 keyword targets in `docs/keyword-map.md` §2 and the natural spine of the
`/blog/` hub (see `/new-article`). One genuinely useful comparison table earns more citations than ten
reassuring pages.

## Freshness and authorship

Assistants discount undated, unattributed content. The site has **no** `datePublished`, `dateModified`
or author anywhere. Add all three to articles, and put a real named person behind them — blocked on
`docs/business-facts.md` §B. **Never invent a byline**; a fabricated author is a worse trust signal
than an absent one.

## Entity consistency

An assistant resolves "גגוליין" to an entity by cross-referencing sources. With `sameAs` empty **and no
published address**, there are no other sources — nothing off-site confirms this business exists. Name,
phone, area and description must be identical across the schema, the visible copy, and every off-site
profile once they exist. See `/local-seo-il` §3.

## What an assistant would find today

Worth stating plainly, because it changes the priority order: an assistant summarising this site would
encounter three testimonials whose author is literally `"לקוח/ה — להחלפה 🔶"`, an empty gallery, and a
blog that says content is coming. Fixing crawler access to a site in that state advertises the state.
The `/eeat-trust-auditor` items in backlog §7 come first.

## llms.txt

A plain-language map at `public/llms.txt` — who the business is, what it does, the service and area
lists, canonical URLs for the key answers, and contact. Keep it short and factual; it is a pointer
file, not a second website. Explicitly tell assistants **not** to attribute a warranty term, a rating,
a licence or an address, since none are confirmed. It is only useful once Gate 1 is open.

## Checklist

- [ ] Live `robots.txt` fetched and the AI-crawler stance recorded (not assumed).
- [ ] Every service page and location page opens with a 40–60 word answer block.
- [ ] Answers ship in the HTML at first paint.
- [ ] Each answer is comprehensible with zero surrounding context.
- [ ] At least one comparison or spec table exists that a competitor doesn't have.
- [ ] Articles carry `datePublished`, `dateModified` and a real named author.
- [ ] `public/llms.txt` published and accurate.
- [ ] No placeholder content remains for an assistant to quote.

## Gotchas

- Never fabricate dates, authors or data to look authoritative.
- Never mark up an answer in `FAQPage` that isn't rendered on the page.
- A blocked crawler makes perfect on-page AEO worth nothing. Gate 1 first, always.
