/**
 * seo-assert.mjs — assertions on the built export, run after `next build`.
 *
 * The measured baseline in docs/optimization-backlog.md is genuinely good (44/44 canonicals, 44/44
 * single-h1, unique titles) and is the thing most likely to be lost during the content push, because
 * every planned change touches metadata or routing. These checks are the ratchet.
 *
 * Two of them exist because the defect actually shipped:
 *   - the placeholder-marker check, which builds the pattern from a CODEPOINT. A literal '🔶' in a
 *     shell grep matches nothing under some locales, so the naive gate reported clean while ten pages
 *     were failing — including inside the FAQPage JSON-LD.
 *   - the doubled-brand check, which was live on /about/ until 2026-08-17.
 *
 * Runs in postbuild, so a failure stops ops/deploy-site.ps1 (its `npm run build` must exit 0).
 *
 * Usage: node scripts/seo-assert.mjs [outDir]      (default: out; the origin comes from
 *        ../site.config.json, relative to this script)
 */

import fs from "node:fs";
import path from "node:path";

// Positional arg only — flags must not be mistaken for the output directory.
const OUT = process.argv.slice(2).find((a) => !a.startsWith("-")) ?? "out";
const BRAND = "גגוליין";
const MARKER = "\u{1F536}";

if (!fs.existsSync(OUT)) {
  console.error(`seo-assert: '${OUT}' does not exist — run \`npm run build\` first.`);
  process.exit(1);
}

function pages(dir = OUT, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, acc);
    else if (e.name === "index.html") {
      // path.relative, not a slice: "out/", "./out" or an absolute outDir all give the same route.
      const rel = path.relative(OUT, dir).split(path.sep).join("/");
      acc.push({
        route: rel ? `/${rel}/` : "/",
        file: p,
        html: fs.readFileSync(p, "utf8"),
      });
    }
  }
  return acc;
}

const titleOf = (html) => /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
const failures = [];

/**
 * The one origin every canonical and sitemap <loc> must carry, read from the synced manifest
 * rather than typed here — so a roster change that moves the site to `www.` or `http://` fails
 * the manifest check below instead of quietly re-pointing 50 canonicals.
 */
const manifest = JSON.parse(
  fs
    .readFileSync(new URL("../site.config.json", import.meta.url), "utf8")
    .replace(/^/, ""),
);
const ORIGIN = String(manifest.url).replace(/\/+$/, "");

// \s, not \b, before the attribute names: "-" is a word boundary, so \b would read data-href.
const canonicalsOf = (html) =>
  [...html.matchAll(/<link\b[^>]*\srel="canonical"[^>]*>/g)].map((m) => ({
    at: m.index,
    href: /\shref="([^"]*)"/.exec(m[0])?.[1] ?? "",
  }));

/** Folder names are written decoded, hrefs percent-encoded — compare them decoded. */
const decoded = (u) => {
  try {
    return decodeURI(u);
  } catch {
    return u;
  }
};

/**
 * Google reads rel=canonical only inside <head>, and the parser closes <head> at the first thing
 * that is not allowed there — an <iframe>, an <img>, a <div>, stray text, or a <noscript> holding
 * any of those (the GTM iframe is why app/layout.tsx keeps its <noscript> in <body>). A canonical
 * after that point is emitted but lands in <body>, where it is ignored. Returns the offender, or null.
 */
const HEAD_OK = new Set([
  "base",
  "link",
  "meta",
  "noscript",
  "script",
  "style",
  "template",
  "title",
]);
function headBreakerBefore(html, pos) {
  const open = /<head\b[^>]*>/i.exec(html);
  if (!open) return "no <head>";
  if (pos < open.index) return "canonical before <head>";
  // One left-to-right pass, so a "<!--" inside a script cannot swallow the script's end tag.
  const head = html
    .slice(open.index + open[0].length, pos)
    .replace(
      /<!--[\s\S]*?-->|<(script|style|title|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      "",
    );
  if (/<body\b/i.test(head)) return "canonical is inside <body>";
  for (const [, inner] of head.matchAll(/<noscript\b[^>]*>([\s\S]*?)<\/noscript\s*>/gi)) {
    const bad = /<(?!(?:link|meta|style)\b)([a-zA-Z][\w-]*)/i.exec(inner);
    if (bad) return `<noscript> holding <${bad[1]}>`;
    if (inner.replace(/<[^>]*>/g, "").trim()) return "<noscript> holding text";
  }
  const rest = head.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, "");
  for (const [, tag] of rest.matchAll(/<([a-zA-Z][\w-]*)/g)) {
    if (!HEAD_OK.has(tag.toLowerCase())) return `<${tag}>`;
  }
  const text = rest.replace(/<[^>]*>/g, "").trim();
  return text ? `text "${text.slice(0, 30)}"` : null;
}

function check(label, offenders, hint) {
  const list = [...offenders];
  if (list.length) failures.push({ label, offenders: list, hint });
  console.log(
    `  ${list.length ? "FAIL" : "ok  "}  ${label}${list.length ? `  (${list.length})` : ""}`,
  );
}

const all = pages();
/**
 * The not-found page (/404/, plus /_not-found/ once Next 15+ exports it) is not a content route: it
 * legitimately shares the homepage's <title>, and it inherits the root canonical "/" — harmless,
 * because it is served with a 404 status and /404/ itself is noindexed. Content checks skip it.
 */
const NOT_FOUND = new Set(["/404/", "/_not-found/"]);
const content = all.filter((p) => !NOT_FOUND.has(p.route));
console.log(`seo-assert: ${all.length} emitted routes in ${OUT}/\n`);

check(
  "no placeholder marker in any page",
  all.filter((p) => p.html.includes(MARKER)).map((p) => p.route),
  "an internal editorial marker is rendering to visitors — docs/business-facts.md §A",
);

check(
  "brand appears at most once per <title>",
  content
    .map((p) => [p.route, titleOf(p.html)])
    .filter(([, t]) => t.split(BRAND).length - 1 > 1)
    .map(([r, t]) => `${r} -> ${t}`),
  `write the bare subject; the root template already appends "| ${BRAND}"`,
);

const byTitle = new Map();
for (const p of content) {
  const t = titleOf(p.html);
  byTitle.set(t, [...(byTitle.get(t) ?? []), p.route]);
}
check(
  "every <title> is unique",
  [...byTitle.entries()]
    .filter(([, r]) => r.length > 1)
    .map(([t, r]) => `${t} <- ${r.join(", ")}`),
  "two routes competing for the same query means Google picks, and usually not the one you want",
);

check(
  "exactly one <h1> per page",
  all
    .map((p) => [p.route, (p.html.match(/<h1[\s>]/g) ?? []).length])
    .filter(([, n]) => n !== 1)
    .map(([r, n]) => `${r} has ${n}`),
  "",
);

check(
  "manifest url is https on the bare domain",
  manifest.url === `https://${manifest.domain}` && !/^www\./i.test(manifest.domain)
    ? []
    : [`url ${manifest.url} · domain ${manifest.domain}`],
  "fix the roster and re-sync — site.config.json is a synced copy (CLAUDE.md §2 rule 3)",
);

/**
 * The exact URL, not just presence. The previous version of this check passed any canonical that
 * ended in "/", so every page claiming to be the homepage (the skyshade regression noted in
 * app/layout.tsx), a www. or http:// canonical, or a duplicate tag would all have shipped green.
 * Compared decoded, so a Hebrew slug passes here; the byte-exact match is the <loc> check below.
 */
check(
  "every page has exactly one canonical, and it is its own https://, apex, trailing-slash URL",
  content
    .map((p) => [p.route, canonicalsOf(p.html)])
    .filter(
      ([route, cs]) =>
        cs.length !== 1 || decoded(cs[0]?.href ?? "") !== `${ORIGIN}${route}`,
    )
    .map(([route, cs]) => `${route} -> ${cs.map((c) => c.href).join(" + ") || "(none)"}`),
  `expected ${ORIGIN}<route>; every route sets alternates.canonical in its own metadata`,
);

check(
  "every canonical sits in <head>, with nothing before it that would close <head>",
  content
    .map((p) => {
      const c = canonicalsOf(p.html)[0];
      return [p.route, c ? headBreakerBefore(p.html, c.at) : null];
    })
    .filter(([, why]) => why)
    .map(([route, why]) => `${route}: ${why}`),
  "a canonical that the parser places in <body> is ignored by Google",
);

check(
  "no internal href missing its trailing slash",
  all
    .flatMap((p) =>
      [...p.html.matchAll(/href="(\/[^"]*)"/g)]
        .map((m) => m[1])
        .filter((h) => !h.startsWith("/_next") && !h.endsWith("/") && !h.includes("."))
        .map((h) => `${p.route} -> ${h}`),
    )
    .slice(0, 40),
  "trailingSlash: true — and breadcrumbJsonLd does NOT normalise, so this breaks @id matching",
);

// Ratings must never ship without a verifiable public source (docs/schema-graph.md §4).
check(
  "no aggregateRating or Review without a source",
  all
    .filter((p) => /aggregateRating|"@type":\s*"Review"/.test(p.html))
    .map((p) => p.route),
  "an unsourced rating is a Google policy violation — docs/business-facts.md §C",
);

// Sitemap parity: every indexable route in, every noindex route out.
const sitemapPath = path.join(OUT, "sitemap.xml");
check(
  "sitemap.xml is emitted",
  fs.existsSync(sitemapPath) ? [] : [sitemapPath],
  "app/sitemap.ts emits it; without it every sitemap check below is skipped",
);
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, "utf8");
  const fullLocs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].trim());
  const locs = new Set(fullLocs.map((l) => decoded(l.replace(/^https?:\/\/[^/]+/, ""))));
  const noindex = new Set(
    content.filter((p) => /name="robots"[^>]*noindex/.test(p.html)).map((p) => p.route),
  );

  check(
    "no noindexed route is advertised in the sitemap",
    [...noindex].filter((r) => locs.has(r)),
    "a noindex URL in the sitemap sends a contradictory signal",
  );

  check(
    "every indexable route is in the sitemap",
    content
      .filter((p) => !noindex.has(p.route) && !locs.has(p.route))
      .map((p) => p.route),
    "staticPaths in app/sitemap.ts is hand-maintained — backlog §1.3",
  );

  const fullLocSet = new Set(fullLocs);
  check(
    "every indexable canonical is byte-identical to a sitemap <loc>",
    content
      .filter((p) => !noindex.has(p.route))
      .map((p) => [p.route, canonicalsOf(p.html)[0]?.href ?? "(none)"])
      .filter(([, href]) => !fullLocSet.has(href))
      .map(([route, href]) => `${route} -> ${href}`),
    `the sitemap and the canonicals must name the same URL, on ${ORIGIN}`,
  );

  // The other direction: a <loc> on another host or scheme, or for a page the build no longer
  // emits (a pruned city page still mapped by app/sitemap.ts), contradicts the canonicals.
  const indexableCanonicals = new Set(
    content
      .filter((p) => !noindex.has(p.route))
      .map((p) => canonicalsOf(p.html)[0]?.href),
  );
  check(
    "every sitemap <loc> is the canonical of an emitted, indexable page",
    fullLocs.filter((l) => !indexableCanonicals.has(l)),
    "drop the <loc>, or restore the page it names",
  );

  console.log(
    `\n  ${all.length} routes · ${locs.size} sitemap URLs · ${noindex.size} noindexed · ` +
      `${content.length - noindex.size} indexable`,
  );
}

if (failures.length) {
  console.error(`\nseo-assert: ${failures.length} check(s) FAILED\n`);
  for (const f of failures) {
    console.error(`  ✗ ${f.label}`);
    if (f.hint) console.error(`    ${f.hint}`);
    for (const o of f.offenders.slice(0, 25)) console.error(`      ${o}`);
    if (f.offenders.length > 25)
      console.error(`      … and ${f.offenders.length - 25} more`);
    console.error("");
  }
  process.exit(1);
}

console.log("\nseo-assert: all checks passed.");
