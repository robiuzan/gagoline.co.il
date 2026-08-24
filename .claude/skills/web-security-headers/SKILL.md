---
name: web-security-headers
description: Security posture for a static export on Cloudflare Pages — headers via public/_headers (which IS live here) or a Transform Rule, a report-only-first CSP path around the inline GTM snippet, PII and consent on the lead form, and secret hygiene. Use when adding headers, planning a CSP, or auditing security. Triggers "security headers", "CSP", "HSTS", "htaccess", "is the form safe", "clickjacking".
---

# Security headers & posture

`output: "export"` means Next's `headers()` is unavailable. **This host is Cloudflare Pages**, so
`public/_headers` and `public/_redirects` are live features — they are the repo-owned way to set
headers here.

> Corrected 2026-08-17. This skill previously stated the exact opposite — that `_headers` was inert
> and headers belonged in `public/.htaccess`. That was inferred from leftover cPanel tooling and is
> wrong: `.htaccess` is dead, Apache serves nothing for this site, and following the old advice would
> have shipped a CSP that never took effect.

Two layers can set headers on this site:

| Layer                            | Owned by  | Ships how                            |
| -------------------------------- | --------- | ------------------------------------ |
| **`public/_headers`**            | this repo | copied into `out/`, applied by Pages |
| **Cloudflare** — Transform Rules | the owner | zone dashboard                       |

The working rule: **measure first, add nothing that already exists, and keep the whole policy in one
layer.** Five headers are already served with **no `_headers` file in the repo**, so find out which
layer supplies them before adding a sixth — Pages defaults and a Transform Rule look identical from
outside, and duplicating HSTS or X-Frame-Options is at best noise.

## What ships today

`public/.htaccess` (dead artifact of the previous host) is four lines:

```apache
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
```

It is inert — Apache does not serve this site. And yet, measured live on 2026-08-16, the site returns
a complete baseline from _somewhere_:

| Header                        | Live value                                       |
| ----------------------------- | ------------------------------------------------ |
| `strict-transport-security`   | `max-age=15552000` (180d, no subdomains/preload) |
| `x-frame-options`             | `SAMEORIGIN`                                     |
| `x-content-type-options`      | `nosniff`                                        |
| `referrer-policy`             | `strict-origin-when-cross-origin`                |
| `permissions-policy`          | `geolocation=(), microphone=(), camera=()`       |
| `content-security-policy`     | **absent — the one real gap**                    |
| `access-control-allow-origin` | `*` on HTML — wider than needed                  |

**These do not come from this repo** — there is no `public/_headers` file. They are either Cloudflare
Pages defaults or a zone Transform Rule; from outside, the two are indistinguishable. That is the single
most important fact in this file: writing them into a new `_headers` would **duplicate headers that
already exist**, and duplicate `Strict-Transport-Security` or `X-Frame-Options` values are at best
ignored and at worst conflicting. Establish the source first, then add only what is missing.

**Always re-measure before changing anything**, because the edge configuration can change without a
commit:

```bash
curl -sSI https://gagoline.co.il/ | grep -iE 'strict-transport|content-security|x-frame|x-content-type|permissions|referrer|access-control'
```

## What is actually left to do

1. **CSP** — the only missing header. See below. Set it **wherever the other five are set**, so the
   policy stays in one layer. If they turn out to be Pages defaults, `public/_headers` is the right
   home and it ships with the normal deploy; if they come from a Transform Rule, CSP belongs there too
   and is owner action.
2. **HSTS hardening** (optional) — 180 days without `includeSubDomains`. Lengthening it or adding
   subdomains is an owner decision; `preload` is close to irreversible and should not be added casually.
3. **`Access-Control-Allow-Origin: *`** on HTML — harmless for a public brochure site, but nothing here
   needs it.

### The shape of `public/_headers`

If Pages defaults turn out to be the source, this is the file to add — one rule block, no Apache
syntax, no module guards:

```
/*
  Content-Security-Policy-Report-Only: <policy below>
```

Do **not** write `.htaccess` directives. Apache does not serve this site, so they are silently inert —
which is worse than an error, because the header appears to have been shipped.

## CSP — report-only first, always

GTM is injected via `dangerouslySetInnerHTML` in `app/layout.tsx`, and **a static export cannot
generate a per-request nonce**. So the options are a hash of the inline snippet, or `'unsafe-inline'`
for scripts. Neither is free, which is exactly why this goes report-only first.

Set it alongside the five headers already served, so the policy lives in one layer — `public/_headers`
if those are Pages defaults, the Transform Rule if they are not.

```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://api.web3forms.com https://www.google-analytics.com https://*.googletagmanager.com; img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com https://imgquarry.com; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src https://www.googletagmanager.com; base-uri 'self'; form-action 'self' https://api.web3forms.com
```

The hosts that must be present or something breaks:

- `googletagmanager.com` — the container, plus `frame-src` for the `<noscript>` iframe.
- `api.web3forms.com` — the lead form POST, in `connect-src` **and** `form-action`.
- `imgquarry.com` — the media host in the manifest, already preconnected in the layout, and where
  images will come from once they exist.
- `'unsafe-inline'` in `style-src` — Next emits inline styles; removing it costs more than it's worth
  here.
- Cloudflare's own injected scripts (Rocket Loader, email-decode) if any zone feature adds them —
  another reason to observe before enforcing.

**Process:** ship report-only → collect reports for at least a week of real traffic, including a real
form submission and a GTM-tracked call click → only then tighten and switch to enforcing. Shipping an
enforcing CSP untested breaks analytics or the form silently, and on a lead-gen site that is a revenue
bug.

## The lead form

- POSTs to `https://api.web3forms.com/submit` over HTTPS with a **public-by-design** access key from the
  manifest. It is not a leaked secret; don't report it as one.
- Honeypot field `company` present (`LeadForm.tsx:45,185-194`). No client-side rate limiting —
  acceptable for the volume, and Web3Forms applies its own.
- The WhatsApp fallback opens a deep link containing the user's own submitted data. That is the user's
  data going to the user's own app — fine, but don't extend the pattern to anything else.
- **Consent:** the form collects PII while `/privacy/` exists and is never referenced from it. Add the
  link (see `/conversion-cro`).
- **No PII in `dataLayer`** — the current `trackEvent("lead_submit", { form: "lead" })` sends none.
  Keep it that way.

## The three `dangerouslySetInnerHTML` uses

Know them before flagging them: the GTM snippet, the JSON-LD blocks, and
`components/ui/EmailAddress.tsx`. The last one exists because Cloudflare Scrape Shield rewrites
`mailto:` links into 404 URLs on this zone; its input is a build-time manifest constant and it escapes
anyway. Read its header rather than pattern-matching on the API name.

Verified live 2026-08-16: `https://gagoline.co.il/` serves a raw `mailto:info@gagoline.co.il` and no
`/cdn-cgi/l/email-protection` URL — the opt-out is working. Re-check that after any zone change, and
never remove the component to "clean up" the `dangerouslySetInnerHTML`.

## Secret hygiene

The only key in the repo is the public Web3Forms access key. `.env.example` still documents a dead
`LEAD_EMAIL_TO` + SMTP path (the form has used Web3Forms since it was wired) and a `NEXT_PUBLIC_GA_ID`
that nothing reads — clean it up so nobody wires a real secret into a dead path.

**Deploy credentials must never enter this repo.** wrangler reads its Cloudflare token from the hub
deployer's environment. (`deploy/deploy-webdav.ps1` is a dead artifact of the previous host — see
`/deploy-gagoline`.)

```bash
npm audit --omit=dev    # runtime — matters
npm audit               # includes dev — usually informational for a static export
```

Report the two separately. A devDependency advisory does not ship to users here.

## Checklist

- [ ] Live headers re-measured **before** proposing any change — five of the six are already set at the
      edge.
- [ ] Nothing added that is already being served.
- [ ] Headers go in `public/_headers` or the Transform Rule — never `.htaccess`, which is inert here.
- [ ] HSTS left without `preload` unless the owner has explicitly accepted it.
- [ ] CSP is **report-only** and has been observed for a full week including a real form submit.
- [ ] Form links to the privacy policy.
- [ ] No PII in `dataLayer`.
- [ ] No credentials in `deploy/`.
- [ ] `npm audit --omit=dev` clean or triaged.

## Gotchas

- Never verify a header from the repo. Cloudflare adds, merges and sometimes overrides.
- `.htaccess` directives are inert on Pages: they fail silently, which reads as success.
- A CSP that blocks `googletagmanager.com` silently kills every conversion signal — the pages still
  look fine.
- Zone-level settings (Scrape Shield, AI Crawl Control, cache rules) are the **owner's** to change.
  Document the toggle; never assume it was flipped.
