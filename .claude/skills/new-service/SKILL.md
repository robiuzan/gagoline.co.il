---
name: new-service
description: Add a new roof-waterproofing service to the Gagoline site. Use when the user wants to add/create a service or service page. The site is data-driven — this edits site-config + content (no new page file) and the /services/[slug] route, ServicesGrid, and sitemap update automatically.
---

# Add a new service

This site is **data-driven**: `app/services/[service]/page.tsx` renders every service from config via
`generateStaticParams()`. You do **not** create a page file — you add two data entries and the route,
the `ServicesGrid` card, and `sitemap.ts` all update on the next build.

## Steps

1. **Gather inputs** (ask the user if missing):
   - Hebrew display **name** (e.g. `איטום מרפסות`).
   - English kebab-case **slug** for the URL (e.g. `balcony-sealing`). Must be unique.
   - An **icon** from the existing `IconName` union in `lib/content.ts`:
     `ShieldCheck | Brush | Layers | Building2 | Search | Building | Sun | Waves`.

2. **Add the service to `lib/site-config.ts`** — append to the `services` array:

   ```ts
   { slug: "<slug>", name: "<Hebrew name>" },
   ```

   (This extends the `ServiceSlug` union automatically — keep the `as const`.)

3. **Add display copy to `lib/content.ts`** — add a `serviceMeta["<slug>"]` entry with `tagline`,
   `description`, and `icon`. `serviceCards` maps over `services` and spreads `serviceMeta[slug]`, so
   **every slug must have a matching `serviceMeta` entry or the build breaks.**
   - Write `tagline` + `description` in the **gagoline Hebrew voice** — delegate to the
     `hebrew-copywriter` agent (favor: אבחון · מקור הנזילה · אחריות בכתב · מחיר שקוף · גג יבש;
     avoid: "זול", hype, jargon). Match the length/tone of existing entries.
   - If any claim isn't confirmed in `brief.md`/`site-config.ts`, add `// 🔶 confirm`.

4. **No new file needed.** The route `/services/<slug>`, the card in `ServicesGrid`, the related-services
   list, and `app/sitemap.ts` all derive from these arrays.

5. **Verify:** run `npm run typecheck && npm run build`. Confirm `/services/<slug>` appears in the build
   output and `npm run lint` stays green. Optionally hand off to the `local-seo` agent to add the
   `Service` + `BreadcrumbList` JSON-LD (currently missing on service pages).

## Guardrails

- Don't hardcode the service anywhere outside `site-config.ts` / `content.ts`.
- Keep slug English/kebab; keep name Hebrew. Confirm the service is real — don't invent offerings.
