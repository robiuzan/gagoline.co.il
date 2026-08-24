# Content standards — the acceptance bar for Hebrew copy

`hebrew-copywriter`, `new-city`, `new-service` and `new-article` all write against this file.
`seo-auditor` and `eeat-trust-auditor` audit against it.

---

## 1. The depth bar

| Page type                             | Minimum unique body words | Today                    |
| ------------------------------------- | ------------------------- | ------------------------ |
| Homepage                              | 800                       | ~700 (sections + FAQ) 🔧 |
| Service page (×8)                     | 450                       | ~80 unique ❌            |
| Location page (×23)                   | 350                       | ~90 unique ❌            |
| Article                               | 900                       | no articles exist        |
| Index page (`/services/`)             | 250                       | grid only, no prose ❌   |
| Pricing                               | 400                       | table + note ❌          |
| About                                 | 500                       | ~180 ❌                  |
| Legal (privacy, accessibility, terms) | no minimum                | fine as-is               |

**"Unique" excludes site chrome.** The header, footer and mobile CTA bar contribute ~130 words to every
page. It also excludes any block rendered identically on another route — a service page that reuses the
homepage's `processSteps` gets **no credit** for those ~45 words, and every service page currently does
exactly that.

Word count is a floor, not a goal. A 500-word page that says five specific true things beats a
900-word page that says one thing five ways.

---

## 2. The doorway test — mandatory for every location page

> Take the page. Replace the city name with a different city name. Is it now a correct, publishable
> page for that other city?
>
> **If yes, it is a doorway page and must not ship.**

Today **all 23 location pages fail.** `app/areas/[city]/page.tsx` interpolates `${city.name}` six times
into two shared paragraphs, a shared subtitle and a shared H2. Nothing else on the page varies.
Twenty-three near-identical pages is the pattern Google's doorway policy names, and the penalty lands
on the **domain**, not the page.

To pass, a location page needs at least **three** of these, and they must be true:

- Named neighbourhoods, streets or landmarks within the city.
- **Roof-stock reality** — this is the strongest lever this trade has. Bauhaus-era flat concrete roofs
  in central תל אביב; 1960s שיכונים with tiled roof decks; new towers with membrane systems; industrial
  איסכורית in the אזור/חולון belt; red-tile pitched roofs in רעננה and הוד השרון.
- A real job reference from that city (with the customer's permission), or a photo.
- Travel and scheduling reality — how far it is, and whether winter emergency response genuinely
  applies at that distance. A job in נתניה or רחובות is not a job in תל אביב — not because of the radius (both are comfortably inside it) but because travel and same-day response differ.
- A city-specific FAQ that would read oddly anywhere else.
- Local pricing or access reality if it differs — crane access, נציגות ועד בית, parking for the truck.

If none of those can be said truthfully about a city, **that city does not warrant a page.** Say so in
[business-facts.md](business-facts.md) §E rather than padding.

The same test applies to service pages with the service name swapped. It currently fails there too:
`app/services/[service]/page.tsx:32-37` hardcodes four "מתי כדאי לפנות אלינו" bullets about ceiling
damp, which then appear verbatim on the **basement sealing** and **roof whitening** pages.

---

## 3. Required blocks per page type

**Service page**

1. H1 = the service name.
2. Answer block (§5) — what this service is, in 40–60 words.
3. What it involves, concretely: materials, substrate, surface prep, duration, what's included and
   excluded, weather constraints.
4. **Per-service** "when to call us" — not the shared four bullets currently hardcoded at
   `app/services/[service]/page.tsx:32-37`.
5. Process — may reuse `processSteps` but must add at least one service-specific step or caveat.
6. Price range for this service, interpolated from `priceRows` — never restated as a literal.
7. **Per-service FAQ**, 3–5 questions, feeding `FAQPage`.
8. Related services chosen by relevance, plus links to 2–3 locations.
9. CTA.

**Location page**

1. H1 = `איטום גגות ב{city}`.
2. Answer block — do we serve this city, how fast, at what cost.
3. Local substance — at least three items from §2.
4. Full service list with links.
5. Nearby locations (2–4 links).
6. City-specific FAQ, 2–3 questions.
7. CTA.

**Article**

1. H1 = the question, verbatim.
2. Answer block in the first 60 words — the whole answer, before any preamble.
3. Body with question-form `<h2>`s.
4. At least one table, list or comparison a reader would screenshot.
5. Author byline + `datePublished` / `dateModified`.
6. Links to 2–3 services and 1–2 locations, in-copy with descriptive anchors.
7. CTA.

---

## 4. Brand voice

- **Tone:** אמין · מקצועי · רגוע ובוטח · ענייני · נגיש. Confident without hype.
- **Person:** "אנחנו" / גגוליין. Address the reader as "אתם" (plural formal).
- **Reading level:** clear for a homeowner aged 35–65, with depth where it builds trust.
- **Favour:** גג יבש · אחריות בכתב · אבחון · מקור הנזילה · שקיפות · פתרון לתמיד · מענה מהיר.
- **Avoid:** "זול", superlatives without evidence, exclamation spam, heavy jargon, "פתרון קסם",
  "המובילים בישראל" (unprovable).
- **Emoji:** a `✓` or `📞` inside a UI element is fine. Never in body copy.
- **Reference line for the register:** _"לפני שאנחנו אוטמים — אנחנו מבינים מאיפה הנזילה מגיעה."_

The emotional job-to-be-done is **a dry roof and peace of mind**, and the season does the selling. Lead
with the leak the reader already has, not with the company.

---

## 5. The answer block (AEO)

Every service page, location page and article opens with one. This is the unit an AI assistant or a
featured snippet lifts.

- Sits **directly under** a question-form heading.
- **40–60 words.** Shorter reads as thin; longer stops being extractable.
- Answers the question **completely in the first sentence.** No "there are several factors to
  consider" preamble.
- Self-contained — comprehensible with zero surrounding context, because that is how it will be quoted.
- Contains the concrete number, duration or price range where one exists.
- No pronouns referring outside the block.

**Good:**

> **כמה זמן לוקח לאטום גג?**
> איטום גג פרטי טיפוסי נמשך יום עד שלושה ימי עבודה, תלוי בשטח, בסוג הגג ובמצב שכבת האיטום הקיימת. לפני
> העבודה מבצעים אבחון לאיתור מקור הנזילה, ובסיומה בדיקת איכות. את העבודה מבצעים בעונה היבשה או בחלון
> ללא גשם.

**Bad:**

> משך העבודה משתנה בהתאם למספר גורמים. צוות מקצועי כמו שלנו יידע להעריך את משך העבודה בביקור באתר.

---

## 6. Claims — what may be stated as fact

**Free to state** (verified in the manifest or the code): the phone number, email, the eight services,
the twenty-three cities, the service area "תל אביב והמרכז — עד רדיוס 50 ק״מ", the founding year **2014**
and anything derived from it ("מאז 2014", "מעל עשור"), the diagnosis-first method as a described
process, and "אחריות בכתב" as an unqualified statement that a written warranty is given.

**Gated on [business-facts.md](business-facts.md)** — mark `// 🔶 confirm` and never state as fact
until confirmed:

- **Any warranty duration**, including the "עד 10 שנים" in `trustStats`
- Every number in `priceRows` — all four are 🔶 today
- "מאות גגות" or any volume claim
- Any rating, review count, or customer quote
- Licences, insurance, certifications, קבלן רשום status, association membership
- Any named person
- Business hours and winter-emergency response times
- Superlatives: "המובילים", "הטובים ביותר", "מספר 1"

**Never permitted:** an invented customer name or quote; a rating without a public source; a
certification the business doesn't hold; a photo presented as our work that isn't.

> ⚠️ **This rule is currently being violated in production.** `lib/content.ts:141-160` ships three
> testimonials attributed to `"לקוח/ה — להחלפה 🔶"` with invented quotes, rendered on `/` and
> `/reviews/`. A visible 🔶 in shipped copy is not a safeguard — it is the defect. The fix is to remove
> the section until real reviews exist, not to rewrite the placeholder. Same for the six empty gallery
> tiles and the "תכני הבלוג בדרך 🔶" blog page.

---

## 7. Hebrew mechanics

- Israeli formats: phone `055-6601006`, currency `₪` after the number, dates `dd/mm/yyyy`.
- Hebrew abbreviations use גרש `׳` and גרשיים `״` — `ק״מ`, `מ״ר`, `ח״פ` — not straight ASCII quotes.
  Note `lib/content.ts` currently writes `למ"ר` and `50 ק"מ` with ASCII double quotes; fix on touch.
- Numerals stay LTR inside RTL text; components wrap them with `dir="ltr"` and the `.ltr` helper.
  Write the plain number; don't add markup in `content.ts`.
- Ranges use an en dash: `1–3 ימי עבודה`, `80–120 ₪`.
- No language mixing mid-sentence. English material or brand names get their own clause.
- Copy lives in `lib/content.ts`, not in JSX. `app/services/[service]/page.tsx:32-37` and
  `app/about/page.tsx:14-21` both violate this today.

---

## 8. Before publishing

- [ ] Meets the §1 word floor with genuinely unique copy.
- [ ] Passes the §2 doorway test.
- [ ] Has every required block from §3.
- [ ] Opens with a §5 answer block.
- [ ] Every claim is either free (§6) or marked 🔶 with a row in `business-facts.md` — and **no 🔶
      renders on the page**.
- [ ] Title and description follow [keyword-map.md](keyword-map.md) and don't double the brand.
- [ ] Exactly one H1; heading order unbroken.
- [ ] Links out to 2+ internal pages with descriptive anchors, each with a trailing slash.
- [ ] Prices interpolate from `priceRows` rather than restating a literal.

---

## 9. Contextual links and Hebrew anchor text

Every internal link on the site today is a card, a chip or a nav label, so the domain emits almost no
anchor-text diversity. Thirty-one pages of copy are about to be written; this section is the bar they
are written against.

**A prerequisite, not a polish.** Copy lives in `lib/content.ts` as plain strings (§7), and you cannot
put a `<Link>` inside a string — so contextual links are not _expressible_ until the `RichText` model
(`string | { text, href }`) and its `Prose` renderer land. Ship that with the data model, before the
first depth block is authored, or every page needs rewriting afterwards.

### Rules

- **2–3 in-copy links per authored block.** More reads as SEO spam to a human.
- **At most one link per target per page.** The first mention wins.
- **Anchor text is the target's primary term in natural Hebrew inflection** — never the raw H1, never a
  bare URL.
- **Every `href` ends in a trailing slash.** `trailingSlash: true`, and the breadcrumb JSON-LD builder
  does no normalisation (see [link-graph.md](link-graph.md) §3).
- **Never link `/reviews/`, `/gallery/` or `/blog/` while they are parked** — they are `noindex` and
  deliberately unlinked.

### Approved anchors

| Target                             | Anchor                        |
| ---------------------------------- | ----------------------------- |
| `/services/leak-detection/`        | איתור מקור הנזילה בבדיקת הצפה |
| `/services/roof-sealing/`          | איטום גג בחומרים מתקדמים      |
| `/services/roof-tarring/`          | זיפות גג בביטומן חם           |
| `/services/bituminous-sheets/`     | הלחמת יריעות ביטומניות        |
| `/services/balcony-sealing/`       | איטום מרפסת מרוצפת            |
| `/services/exterior-wall-sealing/` | איטום קירות חוץ וסדקים        |
| `/services/roof-whitening/`        | הלבנת גג להורדת חום בקיץ      |
| `/services/basement-sealing/`      | איטום מרתף ואיטום שלילי       |
| `/areas/{city}/`                   | איטום גגות ב{city}            |
| `/pricing/`                        | טווחי המחיר לאיטום גג         |

**Banned:** "לחצו כאן" · "כאן" · a standalone "למידע נוסף" · a bare URL. Note the "למידע נוסף" inside
`ServicesGrid` is acceptable only because it sits within a whole-card link whose accessible name
includes the card title — it must never become a standalone anchor.

### Verify

```bash
grep -rn 'לחצו כאן\|למידע נוסף<\|>כאן<' app components lib     # expect nothing
grep -o 'href="/[a-z/-]*[^/]"' out/services/roof-sealing/index.html   # expect nothing
```
