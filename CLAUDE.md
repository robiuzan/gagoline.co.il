# CLAUDE.md — גגוליין (Gagoline) project rulebook

> This file is the operating manual for any AI agent (and human) working in this repo.
> It is derived from **`brief.md`** (the strategy/intake document). When this file and the
> brief disagree, **the brief wins** — update this file to match. When the code and this file
> disagree, fix the code. The project-level rules here **override** any global defaults.

---

## 1. Project context (from brief Parts A & B)

- **Business:** גגוליין (Gagoline) — a roof **waterproofing / sealing** (איטום גגות) contractor.
- **Founded:** 2014 (positioned as "over a decade of experience", מאז 2014).
- **Service area:** Tel Aviv + the Center (גוש דן והמרכז), up to a 50 km radius.
- **Primary phone (click-to-call):** `055-6601006`.
- **Target audience:** private homeowners (35–65), building committees / shared-building
  residents (ועדי בתים), property managers, and commercial/business buildings.
- **Core pain triggers:** winter leaks (נזילות), damp (רטיבות), mold (עובש), ceiling stains —
  framed around the rainy season. The emotional job-to-be-done is _"a dry roof and peace of mind."_
- **Positioning / UVP:** _diagnosis-first_ — we find the **source** of the leak, seal it with
  advanced materials, give a **written warranty**, and quote a **transparent price**. We out-
  _modernize_ the older veteran competitors rather than out-aging them.
- **Top 3 differentiators:** (1) diagnosis-based method, (2) written warranty + price transparency,
  (3) own professional crew (no subcontractors), fast response incl. winter emergency.

### Conversion goals (brief Part B3) — design every page around these

1. **Primary:** phone call → click-to-call `055-6601006`.
2. **Secondary:** WhatsApp click-to-chat.
3. **Tertiary:** low-friction lead form ("הצעת מחיר חינם" — name + phone).

Every page must keep a call/WhatsApp action within reach (sticky on mobile), a clear CTA in the
hero and footer, and at least one lead-capture form.

> ⚠️ Many concrete values in the brief are tagged **🔶 (assumption — confirm with client)**:
> warranty length, license numbers, insurance, exact prices, business hours, WhatsApp number,
> email, owner/legal name. **Never present a 🔶 value as a confirmed fact.** Keep them isolated
> in `lib/site-config.ts` and comment them `// 🔶 confirm`, so they are trivial to update.

---

## 2. Agent roles / personas

Adopt the matching persona for the task at hand:

- **Copywriter persona (content tasks).** Act as an elite Hebrew conversion copywriter for a
  trusted local trade business. Write in the **exact voice from brief Part D1**:
  - Voice: אמין · מקצועי · רגוע ובוטח · ענייני (no-nonsense) · נגיש.
  - Formality: **friendly-professional** (מקצועי אך בגובה העיניים). Person: **"אנחנו" / גגוליין**.
  - Reading level: simple & clear for a homeowner, with depth where it builds trust.
  - **Favor:** גג יבש · אחריות בכתב · אבחון · מקור הנזילה · שקיפות · פתרון לתמיד · מענה מהיר.
  - **Avoid:** "זול", hype/over-promising, heavy jargon, "פתרון קסם".
  - Emoji: sparingly (a ✓ or 📞 inside a button is fine; not in body copy).
  - Reference voice line: _"לפני שאנחנו אוטמים — אנחנו מבינים מאיפה הנזילה מגיעה."_
- **Front-end engineer persona (build tasks).** Senior Next.js/React/TS engineer. Ship
  accessible, mobile-first, RTL-correct, strictly-typed components. Follow §4–§6 below.
- **Local-SEO persona (metadata/schema tasks).** Optimize for the keyword + city matrix in
  brief Part H. Produce per-page `metadata`, structured data (`LocalBusiness`/`RoofingContractor`,
  `Service`, `FAQPage`, `Review`, `BreadcrumbList`), and the `איטום גגות ב[עיר]` title formula.

---

## 3. Localization & formatting rules (brief Parts A1 & K) — NON-NEGOTIABLE

- **Language:** Hebrew (`he`). **Direction: RTL.** `<html lang="he" dir="rtl">` is already set
  in `app/layout.tsx` — do not remove it.
- **Israeli formats:** phone `0XX-XXX-XXXX`, currency `₪`, dates `dd/mm/yyyy`.
- **RTL Tailwind discipline — mandatory:**
  - Use **logical (direction-aware) utilities ONLY** for horizontal spacing/positioning:
    `ps-*` / `pe-*` (padding), `ms-*` / `me-*` (margin), `start-*` / `end-*` (inset),
    `text-start` / `text-end`, and `space-x-reverse` where horizontal `space-x-*` is used.
  - **BANNED:** hardcoded physical LTR directions — `pl-*`, `pr-*`, `ml-*`, `mr-*`,
    `left-*`, `right-*`, `text-left`, `text-right`. These break RTL. The only exception is a
    genuinely direction-agnostic case, which must carry an explanatory comment.
  - For flex/grid that should mirror, rely on `dir="rtl"` flow; do not force `flex-row-reverse`
    unless intentionally overriding for an LTR island (e.g. a phone number `+972…`, code, latin URL).
  - Latin/LTR snippets embedded in Hebrew (phone, email, URLs) should be wrapped with
    `dir="ltr"` and `unicode-bidi: isolate` (a `.ltr` helper class is provided in `globals.css`).
- Keep user-facing strings in Hebrew. Avoid mixing languages in a single sentence.

---

## 4. Code style & compliance

- **TypeScript strict.** `strict: true` and `noUncheckedIndexedAccess: true` are on. No `any`
  (use `unknown` + narrowing). No non-null `!` to silence the compiler — handle the null case.
- **Components:** React Server Components by default. Add `"use client"` **only** when a file
  needs state, effects, browser APIs, or `framer-motion`. Keep client components small/leaf-level.
- **Imports:** use the `@/*` path alias (e.g. `@/lib/utils`, `@/components/ui/Button`). No deep
  relative `../../..` chains.
- **Class merging:** compose conditional classes with `cn()` from `@/lib/utils` (clsx + tailwind-merge).
- **Styling:** Tailwind utilities only — **mobile-first** (style the base/mobile case, then add
  `sm: md: lg:` overrides). No inline `style={{}}` except for truly dynamic values. Use the design
  tokens from `tailwind.config.ts` (`primary`, `secondary`, `accent`, `font-heading`, `font-sans`) —
  do **not** hardcode brand hex values in components.
- **Files:** components in PascalCase (`ServiceCard.tsx`); hooks `useXxx.ts`; utilities camelCase.
- **Single source of truth:** business NAP, services, and city lists live in `lib/site-config.ts`.
  Never hardcode the phone number, service names, or city slugs in components — import them.
- **No secrets in code.** Read runtime config from env (see `.env.example`). Sanitize/validate all
  form input on the server; escape any user-rendered output.

### Accessibility (brief Part I4) — target WCAG 2.0 AA + Israeli IS 5568

- Semantic HTML and landmarks (`header`, `nav`, `main`, `footer`, one `h1` per page, ordered headings).
- All interactive elements keyboard-operable with a visible focus state; real `<button>`/`<a>` (not
  clickable `div`s). Links/buttons have discernible text or `aria-label` (esp. icon-only buttons).
- Images need meaningful `alt` (empty `alt=""` for decorative). Color contrast ≥ 4.5:1 for text.
- Forms: every input has an associated `<label>`; errors are announced and tied via `aria-describedby`.
- Respect `prefers-reduced-motion` for all `framer-motion` animations.
- An accessibility statement (הצהרת נגישות) page is part of the sitemap — keep it linked in the footer.

---

## 5. Tech stack & architecture (brief Part I1)

- **Framework:** Next.js **14** (App Router) · **React 18** · **TypeScript** · **Tailwind CSS v3**.
- **UI/UX libs:** `lucide-react` (icons), `framer-motion` (animation), `clsx` + `tailwind-merge`
  (class composition, via `cn()`).
- **Content:** in-code / MDX, **no CMS** (static site). Hosting target: **Vercel** + automatic SSL.
- **Layout convention:** **flat** (no `src/`). App Router routes in `app/`. Path alias `@/* -> ./*`.

### Folder map

```
app/                 # App Router routes (see §7 sitemap) + layout.tsx, globals.css, robots/sitemap
components/
  ui/                # primitives: Button, Input, Badge, Card, Section…
  layout/            # Header, Footer, Nav, MobileCallBar, Container…
  forms/             # LeadForm, ContactForm, field components
  marketing/         # Hero, ServicesGrid, Trustbar, Reviews, FAQ, CTA sections…
hooks/               # custom React hooks (useXxx)
lib/
  utils.ts           # cn() and shared helpers
  site-config.ts     # ⭐ single source of truth: NAP, services, cities, hours
types/
  index.d.ts         # global/shared TypeScript types
```

Place files by responsibility. A reusable, presentation-only primitive → `components/ui`. A page
section assembled from primitives → `components/marketing`. Structural chrome → `components/layout`.

---

## 6. SEO & metadata expectations (brief Part H)

- Per-page `metadata` (title + description) using the keyword set in brief Part H1.
- Local matrix: `איטום גגות ב[עיר]` pages under `app/areas/[city]`; per-service pages under
  `app/services/[service]`. Title formula: `איטום גגות ב[עיר] | אחריות בכתב + מחיר שקוף | גגוליין`.
- Structured data via JSON-LD: `RoofingContractor`/`LocalBusiness`, `Service`, `FAQPage`,
  `Review`/`AggregateRating`, `BreadcrumbList`. Keep `app/robots.ts` and `app/sitemap.ts` current.
- Track conversions (brief H4): click-to-call, WhatsApp clicks, form submits, calculator completions.

---

## 7. Sitemap → routes (brief Part E1)

| Page                 | Route                             | Notes                                                                                            |
| -------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| Home                 | `app/page.tsx`                    | hero → trust bar → services → why-us → process → gallery → reviews → pricing → areas → FAQ → CTA |
| Services index       | `app/services/page.tsx`           | lists the 8 services                                                                             |
| Service detail (×8)  | `app/services/[service]/page.tsx` | dynamic; slugs in `site-config`                                                                  |
| About                | `app/about/page.tsx`              | story, experience, warranty, licensing                                                           |
| Reviews              | `app/reviews/page.tsx`            | Google rating + testimonials                                                                     |
| Gallery              | `app/gallery/page.tsx`            | before/after                                                                                     |
| Pricing + calculator | `app/pricing/page.tsx`            | indicative ranges + cost calculator                                                              |
| FAQ                  | `app/faq/page.tsx`                | SEO + trust                                                                                      |
| City × service       | `app/areas/[city]/page.tsx`       | local SEO matrix                                                                                 |
| Blog (Phase 2)       | `app/blog/page.tsx`               | optional                                                                                         |
| Contact              | `app/contact/page.tsx`            | form, map, phone, hours                                                                          |
| Privacy              | `app/privacy/page.tsx`            | legal                                                                                            |
| Accessibility        | `app/accessibility/page.tsx`      | הצהרת נגישות                                                                                     |
| Terms (🔶 optional)  | `app/terms/page.tsx`              | legal                                                                                            |

---

## 8. Commands

| Task                 | Command                               |
| -------------------- | ------------------------------------- |
| Install deps         | `npm install`                         |
| Dev server           | `npm run dev` (http://localhost:3000) |
| Production build     | `npm run build`                       |
| Start built app      | `npm run start`                       |
| Lint                 | `npm run lint`                        |
| Type-check (no emit) | `npm run typecheck`                   |
| Format (write)       | `npm run format`                      |
| Format (check)       | `npm run format:check`                |

Before committing: `npm run lint && npm run typecheck && npm run format`.

---

## 9. Scope guardrails

- This repo is currently **scaffolding** (Phase 2). Page bodies are placeholders. Implement real
  UI/sections/content only when explicitly asked.
- Don't invent business facts. If a value isn't in `brief.md` or `site-config.ts`, treat it as 🔶
  and surface it rather than fabricating it.
- Don't edit generated output (`.next/`, `node_modules/`). Change the source.
