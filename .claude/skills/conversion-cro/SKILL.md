---
name: conversion-cro
description: Lead conversion on gagoline — click-to-call above the fold, the sticky mobile bar, the Web3Forms lead form (per-field errors, aria-invalid, phone validation, a consent affordance, a real thank-you route), data-cta coverage on every CTA, the unreadable CTA contrast, and the honest-trust-signal gate. Use when conversions are weak, a page is missing its CTAs, or the form needs work. Triggers "improve conversions", "CRO pass", "form validation", "thank you page", "add click-to-call", "why aren't leads tracked".
---

# Conversion

Three actions, in priority order: **phone call → WhatsApp → lead form.** The structural basics are
already right; the gaps are in the form, in measurement, and in the fact that the two primary CTAs are
hard to read.

## What already works — don't regress it

- `MobileCtaBar` is fixed bottom, 50/50 call/WhatsApp, `lg:hidden`, with a matching `h-16 lg:hidden`
  spacer in `app/layout.tsx:81` so it never covers the footer.
- Click-to-call is above the fold on every page (header + hero).
- `LeadForm` falls back to opening a **prefilled WhatsApp deep link** if the Web3Forms POST fails —
  genuine lead-loss insurance. Keep it.
- `trackEvent("lead_submit")` fires only on **confirmed** success, never on submit. Keep that too.
- All four form fields have proper `<label htmlFor>`, and a honeypot is present.
- The dev-mode simulation at `LeadForm.tsx:58-67` deliberately does **not** fire the conversion event.
  That is correct; don't "fix" it.

## Gap 0 — the CTA is below AA contrast (backlog §11.1–11.2)

Measured against white: accent `#F5841F` is **2.56:1**, and the WhatsApp green `#25D366` is **1.98:1**.
`accent` is the default `Button` variant — the hero CTA and the form submit — and the WhatsApp green is
the sticky bar's right half.

A CTA a person cannot read is a conversion bug before it is an accessibility bug, and it affects the
two highest-priority actions on the site. `accent-700` (`#AB570A`) is 5.12:1 and `primary` text on
accent is 5.40:1; the WhatsApp green needs dark text or a darker token. Fix upstream —
`brand.accent` lives in the roster manifest, and the WhatsApp green should become a theme token rather
than a fifth hardcoded hex. See `/responsive-accessibility`.

## Gap 1 — form validation and a11y (backlog §8.4)

`LeadForm` sets `noValidate` and shows a single generic string, `"נא למלא שם וטלפון"`, in a
`<p role="alert">` at the bottom. No per-field state, no `aria-invalid`, no `aria-describedby`, no focus
management, and **no phone-format validation at all** — any string passes.

Fix:

- Per-field error state; each message tied to its input via `aria-describedby` and `aria-invalid`.
- Israeli phone validation: accept `05X-XXXXXXX`, `05XXXXXXXX`, and `+9725XXXXXXXX`; normalise before
  sending. Reject nothing a real customer would type.
- Move focus to the first invalid field on submit.
- Keep `noValidate` (custom Hebrew messages beat browser defaults) — but then the custom messages have
  to actually be per-field.

## Gap 2 — consent (backlog §8.5)

The form collects name, phone, an optional service and a free-text message. `/privacy/` exists but the
form never references it. Add a short line above the button linking to the policy. A checkbox adds
friction — prefer a clear inline statement unless the owner asks for explicit opt-in.

## Gap 3 — no thank-you URL (backlog §8.6)

Success is an inline state swap, so **there is no URL-based conversion to count**, no place to send a
next step, and no clean Google Ads conversion target.

Add `/thank-you/` as a real route:

- The form navigates there on confirmed success.
- It states what happens next and when (which is 🔶 until response times are confirmed —
  business-facts §E).
- It offers WhatsApp as an immediate second touch.
- `noindex` it (thin, and a stray SERP entry inflates conversion counts).

## Gap 4 — `data-cta` coverage (backlog §13.3)

GTM click triggers read `data-cta`. Several CTAs don't have it, so those clicks are **invisible**:

| Missing                             | Where                                     |
| ----------------------------------- | ----------------------------------------- |
| Form WhatsApp link + fallback       | `LeadForm.tsx:215`                        |
| Pricing CTA                         | `PricingTeaser.tsx`                       |
| Service sidebar call + WhatsApp     | `app/services/[service]/page.tsx:101,105` |
| Contact page phone, WhatsApp, email | `app/contact/page.tsx`                    |
| Footer email                        | `Footer.tsx:33`                           |

Naming convention already in use: `{location}-{action}` — `hero-call`, `sticky-whatsapp`,
`finalcta-call`. Follow it exactly; the GTM triggers match on these strings. Adding an attribute is
free; a missing one makes the click permanently invisible.

## Gap 5 — page-level CTA coverage

`FinalCta` ships on nearly every page — good. The weak spot is `/pricing/`, a page with explicit buying
intent that offers a table and no lead form. Every page should offer a call and a WhatsApp action
without scrolling back up.

## The trust gate — this one blocks everything else

Conversion work that adds pressure without adding proof makes the page worse. Before adding urgency
copy, badges or counters, check `docs/business-facts.md`:

- **No invented testimonials, ratings, "X גגות החודש", or countdown timers.** A fabricated trust signal
  is a policy violation and a lie to the customer.
- **The site currently ships three placeholder testimonials on `/` and `/reviews/`** authored
  `"לקוח/ה — להחלפה 🔶"`, plus an empty gallery (backlog §7.1–7.2). A visitor who notices the 🔶 stops
  trusting every other number on the page. **The highest-value CRO change on this site is not a button
  colour — it is removing the fake proof and replacing it with real reviews and real photos.** Escalate
  rather than substituting better-worded fakes.
- The `trustStats` warranty claim ("עד 10 שנים") contradicts the FAQ on the same page. Contradictions
  cost more conversion than a missing claim does.

## Checklist

- [ ] Call and WhatsApp reachable without scrolling on every page, mobile and desktop.
- [ ] Both primary CTA surfaces clear 4.5:1 contrast.
- [ ] Every CTA carries a `data-cta` following `{location}-{action}`.
- [ ] Form has per-field errors with `aria-invalid` + `aria-describedby` and focus management.
- [ ] Phone validation accepts every real Israeli format.
- [ ] Consent line present and linked to `/privacy/`.
- [ ] `/thank-you/` exists, is `noindex`, and offers a next step.
- [ ] `trackEvent` still fires only on confirmed success — never on submit.
- [ ] No trust signal on the page that `docs/business-facts.md` doesn't confirm.
