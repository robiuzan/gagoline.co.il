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

// Positional arg only — flags must not be mistaken for the output directory.
const OUT = process.argv.slice(2).find((a) => !a.startsWith("-")) ?? "out";

// Parked by design: noindex, deliberately unlinked until they hold real content (Phase 0).
// /404/ is never linked. Anything else at zero inbound is a defect.
//
// /blog/ was REMOVED from this set on 2026-08-24, and removing it is the whole lesson. It was
// parked here while it was a noindexed stub, and shipping seven real articles did not take it out —
// so every reachability check silently skipped the hub. That is how /blog/ went live linked from
// nothing but its own articles, with a green gate. An exemption added for a temporary state
// outlives the state unless removing it is part of the same commit that ends the state.
const ALLOWED_ZERO = new Set(["/404/", "/reviews/", "/gallery/"]);
const MIN_DEGREE = 4; // link-graph.md §3. Met since the footer slice was removed 2026-08-24.

// The degree threshold is fatal under --strict, which is now the default (see package.json).
// It was advisory for exactly one commit, while Footer.tsx's cities.slice(0, 12) still starved 11
// city pages down to a single inbound link. That slice is gone, every route now sits at 43, and the
// gate enforces the real floor. Do not lower MIN_DEGREE to make a failure pass — the failure means
// a route has been cut out of the mesh.
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
    "link-graph.md §3 — target is 4",
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

// CONTEXTUAL degree — links from a page's body, with the sitewide header and footer stripped.
//
// This replaces a check that could never fire. The old version flagged a route when its inbound set
// equalled every other page, reasoning that "linked from everything" meant "linked from boilerplate
// only". But the footer links every route, so that condition is true for every route permanently —
// it stayed true after the contextual links actually landed, and promoting it to a failure (as its
// own comment suggested) would have failed all 41 routes forever. It measured link presence and
// called it link context.
//
// A route with zero contextual inbound links is reachable but unrelated: nothing on the site says
// why it exists. That is what "orphan" means once a footer guarantees everything is reachable.
const stripChrome = (html) =>
  html
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ");

const contextual = new Map([...routes].map((r) => [r, new Set()]));
for (const p of all) {
  const body = stripChrome(p.html);
  for (const m of body.matchAll(/href="(\/[^"]*)"/g)) {
    const t = m[1];
    if (t === p.route || t.startsWith("/_next")) continue;
    if (contextual.has(t)) contextual.get(t).add(p.route);
  }
}

// Legal and conformance pages belong in the footer and nowhere else. A contextual link to /terms/
// from a service page would be filler, not context. They are exempt from the contextual floor —
// but NOT from the plain inbound floor above, which is what caught /terms/ when it was truly
// orphaned. /about/ and /pricing/ are deliberately not here: they are commercial pages, and a site
// whose own copy never has cause to mention its pricing or its own story has a content problem.
const CONTEXT_EXEMPT = new Set(["/privacy/", "/terms/", "/accessibility/"]);

const ctxDegree = (r) => contextual.get(r).size;
const noContext = [...routes]
  .filter((r) => !ALLOWED_ZERO.has(r) && !CONTEXT_EXEMPT.has(r) && ctxDegree(r) === 0)
  .sort();

console.log("  contextual inbound degree (header/footer stripped):");
for (const r of [...routes].sort((a, b) => ctxDegree(a) - ctxDegree(b)).slice(0, 5))
  console.log(`    ${String(ctxDegree(r)).padStart(3)}  ${r}`);
console.log("");

if (noContext.length) {
  const entry = [
    "routes with no CONTEXTUAL inbound link (only header/footer boilerplate)",
    noContext,
    "reachable but unrelated — nothing in any page body explains why the route exists",
  ];
  if (STRICT) {
    failures.push(entry);
  } else {
    console.log(
      `  WARN  ${entry[0]} (${noContext.length}) — advisory without --strict\n`,
    );
  }
}

/**
 * A route linked ONLY by pages inside its own subtree is unreachable in practice.
 *
 * This check exists because /blog/ shipped exactly that way and everything above passed it. Its
 * seven articles each linked back with "לכל המדריכים", so plain inbound degree was 7 — comfortably
 * over the floor — and every article had contextual inbound links from service and city pages. But
 * nothing in the header, the footer or any top-level page pointed at /blog/ itself. The only way to
 * reach the hub was to already be inside it. The user found it in about a minute; the gate never
 * would have.
 *
 * The rule: every route needs at least one inbound link from OUTSIDE its own path prefix. Parent
 * and children linking to each other is a closed loop, not reachability.
 */
const outsideSubtree = [...routes].filter((r) => {
  if (ALLOWED_ZERO.has(r) || r === "/") return false;
  return ![...inbound.get(r)].some((from) => !from.startsWith(r));
});
if (outsideSubtree.length) {
  failures.push([
    "routes linked ONLY from inside their own subtree",
    outsideSubtree.map((r) => `${r} (all ${degree(r)} inbound links are descendants)`),
    "a hub reachable only from its own children cannot be found by anyone not already in it",
  ]);
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
