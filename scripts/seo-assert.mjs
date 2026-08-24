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
 * Usage: node scripts/seo-assert.mjs [outDir]      (default: out)
 */

import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "out";
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
      acc.push({
        route: p
          .slice(OUT.length)
          .replace(/index\.html$/, "")
          .replace(/\\/g, "/"),
        file: p,
        html: fs.readFileSync(p, "utf8"),
      });
    }
  }
  return acc;
}

const titleOf = (html) => /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
const failures = [];

function check(label, offenders, hint) {
  const list = [...offenders];
  if (list.length) failures.push({ label, offenders: list, hint });
  console.log(
    `  ${list.length ? "FAIL" : "ok  "}  ${label}${list.length ? `  (${list.length})` : ""}`,
  );
}

const all = pages();
// / and /404/ legitimately share a <title>, so uniqueness is asserted over content routes only.
const content = all.filter((p) => p.route !== "/404/");
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
  "every page has a self-referencing canonical ending in /",
  content
    .filter((p) => {
      const c = /<link rel="canonical" href="([^"]*)"/.exec(p.html)?.[1];
      return !c || !c.endsWith("/");
    })
    .map((p) => p.route),
  "canonical must be byte-identical to the sitemap <loc>, trailing slash included",
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
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, "utf8");
  const locs = new Set(
    [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) =>
      m[1].replace(/^https?:\/\/[^/]+/, ""),
    ),
  );
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
