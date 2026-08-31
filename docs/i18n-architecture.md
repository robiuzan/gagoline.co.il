# Multilingual architecture — English alongside Hebrew

Accessibility rules are **not** here. They live in the `responsive-accessibility` skill — WCAG 2.1 AA
and IS 5568, the measured contrast ratios, tap targets, focus order — and in `hebrew-rtl` (logical
utilities, LTR islands, Hebrew punctuation). This file covers only the thing neither of them
addresses: **serving a second language.**

Status: **no decision taken.** The site is `<html lang="he" dir="rtl">`, Hebrew-only, 53 routes.
Nothing below is implemented.

---

## 1. The decision comes before the architecture

Adding English is not a technical task with an SEO cost. It is an **SEO decision with a technical
cost**, and the default answer for this business is _no_.

**The case against, stated plainly:**

| Factor        | Reality for גגוליין                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience      | Private homeowners 35–65, ועדי בתים, property managers, commercial buildings — **in Tel Aviv and the centre**. This ICP transacts in Hebrew                                                  |
| Search demand | `keyword-map.md` is built on Hebrew head terms. There is no measured English volume for איטום גגות in Israel                                                                                 |
| Crawl budget  | 53 routes → **106**. Half the crawl budget spent on pages with no measured demand, on a site whose city pages only stopped being doorway pages in August                                     |
| Content debt  | Every one of the 8 service pages and 23 city pages was deepened by hand. English doubles that surface, and machine translation of it would recreate the doorway problem in a second language |
| Trust surface | `business-facts.md` still has open 🔶 rows. Translating unconfirmed claims duplicates the exposure                                                                                           |
| Maintenance   | Every future copy change becomes two changes, forever, or the locales drift                                                                                                                  |

**The only conditions that would justify it** — none currently evidenced:

1. A named, countable segment: English-speaking olim in the served cities, or international property
   managers running Tel Aviv buildings, with search or enquiry data behind it.
2. The owner able to _deliver service in English_ — quoting, site visits, a written warranty. Ranking
   for a language you cannot serve converts into complaints.
3. Hebrew depth work finished first. See `optimization-backlog.md` §3.

**Recommendation: defer.** Revisit only with enquiry data showing English demand. If English is wanted
purely so the owner can share the site abroad, that is a one-page English "about" — not a locale.

---

## 2. If it goes ahead — the architecture

### 2.1 URL strategy: sub-path, Hebrew at the root

```
/                     he-IL   (unchanged — never move the Hebrew site)
/en/                  en
/en/services/roof-sealing/
/en/areas/tel-aviv/
```

Sub-path, not subdomain and never a query parameter or a cookie-based swap. Sub-paths inherit the
apex's authority; a subdomain restarts it. **Hebrew must not move** — 50 URLs are indexed and every
one would need a 301, for zero gain.

Slugs stay **Latin ASCII in both locales** (`/en/services/roof-sealing/`). They already are — see
CLAUDE.md §3. Do not introduce translated slugs; the percent-encoding trap that afflicts the
Hebrew-slug fleet sites does not exist here and must not be imported.

### 2.2 Static export constraints — what is and is not possible

`next.config.mjs` sets `output: "export"`, so there is **no middleware and no server-side language
negotiation in Next.** Consequences:

- `next-intl`, `next-i18next` and the App Router's built-in `i18n` config all rely on middleware.
  **None of them work here.** Use a `[locale]` dynamic segment with `generateStaticParams` instead.
- `Accept-Language` redirection needs a **Cloudflare Pages Function** (`functions/_middleware.js`,
  uploaded by wrangler alongside `out/`). It is available, but see the caching warning in
  [personalization-and-mobile.md](personalization-and-mobile.md) §3 — a language redirect cached
  against the wrong key serves Hebrew to English visitors and vice versa.
- **Preferred: no auto-redirect at all.** Ship a visible language switcher and let the user choose.
  Auto-redirecting on `Accept-Language` is a known way to get the wrong locale indexed, because
  crawlers arrive with unrepresentative headers.

### 2.3 Route shape

```
app/
  [locale]/
    layout.tsx            # lang + dir per locale
    page.tsx
    services/[service]/
    areas/[city]/
    ...
```

`generateStaticParams` emits both locales at build time. `layout.tsx` reads the locale param:

```tsx
const dir = locale === "he" ? "rtl" : "ltr";
<html lang={locale === "he" ? "he" : "en"} dir={dir}>
```

**The RTL discipline in `hebrew-rtl` does not relax.** Logical utilities (`ps-*`, `me-*`, `start-*`,
`text-start`) are what make one component tree render correctly in both directions. The ban list
becomes _more_ load-bearing, not less: a stray `pl-4` that looks fine in Hebrew today will be wrong
in exactly one locale and nobody will notice.

### 2.4 Content model — a missing translation must not compile

Do not split `lib/content.ts` into two free-form files that drift.

```ts
// lib/content/shape.ts — the single typed contract
export interface SiteCopy {
  serviceCards: ServiceCard[];
  faqs: Faq[]; /* … */
}

// lib/content/he.ts
export const he: SiteCopy = {
  /* … */
};

// lib/content/en.ts
export const en: SiteCopy = {
  /* … */
}; // missing key = build failure
```

That is the whole point: `SiteCopy` makes an untranslated key a **type error**, not a page that
silently renders Hebrew inside an English layout. Business facts still come from `lib/site-config.ts`
and are **not** translated — the phone number, the email and the founding year are the same in every
language.

### 2.5 hreflang — reciprocal or worthless

Every page in both locales emits the full set, including a self-reference and `x-default`:

```tsx
alternates: {
  canonical: `/en/services/${slug}/`,
  languages: {
    "he-IL": `https://gagoline.co.il/services/${slug}/`,
    en:      `https://gagoline.co.il/en/services/${slug}/`,
    "x-default": `https://gagoline.co.il/services/${slug}/`,
  },
}
```

Rules that are not negotiable:

- **Reciprocity.** If A declares B, B must declare A. A one-way hreflang is ignored entirely.
- **Absolute URLs, trailing slash, byte-identical to the sitemap `<loc>` and the canonical.** The
  existing `seo-assert` trailing-slash check exists because `breadcrumbJsonLd` does not normalise.
- **`x-default` points at Hebrew**, the primary market.
- Canonicals stay **self-referencing per locale**. An English page canonicalising to Hebrew removes it
  from the index — a common and silent way to make the whole project produce nothing.

### 2.6 Schema

One business, not two. The `RoofingContractor` node keeps a **single `@id`** across locales; only
`inLanguage`, `name` and description-type fields vary. Emitting two independent LocalBusiness nodes
tells Google there are two businesses. `Service` and `FAQPage` nodes are per-locale and carry
`inLanguage`.

### 2.7 Sitemap

One sitemap, both locales, each entry carrying `xhtml:link` alternates — or two sitemaps in an index.
`app/sitemap.ts` currently hand-maintains `staticPaths`; **that array must become locale-aware in the
same commit that adds the locale**, or every English page ships unlisted. This is backlog §1.3 and it
becomes twice as expensive to leave open.

---

## 3. Gate additions — required before any English page ships

Add to `scripts/seo-assert.mjs`:

1. **hreflang reciprocity** — for every declared alternate, fetch the target from the export and
   assert it declares the source back. Fail otherwise.
2. **No cross-locale canonical** — an `/en/` page whose canonical lacks `/en/` is a fail.
3. **Locale parity** — the set of routes under `/en/` matches the set outside it, or the difference is
   explicitly allowlisted.
4. **No Hebrew in the English tree** — assert no Hebrew codepoint range appears in `/en/` page bodies
   outside allowlisted proper nouns. This catches the untranslated-fallback failure that types alone
   cannot, because a fallback is a valid string.

And to `scripts/link-graph-check.mjs`: locales must not cross-link into each other's mesh except
through the language switcher, or inbound degree becomes meaningless.

---

## 4. If the answer stays "no"

Then the correct i18n posture is the one already in place, and it should be stated rather than left
implicit:

- `<html lang="he" dir="rtl">` — set, do not remove.
- Latin/LTR fragments inside Hebrew are isolated with `dir="ltr"` and the `.ltr` helper.
- Hebrew abbreviations use גרש `׳` and גרשיים `״`.
- No mid-sentence language mixing.

All four are already enforced by the `hebrew-rtl` skill. Nothing further is needed.
