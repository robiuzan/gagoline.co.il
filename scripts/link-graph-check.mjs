/**
 * link-graph-check.mjs — enforces docs/link-graph.md against the built export.
 *
 * Exists because a single `.slice(0, 12)` in the footer starved eleven city pages down to one inbound
 * link, shipped to production, and stayed there — while the naive orphan check reported nothing wrong.
 *
 * THE DETAIL THAT MATTERS: inbound degree excludes SELF-LINKS. Every inner page's breadcrumb points at
 * itself, so counting those turns a degree-1 page into a "degree-2, fine" page and hides real orphans.
 * That is precisely how /terms/ sat orphaned without anyone noticing.
 *
 * Usage: node scripts/link-graph-check.mjs [outDir]      (default: out)
 */

import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "out";

// Parked by design: noindex, deliberately unlinked until they hold real content (Phase 0).
// /404/ is never linked. Anything else at zero inbound is a defect.
const ALLOWED_ZERO = new Set(["/404/", "/reviews/", "/gallery/", "/blog/"]);
const MIN_DEGREE = 2; // target is 4 (link-graph.md §3); raised as the link mesh lands

// The degree threshold is ADVISORY by default and fatal under --strict. Reason: 11 city pages sit at
// degree 1 today because of Footer.tsx's cities.slice(0, 12), which is a known open defect with a
// one-line fix. A gate that is red the day it lands trains everyone to ignore it. Orphans, missing
// trailing slashes and bad BreadcrumbList items are fatal immediately — those are all green now.
// Flip CI to --strict in the same commit that deletes the slice.
const STRICT = process.argv.includes("--strict");

if (!fs.existsSync(OUT)) {
  console.error(
    `link-graph-check: '${OUT}' does not exist — run \`npm run build\` first.`,
  );
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
        html: fs.readFileSync(p, "utf8"),
      });
    }
  }
  return acc;
}

const all = pages();
const routes = new Set(all.map((p) => p.route));

/** route -> Set of routes linking TO it, excluding itself. */
const inbound = new Map([...routes].map((r) => [r, new Set()]));
for (const p of all) {
  const targets = new Set(
    [...p.html.matchAll(/href="(\/[^"]*)"/g)]
      .map((m) => m[1])
      .filter((h) => !h.startsWith("/_next")),
  );
  for (const t of targets) {
    if (t === p.route) continue; // self-link: never counts
    if (inbound.has(t)) inbound.get(t).add(p.route);
  }
}

const degree = (r) => inbound.get(r).size;
const sorted = [...routes].sort((a, b) => degree(a) - degree(b));

console.log(`link-graph-check: ${all.length} routes\n`);
console.log("  lowest inbound degree (self-links excluded):");
for (const r of sorted.slice(0, 8))
  console.log(`    ${String(degree(r)).padStart(3)}  ${r}`);
console.log(`    ...`);
console.log(`    ${String(degree(sorted.at(-1))).padStart(3)}  ${sorted.at(-1)}\n`);

const failures = [];

const orphans = sorted.filter((r) => degree(r) === 0 && !ALLOWED_ZERO.has(r));
if (orphans.length) {
  failures.push([
    "routes with ZERO inbound internal links",
    orphans,
    "a sitemapped URL nothing links to is the textbook abandoned-page signal",
  ]);
}

const shallow = sorted.filter(
  (r) => !ALLOWED_ZERO.has(r) && degree(r) > 0 && degree(r) < MIN_DEGREE,
);
if (shallow.length) {
  const entry = [
    `routes below the minimum inbound degree of ${MIN_DEGREE}`,
    shallow.map((r) => `${r} (${degree(r)})`),
    "link-graph.md §3 — target is 4. Root cause today: Footer.tsx cities.slice(0, 12)",
  ];
  if (STRICT) {
    failures.push(entry);
  } else {
    console.log(
      `  WARN  ${entry[0]} (${shallow.length}) — advisory; re-run with --strict to enforce`,
    );
    console.log(`        ${entry[2]}
`);
  }
}

// A route reachable only from sitewide boilerplate is linked but related to nothing. Informational
// until the contextual-link work lands, then worth promoting to a failure.
const boilerplateOnly = [...routes].filter((r) => {
  if (ALLOWED_ZERO.has(r)) return false;
  const from = inbound.get(r);
  return from.size > 0 && from.size === all.length - 1;
});
if (boilerplateOnly.length) {
  console.log(
    `  note: ${boilerplateOnly.length} route(s) are linked from every page (footer boilerplate) and ` +
      `from nothing contextual.\n`,
  );
}

const slashless = all.flatMap((p) =>
  [...p.html.matchAll(/href="(\/[^"]*)"/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith("/_next") && !h.endsWith("/") && !h.includes("."))
    .map((h) => `${p.route} -> ${h}`),
);
if (slashless.length) {
  failures.push([
    "internal hrefs missing a trailing slash",
    slashless,
    "breadcrumbJsonLd builds item URLs without normalising — this breaks @id matching",
  ]);
}

// BreadcrumbList item URLs must match canonicals byte for byte.
const badItems = all.flatMap((p) =>
  [...p.html.matchAll(/"item":\s*"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.endsWith("/"))
    .map((u) => `${p.route} -> ${u}`),
);
if (badItems.length) {
  failures.push([
    "BreadcrumbList item URLs missing a trailing slash",
    badItems,
    "docs/schema-graph.md §1 — @id must equal the canonical byte for byte",
  ]);
}

if (failures.length) {
  console.error(`link-graph-check: ${failures.length} check(s) FAILED\n`);
  for (const [label, offenders, hint] of failures) {
    console.error(`  ✗ ${label} (${offenders.length})`);
    if (hint) console.error(`    ${hint}`);
    for (const o of offenders.slice(0, 25)) console.error(`      ${o}`);
    if (offenders.length > 25) console.error(`      … and ${offenders.length - 25} more`);
    console.error("");
  }
  process.exit(1);
}

console.log("link-graph-check: all checks passed.");
