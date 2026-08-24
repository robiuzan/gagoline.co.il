---
name: responsive-accessibility
description: WCAG 2.1 AA and Israeli IS 5568 compliance for gagoline — the measured 2.56:1 accent CTA and 1.98:1 WhatsApp CTA contrast failures, 44px tap targets, keyboard and focus order, the mobile menu's missing focus trap, semantic landmarks and heading order, programmatic form labelling, reduced motion, and keeping /accessibility/ truthful. Use before shipping or when auditing accessibility. Triggers "accessibility pass", "WCAG", "contrast check", "tap targets", "keyboard navigation", "נגישות", "IS 5568".
---

# Accessibility — WCAG 2.1 AA + IS 5568

This site **publishes an accessibility statement** at `/accessibility/` claiming ת״י 5568 / WCAG 2.0 AA
conformance and, in its own words, "ניגודיות צבעים תקינה". That raises the stakes: a failure here isn't
just a bug, it makes a published statement false. Keep the statement and the site in sync **in both
directions**.

## The contrast failures — fix these first

Computed from the `@theme` hex values in `app/globals.css`, against white text:

| Surface                              | Ratio      | AA (4.5:1 normal text) |
| ------------------------------------ | ---------- | ---------------------- |
| `accent` `#F5841F` — **default CTA** | **2.56:1** | ❌ fails               |
| `accent-600` `#D86E0C` — its hover   | 3.41:1     | ❌ fails               |
| WhatsApp `#25D366`                   | **1.98:1** | ❌ fails badly         |
| WhatsApp hover `#1DA851`             | 3.10:1     | ❌ fails               |
| `secondary-500` `#1F8FD0`            | 3.56:1     | ❌ fails for text      |
| `accent-700` `#AB570A`               | 5.12:1     | ✅ passes              |
| `secondary-600` `#166FA3`            | 5.47:1     | ✅ passes              |
| `primary` `#0E2E4E`                  | 13.82:1    | ✅ passes              |
| `primary` text **on** accent         | 5.40:1     | ✅ passes              |

The large-text exemption needs ≥18.66px bold or ≥24px; the CTAs are 16px semibold, so they do **not**
qualify.

Where it ships:

- **`accent` is the default `Button` variant** (`Button.tsx:36`) — the hero CTA, the lead-form submit
  button, the 404 link.
- **The WhatsApp green is the sticky mobile bar's right half** (`MobileCtaBar.tsx:22`) — the number-two
  conversion path on phones — plus every `whatsapp` button variant and the form's WhatsApp link.

Two ways to fix, and they have different brand consequences:

1. Move the CTA surface to `accent-700` (5.12:1) — darker orange, same family.
2. Keep the brand orange and switch to **dark text on accent** (`primary` on accent = 5.40:1) — keeps
   the fill vivid.

Either way, fix it **upstream**: `brand.accent` lives in the roster manifest, not in a component. The
WhatsApp green is a different case — it is hardcoded in four files (`Button.tsx:13`,
`MobileCtaBar.tsx:22`, `LeadForm.tsx:217`, `app/contact/page.tsx:40`) and should become a theme token
before it becomes a fifth copy.

**Compute real ratios; never eyeball contrast.** Recompute from `globals.css` if the tokens have moved.

## Semantics

- **One `<h1>` per page** — currently correct on all 44 routes.
- **Heading order:** `/faq/` goes `<h1>` (from `PageHeader`) straight to the accordion's `<h3>`s
  (`Faq.tsx:22`) with no `<h2>`. The homepage is fine because `SectionHeading` supplies one. Add a
  `SectionHeading` on `/faq/`.
- Landmarks: `header`, `nav`, `main`, `footer` — present.
- **Interposed wrappers break lists.** A wrapper component placed directly inside `<ol>`/`<ul>` stops
  the list being announced as one. Put the wrapper _inside_ the `<li>`, never between the list and its
  items.
- Real `<button>` / `<a>`, never a clickable `div`.

## Keyboard

- Visible focus everywhere — `focus-visible:ring-2` on `Button` (`Button.tsx:8`). Good; don't remove.
- **The mobile menu** (`Header.tsx:57`) has `aria-expanded` — better than the fleet baseline — but **no
  `aria-controls`, no Escape handler, no focus trap and no scroll lock**, and it closes only via each
  link's `onClick`. Fix it when touching the header, and don't copy the pattern into a new dropdown.
- Tab order follows DOM order; in RTL that is still correct — don't reorder visually with CSS.

## Forms

All `LeadForm` fields have `<label htmlFor>`. Missing (backlog §8.4): per-field errors, `aria-invalid`,
`aria-describedby`, focus movement to the first invalid field, and any phone-format validation. A single
generic error at the bottom of the form is not announced usefully.

## Screen-reader text

`TrustBar.tsx:11,16` renders `<dt className="sr-only">{stat.label}</dt>` and then the **same label
again visibly** inside `<dd>`. Every stat is announced twice. Either drop the `sr-only` `<dt>` and
restructure, or stop repeating the label in `<dd>`.

## Images

There are none. When they land (the gallery, before/after pairs), every meaningful image needs a
Hebrew `alt` and decorative ones `alt=""`. The kit's `SiteImage` enforces a non-empty `alt` at compile
time — a good reason to adopt it (`/performance-web-vitals`).

## Tap targets and mobile

- 44×44px minimum for anything tappable, with adequate spacing.
- Test at 360px. Text must reflow to 320px without horizontal scroll, and survive 200% zoom.

## Motion

`app/globals.css:94-103` has a global `prefers-reduced-motion` reset. Confirm nothing bypasses it.
`components/ui/Reveal.tsx` initialises **visible** (`state = "static"`) and only hides after mount —
so content is never stranded at `opacity: 0` and is never hidden from crawlers. That is correct
progressive enhancement; preserve both properties in any new animation.

## RTL

`<html lang="he" dir="rtl">`; LTR islands isolated for phone, email and price. Full rules:
`/hebrew-rtl`.

## Checklist

- [ ] Every text/background pair computed at ≥4.5:1 (≥3:1 for large text and UI boundaries).
- [ ] One `<h1>`; heading order unbroken; landmarks present.
- [ ] No wrapper `<div>` between a list and its `<li>`s.
- [ ] Every interactive element keyboard-reachable with visible focus.
- [ ] Menus: Escape closes, focus returns, `aria-expanded` + `aria-controls` set.
- [ ] Form errors tied via `aria-describedby` + `aria-invalid`, focus moved to the first invalid field.
- [ ] No duplicated screen-reader text.
- [ ] 44px tap targets; 360px layout clean; 200% zoom usable.
- [ ] `/accessibility/` still describes reality.

## Gotchas

- Brand colours are roster tokens — a contrast fix belongs upstream, not as a hex in JSX.
- Fixing contrast changes the visual brand. Flag it before shipping rather than after.
- The accessibility statement currently claims correct contrast while two CTA surfaces fail. Whichever
  you fix, the other has to follow — leaving both is the exposure.
