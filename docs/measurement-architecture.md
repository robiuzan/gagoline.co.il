# Measurement architecture

Container mechanics, the `data-cta` inventory, event names and the deploy verification steps live in
the `tracking-analytics` skill. **This file covers what that skill does not:** the dataLayer contract
as a stable interface, the double-count risk introduced by `/thank-you/`, whether server-side tagging
is justified here, how a CRM attaches without touching the critical path, and the performance budget
that governs all of it.

---

## 1. Where measurement actually stands (2026-08-31)

| Layer            | State                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Container        | `GTM-KWGGH438` — the **shared Israeli-fleet container**. Every rule must be hostname-scoped                 |
| Placement        | Renders in `<body>`, not `<head>` — backlog §13.1, still open                                               |
| CTA coverage     | 17 distinct `data-cta` values, `{location}-{action}` convention. Plus `thankyou-call` / `thankyou-whatsapp` |
| Events           | `lead_submit` on confirmed Web3Forms success only                                                           |
| URL conversion   | `/thank-you/` — shipped 2026-08-31, `noindex, follow`, reached by a full navigation                         |
| **GA4 property** | **🔶 Does not demonstrably exist for this domain.** business-facts.md §F                                    |
| Search Console   | Token emitted but hardcoded at `app/layout.tsx:38` instead of read from the manifest — backlog §2.7         |
| Consent          | None. No banner, no consent mode                                                                            |
| CRM              | None. Leads land in an inbox via Web3Forms                                                                  |

> **The single blocking fact: nothing in this repo proves a GA4 property exists for gagoline.co.il.**
> Every event described below currently pushes into a container that may have nowhere to send it.
> Resolve business-facts.md §F before building anything further. Measurement work done above a missing
> property produces confident-looking dashboards of nothing.

---

## 2. The dataLayer contract

Treat the dataLayer as a **public API between the site and the container**. The container is shared
across the fleet; a renamed event silently breaks tags this repo cannot see.

```js
// Conversion — the only event that currently exists.
{ event: "lead_submit", form: "lead" }
```

**Rules:**

1. **Event names are append-only.** Never rename or repurpose one. Add a new name and retire the old
   one in the container, in that order.
2. **Never any PII** — no name, phone, email or message text. CLAUDE.md §12. `{ form: "lead" }` is
   correct precisely because it carries nothing about the person.
3. **Fire on confirmation, never on intent.** `lead_submit` fires after a verified `success` response.
   Firing on submit inflates conversions with failures — including every popup-blocked WhatsApp
   fallback.
4. **A click is not a conversion.** Call and WhatsApp clicks are _intent_; they belong in GA4 as key
   events but must never be summed with `lead_submit` into a single "leads" number.
5. Hostname-scope every trigger and tag. An unscoped rule fires on eight other fleet sites.

---

## 3. `/thank-you/` — two signals, one conversion

The form now emits **both** a `lead_submit` dataLayer push _and_ a real page view of `/thank-you/`.
That is deliberate:

- the **event** is precise (it fires only on a verified API success),
- the **URL** is durable (it survives a container with no custom-event trigger, and it is the only
  clean Google Ads conversion target).

**The risk is counting both as one conversion each.** Configure the container so exactly one
conversion is recorded:

- Use the **`/thank-you/` page view** as the Google Ads conversion.
- Use **`lead_submit`** as the GA4 key event.
- Do **not** also create a GA4 key event on the thank-you page view, and do not create an Ads
  conversion on `lead_submit`. One system, one signal each.
- Verify in GTM Preview that a single submission fires each trigger **once**.

Two properties of the page protect the count and must not be changed casually: it is **`noindex`**, so
organic arrivals cannot inflate it, and it is **linked from nowhere** (`NEVER_LINKED` in
`scripts/link-graph-check.mjs`), so it cannot be reached without submitting.

---

## 4. Server-side tagging — not yet, and here is the test

The ask is a "lightweight, server-side analytics" layer. Server-side GTM is a real technique with real
benefits — first-party cookies, ad-blocker resilience, no vendor JS on the client — and it is **not
justified here yet.**

**What it actually requires:** a tagging server on a subdomain (`sgtm.gagoline.co.il`) running on
Cloudflare Workers or a container host, DNS the owner controls, a server container, and ongoing cost.
It is infrastructure, not a code change, and CLAUDE.md §12 puts zone and DNS decisions with the owner.

**The test to apply before proposing it:**

1. Does a GA4 property exist? _No._ → stop here. Server-side tagging routes data to a destination that
   does not exist.
2. Is client-side tag loss measurably hurting decisions? Unknown — there is no baseline.
3. Is volume high enough that the difference changes an action? A single-location service business in
   the pre-season period is unlikely to clear this.

**Correct sequence:** GA4 property → key events → a full season of baseline data → _then_ evaluate
whether tag loss justifies a tagging server. Building it first optimises a measurement problem the
business has not yet been able to observe.

**What is worth doing now, and is genuinely lightweight:** move the GTM snippet to `<head>` (backlog
§13.1) so the container is not blocked behind body parsing.

---

## 5. Consent

There is no consent banner today, and for the current setup that is defensible: the form collects
name, phone and free text with a plain consent statement linking `/privacy/`, and no PII reaches
`dataLayer`.

**It stops being defensible the moment** advertising cookies, remarketing tags, or any EU-facing
traffic enters the picture. When that happens:

- Implement **GTM Consent Mode v2**, not a homemade banner that blocks the container. Consent Mode
  lets tags run in a cookieless mode rather than vanishing, which keeps modelled conversions.
- The banner is a **sticky element** and therefore competes with `MobileCtaBar` — see
  [personalization-and-mobile.md](personalization-and-mobile.md) §2. It must displace, not stack, and
  must not shift layout.
- Israeli privacy law and GDPR differ. Do not assume one implementation satisfies both; this is a
  question for the owner and, if EU traffic is real, for counsel.

---

## 6. CRM integration without touching the critical path

Today: `LeadForm` → Web3Forms → inbox. That is simple, has a WhatsApp fallback so a lead is never
lost, and adds **zero** bytes to the client.

**The rule for any CRM: no CRM SDK on the client, ever.** HubSpot, Salesforce and their peers ship
100–300 KB of JavaScript that runs on every page — including the 23 city pages, which exist to rank —
to serve a form that already works. That is the single most common way a service site destroys its own
INP.

**Two acceptable integrations, in order of preference:**

1. **Provider webhook (preferred).** Web3Forms posts to the CRM server-to-server. Zero client cost,
   zero critical-path risk, and it keeps working if the CRM is down because the inbox copy still
   arrives.
2. **A Cloudflare Pages Function** (`functions/api/lead.js`, uploaded by wrangler alongside `out/`)
   that receives the POST and fans out to the inbox and the CRM. More control, and it moves the
   Web3Forms access key server-side — currently it is public by design. Costs a runtime dependency on
   the deploy path, so only take it if the fan-out is genuinely needed.

**Non-negotiable in either case:** the existing WhatsApp fallback stays. If the POST fails for any
reason, the lead still reaches a human.

---

## 7. The performance budget for tags

Analytics is the usual reason a fast site becomes slow, and this site is currently fast — `out/` is
clean with no bundle over 1 MB. Budget, enforced by review:

| Constraint                      | Limit                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Third-party JS, total, per page | **≤ 50 KB compressed** beyond the GTM container itself                                |
| Render-blocking third-party     | **Zero.** Everything async or deferred                                                |
| New sticky/injected UI          | Must reserve its box — **no CLS contribution**                                        |
| INP impact of any tag           | Must not add a long task to a click handler on the call or WhatsApp CTA               |
| Tags on city and service pages  | Same budget as the homepage. These pages exist to rank; they are not a dumping ground |

**And the rule that outranks all of them — CLAUDE.md §8:** a GTM snippet in the HTML proves nothing.
Whenever a container id changes, assert `https://www.googletagmanager.com/gtm.js?id=<ID>` returns
**200**. Two fabricated ids once cost the IL fleet 18 days of zero analytics across every site.
