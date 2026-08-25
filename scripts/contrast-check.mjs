/**
 * contrast-check.mjs — keeps the published accessibility statement true.
 *
 * WHY THIS EXISTS. /accessibility/ publishes a conformance statement under ת״י 5568 that says, in
 * so many words, "ניגודיות צבעים תקינה וטקסט קריא". That is a claim about the CSS. When a text
 * colour drifts below 4.5:1 the statement silently becomes false — and unlike a broken link, nobody
 * notices, because the page still looks fine to whoever shipped it.
 *
 * TWO PARTS:
 *   1. The calculator is validated against known values on every run (black-on-white must be
 *      exactly 21.00, #767676-on-white 4.54). This is not ceremony. The first version of this
 *      function omitted `lin()` on the blue channel, which reported dark navy as 3.40:1 on white
 *      and orange as 16.52:1 — confidently backwards. A contrast checker that is wrong is worse
 *      than none, because it launders a guess into a number.
 *   2. A denylist of text-colour classes measured to fail, asserted absent from the built HTML.
 *
 * WHY A DENYLIST rather than solving the general problem. Deciding whether a given class is text,
 * a decorative icon, or a border requires understanding the DOM the way a browser does; a naive
 * scan flags every `aria-hidden` chevron and gets switched off within a week. The denylist encodes
 * the specific pairs someone measured and fixed, so it cannot produce a false positive and cannot
 * be ignored. Add a row when you measure a new failure. It is a ratchet, not an audit — a real
 * audit still needs a browser (see the `responsive-accessibility` skill).
 */

import fs from "node:fs";
import path from "node:path";

const OUT = process.argv.slice(2).find((a) => !a.startsWith("-")) ?? "out";

const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  );
};
export const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ---- 1. self-test -----------------------------------------------------------------------------
const SELF_TEST = [
  ["#000000", "#ffffff", 21.0],
  ["#ffffff", "#ffffff", 1.0],
  ["#767676", "#ffffff", 4.54],
];
for (const [fg, bg, expected] of SELF_TEST) {
  const got = ratio(fg, bg);
  if (Math.abs(got - expected) > 0.01) {
    console.error(
      `contrast-check: SELF-TEST FAILED — ratio(${fg}, ${bg}) = ${got.toFixed(2)}, expected ${expected}.\n` +
        `  The calculator is broken; every number it prints is untrustworthy. Fix it before trusting a pass.`,
    );
    process.exit(1);
  }
}

// ---- 2. denylist ------------------------------------------------------------------------------
// Measured against app/globals.css @theme on 2026-08-25. Ratios are foreground-on-white.
const BANNED = [
  {
    cls: "text-accent-600",
    ratio: 3.41,
    use: "accent-600 #d86e0c",
    fix: "text-accent-700 (5.12:1)",
  },
  {
    cls: "hover:text-accent-600",
    ratio: 3.41,
    use: "accent-600 on hover",
    fix: "hover:text-accent-700",
  },
  {
    // Bare `text-secondary` only — `text-secondary-600` and darker pass and must not match.
    cls: "text-secondary",
    exact: true,
    ratio: 3.56,
    use: "secondary #1f8fd0",
    fix: "text-secondary-600 (5.47:1)",
  },
  {
    cls: "hover:text-secondary",
    exact: true,
    ratio: 3.56,
    use: "secondary on hover",
    fix: "hover:text-secondary-600",
  },
];

// Decorative icons are exempt from SC 1.4.3 and legitimately carry these classes, so the scan
// looks only at class attributes on elements that are NOT aria-hidden. Anything inside an
// aria-hidden subtree is invisible to assistive tech and has no text-contrast requirement.
const stripAriaHidden = (html) =>
  html
    .replace(/<(\w+)[^>]*aria-hidden[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*aria-hidden[^>]*\/?>/gi, " ");

function pages(dir = OUT, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, acc);
    else if (e.name === "index.html") acc.push(p);
  }
  return acc;
}

if (!fs.existsSync(OUT)) {
  console.error(`contrast-check: '${OUT}' does not exist — run \`npm run build\` first.`);
  process.exit(1);
}

const failures = [];
for (const file of pages()) {
  const route = file
    .slice(OUT.length)
    .replace(/index\.html$/, "")
    .split(path.sep)
    .join("/");
  const html = stripAriaHidden(fs.readFileSync(file, "utf8"));
  for (const b of BANNED) {
    // Class names are whitespace- or quote-delimited; `exact` forbids a trailing `-600` suffix.
    const tail = b.exact ? "(?![-\\w])" : "";
    const re = new RegExp(`(?:class|className)="[^"]*(?<![-\\w])${b.cls}${tail}`, "g");
    if (re.test(html)) failures.push({ route, ...b });
  }
}

console.log(
  `contrast-check: ${pages().length} pages, ${BANNED.length} banned text colours`,
);

if (failures.length) {
  console.error(
    `\ncontrast-check: FAILED — ${failures.length} use(s) of text below 4.5:1\n`,
  );
  const seen = new Set();
  for (const f of failures) {
    const key = `${f.cls}|${f.route}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.error(`  ✗ ${f.cls}  (${f.use} = ${f.ratio}:1 on white)  in ${f.route}`);
    console.error(`    use ${f.fix}`);
  }
  console.error(
    `\n  /accessibility/ publishes a ת״י 5568 conformance statement claiming readable contrast.` +
      `\n  Shipping this makes that statement false.\n`,
  );
  process.exit(1);
}

console.log("contrast-check: no banned text colours in the export.");
