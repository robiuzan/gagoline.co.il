---
name: new-city
description: Add a new service-area city to the Gagoline local-SEO matrix. Use when the user wants to add/create a city or area page. The site is data-driven — this edits one array in site-config and the /areas/[city] route + sitemap update automatically.
---

# Add a new service-area city

This site is **data-driven**: `app/areas/[city]/page.tsx` renders a generic local page for every city
in config via `generateStaticParams()` (same service list, city name interpolated into the title,
intro copy, and metadata). You do **not** create a page file.

## Steps

1. **Gather inputs** (ask the user if missing):
   - Hebrew city **name** (e.g. `הרצליה`).
   - English kebab-case **slug** for the URL (e.g. `herzliya`). Must be unique.
   - **Confirm it's inside the service area** — Tel Aviv + the Center, up to ~50 km
     (`siteConfig.serviceArea`). If it's outside, flag it to the user before adding.

2. **Add the city to `lib/site-config.ts`** — append to the `cities` array:

   ```ts
   { slug: "<slug>", name: "<Hebrew name>" },
   ```

   (Extends the `CitySlug` union automatically — keep the `as const`.)

3. **No new file or copy needed.** The page template builds the title
   `איטום גגות ב<name> | אחריות בכתב + מחיר שקוף`, the intro, the service grid, and the
   `app/sitemap.ts` entry from this single array.

4. **Verify:** run `npm run typecheck && npm run build`. Confirm `/areas/<slug>` is in the build output
   and `npm run lint` stays green.

## Notes & guardrails

- City pages are currently **generic** (identical except the city name). If the user wants
  city-specific copy or local landmarks, that's a template change — say so; this skill only adds the
  entry. Optionally hand off to `local-seo` to add the city `LocalBusiness` + `BreadcrumbList` JSON-LD
  (currently missing on city pages).
- Don't invent cities outside the real service radius. Keep slug English/kebab, name Hebrew.
