---
name: hebrew-rtl
description: RTL and Hebrew (he-IL) discipline for gagoline — logical Tailwind utilities only with the pl/pr/ml/mr/left/right/text-left/text-right ban, dir="ltr" islands for phone, email, price and URL, Israeli number and date formats, Hebrew punctuation with גרש and גרשיים, and why the email address needs a special component. Use whenever writing markup, classes or copy that appears on the page. Mandatory per CLAUDE.md §6. Triggers "RTL", "Hebrew", "which padding utility", "text direction", "LTR island", "mailto broken".
---

# Hebrew & RTL discipline

`<html lang="he" dir="rtl">` is set in `app/layout.tsx`. Do not remove it. Everything below follows.

## Logical utilities only — the ban list

For horizontal spacing and positioning, use **direction-aware** utilities so the layout mirrors
correctly:

| Use                                     | Never use                     |
| --------------------------------------- | ----------------------------- |
| `ps-*` / `pe-*`                         | `pl-*` / `pr-*`               |
| `ms-*` / `me-*`                         | `ml-*` / `mr-*`               |
| `start-*` / `end-*`                     | `left-*` / `right-*`          |
| `text-start` / `text-end`               | `text-left` / `text-right`    |
| `space-x-reverse` alongside `space-x-*` | bare `space-x-*`              |
| `rounded-s-*` / `rounded-e-*`           | `rounded-l-*` / `rounded-r-*` |
| `border-s-*` / `border-e-*`             | `border-l-*` / `border-r-*`   |

The only exception is a genuinely direction-agnostic case — a centred absolute overlay, a
mathematically symmetric transform, or text inside an element that is itself `dir="ltr"` — and it
**must carry an explanatory comment** saying why.

Three violations remain in the repo, all `text-right`:

- `components/forms/LeadForm.tsx:146` — on the `dir="ltr"` phone input. Probably intentional (it keeps
  the digits right-aligned in an LTR field inside an RTL form) but it has no comment, so nobody can
  tell. Either comment it or express it as `text-end` within the LTR context.
- `components/marketing/Faq.tsx:25` and `components/marketing/PricingTeaser.tsx:17` — both should be
  `text-start`.

Let `dir="rtl"` mirror flex and grid naturally. Don't reach for `flex-row-reverse` to "fix" order; if
the order looks wrong, the DOM order is wrong.

Vertical utilities (`pt`, `pb`, `mt`, `mb`, `top`, `bottom`) are unaffected — use them normally.

## LTR islands

Latin and numeric content inside Hebrew must be isolated or the bidi algorithm reorders it — phone
numbers render backwards, prices lose their currency position, URLs fragment.

```tsx
<span className="ltr">055-6601006</span>
<a href={telHref} dir="ltr">{siteConfig.phone}</a>
```

`.ltr` is defined in `app/globals.css:108-111` as `direction: ltr; unicode-bidi: isolate`. Use it for
phone numbers, emails, URLs, prices with `₪`, version strings, and code.

**Write the plain value in `lib/content.ts`** — `055-6601006`, `80–120 ₪`. The component adds the
isolation. Never put markup in the content file.

## The email address is a special case

`mailto:` links do **not** get written by hand on this site. Cloudflare Scrape Shield email obfuscation
is on for this zone: it rewrites every address it finds in the served HTML into
`/cdn-cgi/l/email-protection#<hex>`, which returns **404**, and rewrites plain-text addresses into the
English placeholder "[email protected]" in the middle of a Hebrew sentence.

Use `EmailLink` / `EmailText` from `components/ui/EmailAddress.tsx`. They emit real
`<!--email_off-->` … `<!--email_on-->` HTML comments around the markup, which is the documented opt-out.
JSX comments are compile-time only, which is why that component builds a string and uses
`dangerouslySetInnerHTML` on a build-time constant. Read its header before changing it (commit
`ac48484`).

## Israeli formats

- Phone: `055-6601006` displayed; `+972556601006` in `tel:` (both from `lib/site-config.ts`).
- Currency: `₪` **after** the number — `120 ₪`, `80–120 ₪ למ״ר`.
- Dates: `dd/mm/yyyy`.
- Ranges: en dash, no spaces — `1–3 ימי עבודה`, `80–120 ₪`.
- Thousands separator: comma.

## Hebrew punctuation

Use **גרש** `׳` (U+05F3) and **גרשיים** `״` (U+05F4) in Hebrew abbreviations — `מ״ר`, `ק״מ`, `ח״פ`,
`רח׳`. Not the ASCII `'` and `"`, which render wrong and read as English punctuation.

`lib/content.ts` currently writes `למ"ר` and `50 ק"מ` with ASCII double quotes, and
`site.config.json` carries `עד רדיוס 50 ק\"מ`. Fix the content file when you touch those lines; the
manifest value has to be fixed **in the roster**, not here.

## Route slugs

Slugs are **Latin ASCII** (`/areas/tel-aviv/`, `/services/roof-sealing/`) with Hebrew display names.
There is no percent-encoding trap in the dynamic routes and no `encodeURI` needed in the sitemap — do
not import that machinery from a sibling fleet repo. If a Hebrew route is ever added, it needs
`decodeURIComponent(param).normalize("NFC")` before matching, or it will work in dev and 404 in
production.

## Copy rules

- Keep user-facing strings Hebrew. No mid-sentence language mixing — an English material or brand name
  gets its own clause.
- Address the reader as "אתם"; speak as "אנחנו" / גגוליין.
- Copy lives in `lib/content.ts`, never in JSX.
- Full voice and depth rules: `docs/content-standards.md` §4 and §7.

## Checklist

- [ ] No banned physical-direction utility, or an exception with a comment.
- [ ] Every phone, email, URL and price is inside an LTR island.
- [ ] Any email address renders through `EmailLink` / `EmailText`.
- [ ] Hebrew abbreviations use `׳` / `״`.
- [ ] Layout checked at 360px and at desktop, in RTL.

```bash
grep -rnE '\b(pl|pr|ml|mr)-[0-9]|\b(left|right)-[0-9]|text-(left|right)\b' components app
grep -rn 'mailto:' components app | grep -v EmailAddress   # expect nothing
```
