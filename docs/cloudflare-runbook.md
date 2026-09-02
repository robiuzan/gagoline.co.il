# Infrastructure runbook — gagoline.co.il

Zone and host settings are **owner-only**. No agent changes them; this file says what to change, why,
and how to prove it worked. Cloudflare moves menu items between releases, so each step gives the
**searchable feature name** as well as a path — search the dashboard for the name if the path has moved.

**The hosting model:** static export → `wrangler pages deploy` to the **Cloudflare Pages** project
`gagoline` → apex and `www` are proxied CNAMEs to `gagoline.pages.dev`. Cut over **2026-08-02**.
`public/_headers` and `public/_redirects` are **live features here** — `public/_headers` ships today
with a report-only CSP and the asset cache rules.

**Measured limit (2026-09-01):** `_headers` cannot override a header the Cloudflare **zone** injects.
This zone carries the fleet header Transform Rules, so HSTS, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` are **owner/zone actions** and
re-declaring them in `_headers` is inert, not duplicative. CSP and `Cache-Control` are **not**
zone-injected, so `_headers` genuinely controls those.

> **History.** Until the 2026-08-02 cutover this site was a WebDAV upload to a cPanel docroot
> (`server.websquadinc.com`) with Cloudflare in front as a proxy. That host serves nothing now, and
> `public/.htaccess` — the header mechanism of that era — has been deleted. No Apache is in the path.

Zone facts verified live **2026-08-16**, re-verified **2026-08-31** (Step 1). Re-verify with the
commands at the bottom; never assume a toggle was flipped.

---

## Step 1 — Unblock the AI crawlers (highest impact)

**Feature name:** _AI Crawl Control_ (previously "AI Audit"). Sidebar of the zone, or search "AI Crawl".

### What's happening now

Cloudflare **prepends a managed block** to `/robots.txt`, ahead of the rules this repo generates.
Measured live:

```
# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: Amazonbot                        Disallow: /
User-agent: Applebot-Extended                Disallow: /
User-agent: Bytespider                       Disallow: /
User-agent: CCBot                            Disallow: /
User-agent: ClaudeBot                        Disallow: /
User-agent: CloudflareBrowserRenderingCrawler Disallow: /
User-agent: Google-Extended                  Disallow: /
User-agent: GPTBot                           Disallow: /
User-agent: meta-externalagent               Disallow: /
# END Cloudflare Managed Content
```

The repo's own `User-Agent: * / Allow: /` and the `Sitemap:` line follow it and are intact — ordinary
search crawling is unaffected. **It is specifically AI access that is blocked**, and `app/robots.ts`
cannot override it because the managed rules are injected at the edge.

> ## ✅ RESOLVED — re-verified live 2026-08-31
>
> **Everything above describes the 2026-08-16 state and is kept only as the history of the fix.** The
> block is gone. `curl https://gagoline.co.il/robots.txt` now returns the fleet allow list, and a
> user-agent probe returns **200** for GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot,
> Google-Extended and CCBot — so the enforced bot rule that previously answered **403** was lifted as
> well, which the advisory file alone would not have shown.
>
> AI visibility is **no longer capped**. Re-run the probe in Step 1's verification block after any
> Cloudflare change; a zone toggle can be reverted without any signal reaching this repo.

### The decision

Three coherent positions. Pick one deliberately:

| Option                              | Effect                                                                                                                               | Who it suits                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Allow retrieval, block training** | ChatGPT, Claude and Perplexity can fetch a page to answer a live question and cite you. Content stays out of model training corpora. | **Recommended.** You get the citations without feeding training sets.                                     |
| **Allow everything**                | Also permits training use. Simplest, maximum reach.                                                                                  | If training use is not a concern.                                                                         |
| **Keep blocked**                    | Status quo. No AI assistant can read or cite the site.                                                                               | Only if you actively object to AI usage — accept that competitors who allow it become the answer instead. |

These are genuinely different permissions. A crawler blocked from _retrieval_ cannot cite you even if
it wanted to; `ai-train=no` alone does not block citation.

### What to do

1. Zone → **AI Crawl Control**.
2. Find the **managed `robots.txt`** control. Either turn it off entirely (this repo's `app/robots.ts`
   then serves alone) or set the individual crawlers to **Allow**.
3. For the recommended middle option, allow at minimum: **OAI-SearchBot**, **ChatGPT-User**,
   **ClaudeBot**, **Claude-User**, **PerplexityBot**, **Google-Extended**. Leave `ai-train=no` in the
   Content-Signal if the control offers it separately.
4. Cloudflare may also expose per-crawler blocking as a **WAF rule** or a **bot-management** setting. If
   `robots.txt` looks right but crawlers still get 403s, check there too — `robots.txt` is advisory, a
   WAF block is enforced.

### Before you do it

The site currently publishes three placeholder testimonials, an empty gallery and a "coming soon" blog
(backlog §7). Opening the site to assistants in that state means assistants can quote it in that state.
**Do backlog Phase 1 first**, then open the gate.

### Verify

```bash
curl -sS https://gagoline.co.il/robots.txt
```

The managed block should be gone, or show `Allow` for those agents. **This is the only proof that
counts.**

---

## Step 2 — Add a CSP (the one missing header)

**Feature name:** _Transform Rules → Modify Response Header_, or _Rules → Response Header Transform_.

### What's happening now

The edge already returns a solid baseline, measured live:

| Header                        | Live value                                               |
| ----------------------------- | -------------------------------------------------------- |
| `strict-transport-security`   | `max-age=15552000` (180 days, no subdomains, no preload) |
| `x-frame-options`             | `SAMEORIGIN`                                             |
| `x-content-type-options`      | `nosniff`                                                |
| `referrer-policy`             | `strict-origin-when-cross-origin`                        |
| `permissions-policy`          | `geolocation=(), microphone=(), camera=()`               |
| `content-security-policy`     | **absent**                                               |
| `access-control-allow-origin` | `*` on HTML                                              |

**The five that are present come from the Cloudflare zone**, not from Pages defaults and not from
`public/_headers`. The tell is the casing: the zone Transform Rules return them Title-Cased, and the
HSTS value matches the fleet rule. `public/_headers` **cannot override** them — the zone value wins and
the `_headers` entry is simply inert, so changing any of the five is **owner action in the zone**.

`public/.htaccess` no longer exists and is not the answer either; no Apache serves this site.

### What to do

CSP is the one header the zone does **not** inject, which means `public/_headers` can carry it from
this repo — no zone change, no owner action. **That file now ships
`Content-Security-Policy-Report-Only`** (added 2026-09-01) alongside the `/_next/static/*` immutable
cache rule. The draft directive set, the hosts it must include, and the week-of-observation process are
in the `/web-security-headers` skill. It stays report-only until violations have been observed on live
traffic — including one real form submission and one tracked call click — and only then consider
enforcing.

Optional, owner's call: lengthen HSTS or add `includeSubDomains`. **Do not add `preload`** casually; it
is close to irreversible. And `access-control-allow-origin: *` on HTML is harmless here but wider than
anything on this site needs.

### Verify

```bash
curl -sSI https://gagoline.co.il/ | grep -iE 'strict-transport|content-security|x-frame|permissions|referrer|access-control'
```

---

## Step 3 — Redirect www → apex

### What's happening now

`https://www.gagoline.co.il/` returns **HTTP 200 with the full site**, not a redirect. Two hostnames
serve identical content.

**This is mitigated, not broken:** every page's canonical points at the apex and the sitemap contains
no `www` URLs, so search engines will consolidate onto `https://gagoline.co.il/`. It costs some crawl
budget and leaves two live copies of the site.

### What to do

Zone → **Rules** → **Redirect Rules** → there is usually a _"Redirect from WWW to Root"_ template.
Create it as a **301**. Don't hand-roll a Page Rule; the template handles the path and query string
correctly.

### Verify

```bash
curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://www.gagoline.co.il/
```

Expect `301 -> https://gagoline.co.il/`.

---

## Leave these alone

| Setting                               | Current                                                | Why                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scrape Shield → Email Obfuscation** | on, and **worked around**                              | The live HTML carries a raw `mailto:info@gagoline.co.il` because `components/ui/EmailAddress.tsx` emits `<!--email_off-->` markers. Turning the feature off would also work — but **don't remove the component**, and re-check the live `mailto:` after any zone change (commit `ac48484`)                                                                             |
| **Speed → Rocket Loader**             | leave **off**                                          | Rocket Loader defers scripts and is a classic cause of GTM firing late or not at all. This site's entire conversion measurement depends on GTM click triggers                                                                                                                                                                                                          |
| **Auto Minify**                       | n/a                                                    | Deprecated by Cloudflare and unnecessary — Next already minifies                                                                                                                                                                                                                                                                                                       |
| **Caching level / Cache Rules**       | zone default; HTML measured `cf-cache-status: DYNAMIC` | HTML cache-control is now set by **`public/_headers`** (`public, max-age=0, s-maxage=3600, must-revalidate`), not by the zone — leave the zone rules alone so the repo stays the single knob. Don't add a zone Cache Rule that caches HTML with a long browser TTL: a Pages deploy publishes atomically at the edge, but a browser holding a stale page still hides it |

---

## The deploy interaction worth knowing

`wrangler pages deploy` uploads a **full file manifest**, hash-deduped against what the project already
holds, and then publishes the result as one **atomic deployment** (`/deploy-gagoline`). There is no
partial state and no delta to get wrong. The confusion that remains is a different one: the
`*.pages.dev` deployment URL flips first, and the custom domain follows — so a change that is already
visible on `gagoline.pages.dev` and not yet on `gagoline.co.il` is usually propagation, not a failure.

Before re-deploying, check whether you are looking at a cached copy:

```bash
curl -sS "https://gagoline.co.il/?cachebust=$$" | grep -o '<title>[^<]*</title>'
```

Everything in `out/` ships — `public/*` is copied there by the export, which is how `public/_headers`
reaches Pages. There is no per-file opt-in flag on this path.

---

## One-shot verification

```bash
curl -sS https://gagoline.co.il/robots.txt | sed -n '28,60p'
curl -sSI https://gagoline.co.il/ | grep -iE 'strict-transport|content-security|x-frame|permissions|referrer'
curl -sS -o /dev/null -w "www: %{http_code} -> %{redirect_url}\n" https://www.gagoline.co.il/
curl -sS https://gagoline.co.il/ | grep -o 'mailto:[^"]*' | head -1
curl -sS https://gagoline.co.il/sitemap.xml | grep -c '<url>'          # expect 43
curl -o /dev/null -w "gtm: %{http_code}\n" -s "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"
```
