---
name: deploy-gagoline
description: Ship gagoline to production — ops/deploy-site.ps1 dry-run then -Confirm (wrangler direct upload to the Cloudflare Pages project), why pushing to main deploys nothing, why the WebDAV script in this repo is dead, the npm file: tarball and .next cache traps, the out.prev rollback, and post-deploy verification against the live site. Use when publishing. Triggers "deploy", "ship it", "publish the site", "go live", "roll back", "why isn't my change live".
---

# Deploy

## The one thing to know

**Production is Cloudflare Pages via wrangler direct upload. Pushing to `main` deploys nothing.**

Project `gagoline` (roster: `hosting.target: "cloudflare-pages"`), serving `gagoline.pages.dev`,
`gagoline.co.il` and `www.gagoline.co.il`.

## ⚠️ Do not run `deploy/deploy-webdav.ps1`

That script — and `public/.htaccess` beside it — are leftovers from a **previous cPanel host**. The
Web Disk root it writes to is a stale docroot that Apache no longer serves.

On 2026-08-17 it ran cleanly, uploaded 106 files, reported **"106 ok, 0 failed"**, and changed nothing
the public could see. It looks exactly like a successful deploy. The tells were: the live sitemap
still had the old URL count, and the deployer's own delta re-check still reported 106 files differing.

The shared `ops/webdav-deploy.ps1` now refuses to run without an explicit `REMOTE_BASE`, so this
cannot silently recur — but the correct move is to use the Pages path below, not to fix the WebDAV one.

## The command

Deploying is a **production mutation**. It runs dry first, and it always asks.

```powershell
$ops = "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/deploy-site.ps1"

# preview - safe, changes nothing, and runs the drift check
powershell -File $ops -Domain gagoline.co.il -DryRun

# execute - only after the user asks
powershell -File $ops -Domain gagoline.co.il -Confirm
```

Other flags: `-BuildOnly` (build + output gate, no upload), `-DeployOnly` (ship the existing `out/`
as-is), `-SkipDriftCheck` (only when the roster is knowingly ahead of DNS).

## What the script does, and why each step exists

1. Resolves the Pages project name from the roster (`gagoline`).
2. **Drift check** — asks the Cloudflare API whether that Pages project actually serves this domain.
   This is the guard against pushing into a project nothing resolves to, which reports success while
   changing nothing public. A healthy run prints:
   `drift check OK (gagoline.pages.dev, gagoline.co.il, www.gagoline.co.il)`.
   **This is the exact class of failure the dead WebDAV script has no protection against.**
3. Installs dependencies, busting two caches (below).
4. `npm run build`.
5. **Output gate** on `out/` — refuses to ship a broken or stale export.
6. Preserves the previous `out/` as `out.prev/` so a rollback is one command.
7. `npx wrangler pages deploy .\out --project-name gagoline --branch main`.
8. Appends the result to `logs/deploys.csv`.

## The two staleness traps

Both produce a **successful build of the wrong code**, with no error anywhere:

- **npm caches `file:` tarball dependencies.** `@ishub/site-kit` installs from a tarball path in the
  hub. This bit hard on 2026-08-17: `npm install --force` was **not** enough, because the lockfile
  pinned the _old_ tarball's `integrity` hash and npm kept serving its cached extraction. It took
  `npm cache clean --force` plus an explicit reinstall from the tarball path to rewrite the hash.
  Symptom: `tsc` fails on kit exports that plainly exist in the tarball on disk.
- **Next caches compiled modules under `.next/`.** Even with correct `node_modules`, a rebuild can
  emit the previous kit's components.

If you build manually before deploying, `rm -rf .next out` first.

## Before you deploy

Run `/qa-build-gate` end to end. Its stop-ship list applies — in particular, no rendered 🔶, no
placeholder text, no doubled `<title>`, no missing canonical, and no `Review`/`AggregateRating`
without a verifiable source.

## After you deploy — the step that actually matters

A "Deployment complete" line is **not** verification. Prove it against the live site:

```bash
curl -sS https://gagoline.co.il/sitemap.xml | grep -c '<url>'          # expect 40
curl -sSL https://gagoline.co.il/ | grep -c 'להחלפה'                    # expect 0
curl -sS https://gagoline.co.il/about/ | grep -o '<title>[^<]*</title>'
curl -sSI https://gagoline.co.il/ | grep -iE 'cf-cache-status|strict-transport'
curl -o /dev/null -w '%{http_code}\n' -s "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"
curl -sSL https://gagoline.co.il/ | grep -o 'mailto:[^"]*' | head -1
```

Two propagation notes, both observed on 2026-08-17:

- The **deployment URL updates before the custom domain**. If `https://<hash>.gagoline.pages.dev/` is
  correct and `https://gagoline.co.il/` is not, wait and re-fetch rather than re-deploying.
- The custom domain's HTML is a few bytes smaller than the Pages copy — that is Scrape Shield
  processing the `email_off` markers. Confirm the `mailto:` survives; a
  `/cdn-cgi/l/email-protection` URL means the `EmailAddress` component regressed (commit `ac48484`).

## Rollback

`out.prev/` holds the previous export:

```powershell
npx wrangler pages deploy .\out.prev --project-name gagoline --branch main
```

Cloudflare Pages also keeps prior deployments in its dashboard and can roll back there, which is often
faster — offer both and let the user choose.

## Rules

- **Never deploy without being asked.** Not as the last step of a task, not "while I'm here".
- Always `-DryRun` first and show the user the delta and the drift-check result.
- **Never trust an uploader's own success message.** Verify against the live URL; that is the whole
  lesson of the WebDAV incident.
- Never use `-SkipDriftCheck` to make a failing deploy pass. A drift failure means the deploy would
  have gone somewhere nobody can see.
- Never edit `site.config.json` as part of a deploy — it syncs from the roster.
- Never deploy with `/qa-build-gate` stop-ship items outstanding.
- Zone settings (AI crawler policy, cache rules, Scrape Shield) are the owner's to change.
