---
name: tracking-analytics
description: GTM, GA4 and conversion events for gagoline on the shared Israeli fleet container GTM-KWGGH438 — head placement, hostname-based GA4 routing inside the container, the data-cta inventory, lead_submit, thank-you-URL conversions, Search Console verification, and the mandatory gtm.js 200-check whenever a container id changes. Use when turning on analytics or when conversions are not being recorded. Triggers "set up GTM", "GA4", "track calls", "conversion tracking not firing", "Search Console", "container id".
---

# Tracking & analytics

## The container is shared — this changes everything

`GTM-KWGGH438` is **one container for all ~10 Israeli fleet domains**, with GA4 resolved _inside_ the
container by a RegEx table on `{{Page Hostname}}`. Consequences:

- Changing container config affects **every fleet site**, not just gagoline. Never edit a shared trigger
  or variable to fix one site — add a hostname condition.
- gagoline's GA4 property is resolved in the container, not in this repo. `analytics.ga4MeasurementId`
  being absent locally is expected; the property still has to exist.
- The container id lives in the **roster manifest**, not `site.config.json` directly.

## The 200-check — non-negotiable

**A GTM snippet in the HTML proves nothing.** A wrong id renders identical markup and silently collects
nothing.

```bash
curl -o /dev/null -w '%{http_code}\n' "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"
```

**200 or the id is wrong.** Two fabricated container ids in a row previously cost the Israeli fleet
**18 days of zero analytics across every site**, with the snippet sitting in the HTML looking correct
the whole time. Run this check any time an id changes, and again after deploy.

## Head placement (backlog §13.1)

`app/layout.tsx:74-76` renders the GTM script inside `<body>`. Google's own install requires `<head>`;
body placement delays container load and can miss early events. The `<head>` in this layout already
exists (it carries the `imgquarry.com` preconnect) — move the script there. Keep the `<noscript>`
iframe in `<body>`; that one belongs there.

```tsx
<head>
  {gtmHead && <script id="gtm-init" dangerouslySetInnerHTML={{ __html: gtmHead }} />}
</head>
```

Note this inline script is what a future CSP must accommodate — see `/web-security-headers`.

## The `data-cta` inventory

Call and WhatsApp conversions are tracked in GTM by click triggers reading `data-cta`. **No JS ships
for them**, which is why the attribute is load-bearing. Convention: `{location}-{action}`.

| Present                                                                                                                                        | Missing (backlog §13.3)                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header-call` (×2) · `hero-call` · `hero-whatsapp` · `footer-call` · `sticky-call` · `sticky-whatsapp` · `finalcta-call` · `finalcta-whatsapp` | the form's WhatsApp link and fallback · the pricing CTA · the service-page sidebar call **and** WhatsApp · all three contact-page links · the footer email |

Adding an attribute is free; a missing one makes the click permanently invisible. Audit with:

```bash
grep -rn 'href={telHref}\|whatsappHref(' components app | grep -v 'data-cta'
```

## Events

- `trackEvent("lead_submit", { form: "lead" })` fires **only on confirmed Web3Forms success**
  (`LeadForm.tsx:87`), never on submit, and the dev-mode simulation deliberately doesn't fire it. Keep
  both properties — firing on submit inflates conversions with failures.
- Add a thank-you page view as a second conversion signal once `/thank-you/` exists
  (`/conversion-cro` gap 3). A URL-based conversion is the cleanest Google Ads target.
- **Never put PII in `dataLayer`** — no name, phone, email or message text. The current call sends only
  `{ form: "lead" }`, which is correct.

## GA4 and Search Console

- **GA4 property** for gagoline.co.il: blocked on `docs/business-facts.md` §F. Once it exists, the
  measurement id goes in the roster manifest and the container's hostname table.
- Mark `lead_submit`, call clicks and WhatsApp clicks as **Key events** in GA4, or they won't appear as
  conversions.
- **Search Console:** the verification token is emitted, but it is **hardcoded** at `app/layout.tsx:38`
  instead of read from `manifest.analytics.googleSiteVerification` (backlog §2.7). Wire it to the
  manifest, then submit `https://gagoline.co.il/sitemap.xml`.

## Verifying a deploy

1. Live page source contains `googletagmanager.com/gtm.js?id=` **inside `<head>`**.
2. `curl` the `gtm.js` URL → 200.
3. GTM Preview mode on the live domain: fire a call click, a WhatsApp click, and a form submit; confirm
   each trigger fires **once**.
4. GA4 Realtime shows the events with the right hostname.
5. Confirm no PII appears in any `dataLayer` push.

## Checklist

- [ ] GTM script is in `<head>`; `<noscript>` iframe in `<body>`.
- [ ] `gtm.js?id=…` returns 200.
- [ ] Every CTA has a `data-cta` following `{location}-{action}`.
- [ ] `lead_submit` fires only on confirmed success.
- [ ] No PII in `dataLayer`.
- [ ] Container edits are hostname-scoped so other fleet sites are unaffected.
- [ ] GA4 key events marked; Search Console verified and sitemap submitted.

## Gotchas

- Editing `site.config.json` directly is wrong — the id syncs from the roster.
- A shared container means a broken trigger is a **fleet-wide** outage. Test in Preview first.
- Client-side route changes don't apply here (static export, full page loads), so a History Change
  trigger is not needed and will not fire.
- Cloudflare fronts this zone. If a click event stops arriving after an infrastructure change, check
  the edge before the container.
