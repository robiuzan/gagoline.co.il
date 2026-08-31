# Mobile UX and personalization

Mobile is where this business converts: a homeowner with a wet ceiling, on a phone, in the rain. This
file covers the **conversion geometry** of that screen and the **hard limits** on serving different
content to different people.

WCAG numbers (contrast ratios, the 44px minimum, focus order) are in the `responsive-accessibility`
skill and are not restated here. CTA inventory and form rules are in `conversion-cro`.

---

## 1. The thumb zone

Hold a 6.1″ phone one-handed. The comfortable arc is the **bottom 40%** of the screen, biased toward
the side of the holding thumb. The top corners are the worst real estate on the device — and in RTL
Hebrew, the natural thumb reach and the reading start are on the **same** side, which is an advantage
this site should not squander.

**Rules:**

1. **A primary action is always inside the bottom 40%, at every scroll position.** `MobileCtaBar` does
   this today — fixed bottom, 50/50 call/WhatsApp, `lg:hidden`, with a matching `h-16 lg:hidden`
   spacer in `app/layout.tsx` so it never covers the footer. **Do not remove that spacer**; without
   it the bar eats the last section of every page.
2. **Never put a destructive or dead-end action next to a conversion action** in the bar. Two
   positive actions, that is all.
3. **Minimum 44×44 CSS px** for every tap target, with **≥8px** between adjacent ones. Adjacent
   40px targets are a misdial, and a misdial on a call button is a lost lead, not a UX nit.
4. **Hebrew RTL:** never force `flex-row-reverse` to reorder the bar. If the order is wrong, the DOM
   order is wrong. Use logical utilities and let `dir="rtl"` mirror it.
5. **The form is the last resort, not the first ask.** Conversion priority is call → WhatsApp → form.
   On mobile the form should never be the only action above the fold.
6. **One-handed reachability applies to error recovery too.** When lead-form validation fails, focus
   moves to the offending field — which scrolls it into view. That is a mobile fix as much as an
   accessibility one.

**Measured against, not asserted:** every claim above is checkable in the export or a device
emulator. Check at **360px** — the narrowest width that matters — not at 375px.

---

## 2. Sticky elements — the budget

One sticky element. There is already one.

A sticky header _and_ a sticky CTA bar _and_ a cookie banner _and_ a chat bubble leaves a 6.1″ phone
with roughly half its viewport for content. Every additional sticky surface must displace an existing
one, not stack on it. This is a hard budget, not a guideline.

If a consent banner is ever added (see [measurement-architecture.md](measurement-architecture.md) §5),
it **replaces** the CTA bar while shown and must not push layout — reserve its height or render it as
an overlay, or it costs CLS on first paint on every page.

---

## 3. Geolocation personalization — read this before writing any of it

The ask is "swap content based on the visitor's city." On this stack that ranges from _free and
useful_ to _actively destructive_, and the difference is not obvious.

### 3.1 What the stack allows

`output: "export"` means **no Next middleware, no server components at request time, no ISR.** Two
mechanisms exist:

| Mechanism                                                                                    | Sees geo?                                      | Crawler-visible | Cost                                                                  |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------- | --------------------------------------------------------------------- |
| **Cloudflare Pages Function** (`functions/_middleware.js`, uploaded by wrangler with `out/`) | Yes — `request.cf.city`, `.region`, `.country` | Yes             | Real server-side varying. **Interacts with the CDN cache — see §3.2** |
| **Client-side swap after hydration**                                                         | Only via a geo API call or a coarse IP lookup  | **No**          | CLS, an extra request, and a flash of the wrong content               |

### 3.2 The two failure modes

**Cloaking.** Serving Googlebot something different from what a user sees at the same URL is a
policy violation, not a grey area. A Pages Function that varies body copy by `cf.country` will show
Googlebot (crawling from the US) different content from an Israeli homeowner. That is the textbook
case.

**Cache poisoning.** Cloudflare caches by URL. A geo-varied response cached for one city is then
served to every other city until it expires. Fixing that requires a `Vary` header or a custom cache
key — and **cache rules are zone settings, which CLAUDE.md §12 puts squarely in the owner's hands.**
Personalization built without that change will silently serve תל אביב copy to a visitor in נתניה, and
the deploy log will show nothing wrong.

### 3.3 The rule

> **Never personalize indexed body copy. Personalize only surfaces that are neither indexed nor
> cached-critical.**

**Permitted** — client-side, after paint, into a box whose height is already reserved:

- The CTA bar label: `התקשרו — שירות בתל אביב` instead of the generic string.
- Ordering the city chips so the visitor's city sorts first (the same links, reordered).
- A dismissible "אנחנו עובדים ב<city>" strip, if and only if the city is one of the 23 served.

**Forbidden:**

- Varying the `<h1>`, the meta title, the description, or any JSON-LD.
- Varying prices, warranty text, or any trust claim — those are `business-facts.md` territory and
  several are still 🔶.
- Injecting a city name the site does not actually serve. Claiming coverage in a city outside the
  ~50 km radius is a false business claim, and it is trivially generated by an unfiltered geo lookup.
- Any swap that shifts layout. Reserve the box or do not ship it.

### 3.4 The honest recommendation

**The geo strategy is already built, and it is the right one: 23 city pages with genuinely unique
content.** A crawler-visible, cacheable, per-city URL beats a runtime swap on every axis that matters
— it ranks, it can be linked, it can carry `Service` schema with `areaServed`, and it cannot cloak.

Runtime personalization adds, at best, a small lift to a CTA label. Sequence it **after**
`optimization-backlog.md` §3 and §9 are closed, and treat §3.3's permitted list as the whole scope.
If the answer to "what does this do that a city page does not" is not immediate and specific, do not
build it.

---

## 4. What to measure

Personalization without measurement is decoration. Before shipping any swap, the variant must be
attributable:

- Every personalized CTA keeps its `data-cta` and adds a variant suffix — `sticky-call` →
  `sticky-call-geo`. The naming convention `{location}-{action}` is matched on by GTM triggers; do not
  break it, extend it.
- No PII in `dataLayer` — CLAUDE.md §12. A city name from an IP lookup is borderline; send the
  **matched served-city slug**, never a raw coordinate or a full IP-derived location.
- Compare against the unpersonalized baseline over a full weather cycle. Demand here spikes with the
  first rain, so a week-on-week comparison across a rain event measures the weather, not the change.
