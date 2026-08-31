/**
 * font-preload.mjs — injects the font preload links that next/font marked but never emitted.
 *
 * THE DEFECT
 *
 * `next/font/google` self-hosts Heebo and Rubik correctly: 11 woff2 files land in
 * `out/_next/static/media/`, and Next even flags four of them preloadable by naming them `-s.p.woff2`.
 * But **not one `<link rel="preload" as="font">` reaches the HTML.** Measured across every page of the
 * export: zero. The browser therefore cannot discover a font until it has downloaded and parsed the
 * stylesheet — a two-hop critical path for the typeface every heading on the site is set in.
 *
 * WHY IT COSTS MORE HERE THAN USUAL
 *
 * Both faces use `font-display: swap`, and the built CSS contains **no metric-adjusted fallback**
 * (no `Heebo Fallback` / `Rubik Fallback` @font-face). So the first paint uses a generic system
 * stack whose metrics do not match, and the swap moves text. That is layout shift, not merely a
 * flash — which makes this a CLS defect with an LCP component, rather than a cosmetic one.
 *
 * WHY ONLY TWO OF THE FOUR
 *
 * Next marks the Hebrew AND Latin subsets of both families as preloadable — 86 KB together. This
 * site renders Hebrew; the Latin subsets exist for the phone number, the email and price digits,
 * none of which are the LCP element and all of which can afford to arrive late. Preloading only the
 * two Hebrew faces puts 21 KB on the critical path instead of 86 KB. Preloading everything would be
 * the naive fix and a net loss.
 *
 * Idempotent: re-running against an already-processed export changes nothing.
 *
 * Usage: node scripts/font-preload.mjs [outDir]      (default: out)
 */

import fs from "node:fs";
import path from "node:path";

const OUT = process.argv.slice(2).find((a) => !a.startsWith("-")) ?? "out";

if (!fs.existsSync(OUT)) {
  console.error(`font-preload: '${OUT}' does not exist — run \`npm run build\` first.`);
  process.exit(1);
}

/** The Hebrew block in a @font-face unicode-range. Its presence is what identifies the subset. */
const HEBREW_RANGE = "u+0590-05ff";

function builtCss() {
  const dir = path.join(OUT, "_next", "static", "css");
  if (!fs.existsSync(dir)) return "";
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => fs.readFileSync(path.join(dir, f), "utf8"))
    .join("\n");
}

/** Pull the Hebrew, preload-marked (`.p.woff2`) src URL out of every @font-face block. */
function hebrewFontUrls(css) {
  const urls = new Set();
  for (const block of css.matchAll(/@font-face\{([^}]*)\}/g)) {
    const body = block[1];
    if (!body.includes(HEBREW_RANGE)) continue;
    const src = /src:url\(([^)]+)\)/.exec(body)?.[1];
    // `.p.` is Next's own marker for "this file is worth preloading".
    if (src && src.includes(".p.woff2")) urls.add(src);
  }
  return [...urls];
}

function htmlFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const css = builtCss();
const urls = hebrewFontUrls(css);

if (urls.length === 0) {
  console.error(
    "font-preload: found no Hebrew preload-marked font in the built CSS.\n" +
      "  Either the font pipeline changed or the subsets did. This script is now a no-op\n" +
      "  pretending to be a fix, which is worse than not having it — investigate before shipping.",
  );
  process.exit(1);
}

// `crossorigin` is REQUIRED on a font preload even for same-origin files: fonts are fetched in
// CORS mode, and a preload without it is a second, wasted request rather than a reused one.
const links = urls
  .map(
    (u) =>
      `<link rel="preload" href="${u}" as="font" type="font/woff2" crossorigin="anonymous"/>`,
  )
  .join("");

const pages = htmlFiles(OUT);
let injected = 0;
let already = 0;

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  if (html.includes('as="font"')) {
    already++;
    continue;
  }
  const at = html.indexOf("<head>");
  if (at === -1) continue;
  // Immediately after <head> so the preload is discovered before the stylesheet link.
  const next = html.slice(0, at + 6) + links + html.slice(at + 6);
  fs.writeFileSync(file, next);
  injected++;
}

const total = urls.reduce((n, u) => {
  const f = path.join(OUT, u.replace(/^\//, ""));
  return n + (fs.existsSync(f) ? fs.statSync(f).size : 0);
}, 0);

console.log(
  `font-preload: ${urls.length} Hebrew face(s), ${(total / 1024).toFixed(1)} KB total`,
);
for (const u of urls) console.log(`  ${u}`);
console.log(
  `font-preload: injected into ${injected} page(s)` +
    (already ? `, ${already} already had links` : ""),
);
