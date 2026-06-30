# גגוליין (Gagoline)

Roof waterproofing (איטום גגות) service website for **גגוליין**, serving Tel Aviv and the
Center. Hebrew, RTL, mobile-first, conversion-focused.

- **Strategy / intake:** [`brief.md`](./brief.md)
- **Agent & engineering rulebook:** [`CLAUDE.md`](./CLAUDE.md) — read this first.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript (strict) · Tailwind CSS v3 ·
`framer-motion` · `lucide-react` · `clsx` + `tailwind-merge`. No CMS (static, MDX/code content).
Hosting target: Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev                  # http://localhost:3000
```

## Scripts

| Command             | Purpose                             |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server                          |
| `npm run build`     | Production build                    |
| `npm run start`     | Serve the production build          |
| `npm run lint`      | ESLint (next/core-web-vitals)       |
| `npm run typecheck` | `tsc --noEmit`                      |
| `npm run format`    | Prettier (+ Tailwind class sorting) |

## Project structure

```
app/            App Router routes (see CLAUDE.md §7), layout, globals.css, robots/sitemap
components/     ui · layout · forms · marketing
hooks/          custom React hooks
lib/            utils.ts (cn) · site-config.ts (single source of truth)
types/          shared TypeScript types
brief.md        product/marketing brief
CLAUDE.md       project rules for AI agents + humans
```

> **Status:** Phase 2 — environment scaffolding. Page bodies are placeholders; UI components and
> content are built in Phase 3. See `CLAUDE.md` §9 for scope guardrails.
