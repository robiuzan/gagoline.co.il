/**
 * check-images-out.mjs — the images gate. Runs after `next build` (postbuild, after seo-assert and
 * before keep-previous-assets), in `npm run gate` and in CI, and proves the export carries exactly
 * the images content/images/manifest.json says, and nothing else.
 *
 * WHAT IT ENFORCES (plan §6 "Gate", contract §4):
 *   - the manifest obeys every rule in scripts/images/lib/manifest-rules.mjs — the same module
 *     lib/images.ts throws on, so the two can never disagree about what a valid manifest is;
 *   - every approved file exists in public/ AND out/ with the HEADER dimensions, bytes and sha256
 *     the manifest records (read with lib/imageinfo.mjs, never trusted from the JSON); candidates
 *     only in draft mode; rejected files nowhere; retired files kept ≥ 60 days, except that a
 *     retired entry with `revoked` has every copy gone: full file, thumbnail and phone copy;
 *   - every approved entry has its phone copy on disk, with the manifest's facts, and every figure
 *     offers it to phones through <source media> (a forgotten phone-copies.mjs run fails here);
 *   - every <img> on every page carries numeric width/height and a non-empty alt (unless
 *     aria-hidden); every /images/ reference resolves to a visible manifest entry; no
 *     /images/_candidates/ reference survives a production build (the folder is pruned from out/);
 *   - every file under out/images/ is referenced by the manifest (a stray file is a leak);
 *   - per content page: ≥ gates.minPerContentPage content images (0 until coverage, then 2) and
 *     summed bytes ≤ gates.maxPageImageBytes; out/images/ in total ≤ gates.maxTotalBytes;
 *   - exactly one fetchpriority="high" on an image-bearing page, and it is the FIRST content image
 *     in DOM order (lazy-loading an in-viewport LCP image is the known regression); every other
 *     content image is lazy;
 *   - every rendered alt and figcaption passes the text rules (Hebrew, no claim stems, no city, no
 *     ASCII quote touching Hebrew; first names only in /about/ captions);
 *   - every visible placement renders on its route and every rendered content image is placed
 *     there; no file is shared between two /areas/* pages; excluded routes carry none;
 *   - no /images/ path inside any application/ld+json or og:image — renderings are illustrations,
 *     never evidence;
 *   - the disclosure markers: `data-images-notice="gallery"` on /gallery/ always, `"footer"` on
 *     every page exactly when an approved entry is a rendering, `"about"` on /about/ exactly when
 *     the team figure renders — each with the contract §7 text verbatim.
 *
 * DRAFT MODE (`IMAGES_DRAFT=1`): candidates render from /images/_candidates/, so the candidate
 * assertions are skipped and the export is marked with out/.images-draft AND out/.live-draft, so
 * the hub's deploy-site.ps1 refuses it and keep-previous-assets never archives it.
 *
 * Usage: node scripts/images/check-images-out.mjs [outDir]      (default: out; exit 1 on failure)
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "./lib/imageinfo.mjs";
import {
  EXCLUDED_ROUTES,
  PHONE_MEDIA,
  RETIRED_KEEP_DAYS,
  isVisible,
  manifestProblems,
  phoneSrcOf,
  srcOf,
  textProblems,
  thumbSrcOf,
} from "./lib/manifest-rules.mjs";

process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));

// Positional arg only — flags must not be mistaken for the output directory.
const OUT = process.argv.slice(2).find((a) => !a.startsWith("-")) ?? "out";
const DRAFT = process.env.IMAGES_DRAFT === "1";
const MANIFEST = "content/images/manifest.json";
const PUBLIC = "public";

/** The contract §7 texts, asserted verbatim where their markers render (lib/content.ts imagesNote). */
const NOTICE = {
  gallery:
    "כדי להראות איך נראית כל עבודת איטום גם כשאין צילום מהשטח, חלק מהתמונות באתר הן הדמיות שנוצרו בכלי בינה מלאכותית, בהשתתפות אנשי הצוות שלנו. הן ממחישות שיטות עבודה וחומרים, ואינן תיעוד של עבודה, לקוח או כתובת מסוימים.",
  footer: "חלק מהתמונות באתר הן הדמיות להמחשה — פרטים בגלריה.",
  about:
    "בתמונה: ניסים ושימי מצוות גגוליין. התמונות באתר שבהן הם מופיעים הן הדמיות להמחשת העבודה, לא צילומים מעבודה מסוימת.",
};

if (!fs.existsSync(OUT)) {
  console.error(
    `check-images-out: '${OUT}' does not exist — run \`npm run build\` first.`,
  );
  process.exit(1);
}
if (!fs.existsSync(MANIFEST)) {
  console.error(`check-images-out: ${MANIFEST} is missing.`);
  process.exit(1);
}

const failures = [];
const notes = [];
function check(label, offenders, hint) {
  const list = [...offenders];
  if (list.length) failures.push({ label, offenders: list, hint });
  console.log(
    `  ${list.length ? "FAIL" : "ok  "}  ${label}${list.length ? `  (${list.length})` : ""}`,
  );
}

const isObj = (x) => typeof x === "object" && x !== null && !Array.isArray(x);
const count = (hay, needle) => hay.split(needle).length - 1;
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  String(s ?? "").replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) =>
    e[0] === "#"
      ? String.fromCodePoint(
          e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)),
        )
      : (ENT[e.toLowerCase()] ?? m),
  );
/** Visible text: tags (and React's `<!-- -->` text separators) removed without adding spaces. */
const textOf = (html) =>
  decode(html.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();

// ── inputs ───────────────────────────────────────────────────────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8").replace(/^﻿/, ""));

/**
 * City and service names come from lib/site-config.ts by regex — this script cannot import TS,
 * and typing 23 names here would be a second list that drifts. Zero matches is itself a failure.
 */
const siteConfigTs = fs.readFileSync("lib/site-config.ts", "utf8");
const cities = [
  ...siteConfigTs.matchAll(
    /\{\s*slug:\s*"([a-z0-9-]+)",\s*name:\s*"([^"]+)",\s*region:/g,
  ),
].map((m) => ({ slug: m[1], name: m[2] }));
const services = [
  ...siteConfigTs.matchAll(/\{\s*slug:\s*"([a-z0-9-]+)",\s*name:\s*"([^"]+)"\s*\}/g),
].map((m) => ({ slug: m[1], name: m[2] }));

function pages(dir = OUT, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "_next") pages(p, acc);
    } else if (e.name === "index.html") {
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
const all = pages();
const NOT_CONTENT = new Set([...EXCLUDED_ROUTES, "/_not-found/"]);
const content = all.filter((p) => !NOT_CONTENT.has(p.route));
const contentRoutes = content.map((p) => p.route);

console.log(
  `check-images-out: ${all.length} emitted routes in ${OUT}/, ${content.length} content routes` +
    (DRAFT ? " — IMAGES_DRAFT=1 (candidates render)" : "") +
    "\n",
);

check(
  "city and service names were read from lib/site-config.ts",
  cities.length && services.length
    ? []
    : [
        `cities ${cities.length}, services ${services.length} — the regex no longer matches`,
      ],
  "the gate needs the names to ban them from alt/captions; fix the regex, never hardcode the list",
);

// ── 1. the manifest itself (shared rules) ───────────────────────────────────────────────────
const ctx = {
  contentRoutes,
  cityNames: cities.map((c) => c.name),
  citySlugs: cities.map((c) => c.slug),
  serviceSlugs: services.map((s) => s.slug),
};
check(
  "content/images/manifest.json obeys every rule in scripts/images/lib/manifest-rules.mjs",
  manifestProblems(manifest, ctx),
  "lib/images.ts throws on the same rules — the toolkit writes the manifest, fix it there",
);

const images = Array.isArray(manifest.images) ? manifest.images.filter(isObj) : [];
const gates = isObj(manifest.gates) ? manifest.gates : {};
const visible = images.filter((e) => isVisible(e, DRAFT));
const byId = new Map(images.map((e) => [e.id, e]));
const hasRenderings = images.some(
  (e) =>
    e.status === "approved" &&
    isObj(e.provenance) &&
    e.provenance.kind === "ai-generated",
);

// ── 2. a production export carries no candidate, and no stale draft mark ────────────────────
const candidatesDir = path.join(OUT, "images", "_candidates");
if (!DRAFT) {
  if (fs.existsSync(candidatesDir)) {
    const n = walk(candidatesDir).length;
    fs.rmSync(candidatesDir, { recursive: true, force: true });
    notes.push(
      `pruned ${OUT}/images/_candidates/ (${n} file(s)) — a production export ships no candidate`,
    );
  }
  const mark = path.join(OUT, ".images-draft");
  if (fs.existsSync(mark)) fs.rmSync(mark);
}

// ── 3. files: where each status says, with the manifest's header facts ──────────────────────
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const under = (root, src) => path.join(root, ...String(src).split("/").filter(Boolean));
const fileProblems = [];
const revokedProblems = [];
function expectFile(label, src, want) {
  for (const file of [under(PUBLIC, src), under(OUT, src)]) {
    if (!fs.existsSync(file)) {
      fileProblems.push(`${label}: ${file} is missing`);
      continue;
    }
    const bytes = fs.readFileSync(file);
    let info;
    try {
      info = inspect(bytes);
    } catch (err) {
      fileProblems.push(`${label}: ${file}: ${err.message}`);
      continue;
    }
    if (info.width !== want.width || info.height !== want.height)
      fileProblems.push(
        `${label}: ${file} is ${info.width}×${info.height}, the manifest says ${want.width}×${want.height}`,
      );
    if (Number.isInteger(want.bytes) && bytes.length !== want.bytes)
      fileProblems.push(
        `${label}: ${file} is ${bytes.length} bytes, the manifest says ${want.bytes}`,
      );
    if (typeof want.sha256 === "string") {
      const sha = crypto.createHash("sha256").update(bytes).digest("hex");
      if (sha !== want.sha256)
        fileProblems.push(`${label}: ${file} sha256 differs from the manifest`);
    }
  }
}
const exists = (src) =>
  fs.existsSync(under(PUBLIC, src)) || fs.existsSync(under(OUT, src));
const now = Date.now();
for (const e of images) {
  const approvedSrc = `/images/${e.file}`;
  const candidateSrc = `/images/_candidates/${e.file}`;
  switch (e.status) {
    case "approved":
      expectFile(e.id, srcOf(e), e);
      if (isObj(e.thumb)) expectFile(`${e.id} thumb`, thumbSrcOf(e), e.thumb);
      if (isObj(e.phone)) expectFile(`${e.id} phone`, phoneSrcOf(e), e.phone);
      else
        fileProblems.push(
          `${e.id}: approved but has no phone copy — run node page-images/tools/phone-copies.mjs --site gagoline in Media Studio`,
        );
      break;
    case "candidate":
      if (DRAFT) {
        expectFile(e.id, candidateSrc, e);
        if (isObj(e.thumb))
          expectFile(`${e.id} thumb`, `/images/_candidates/${e.thumb.file}`, e.thumb);
      }
      if (fs.existsSync(under(PUBLIC, approvedSrc)))
        fileProblems.push(
          `${e.id}: a candidate must not sit in public/images/ (found ${approvedSrc})`,
        );
      break;
    case "rejected":
      for (const src of [approvedSrc, candidateSrc])
        if (exists(src)) fileProblems.push(`${e.id}: rejected, but ${src} still exists`);
      break;
    case "retired": {
      // Withdrawn consent: the 14-day promise to the person beats the 60-day keep (CLAUDE.md §14).
      if (e.revoked) {
        for (const f of [
          e.file,
          isObj(e.thumb) ? e.thumb.file : null,
          isObj(e.phone) ? e.phone.file : null,
        ].filter(Boolean))
          for (const src of [`/images/${f}`, `/images/_candidates/${f}`])
            for (const root of [PUBLIC, OUT])
              if (fs.existsSync(under(root, src)))
                revokedProblems.push(
                  `${e.id}: revoked ${e.revoked}, but ${under(root, src)} exists`,
                );
        break;
      }
      const days = Math.floor((now - Date.parse(e.retired)) / 864e5);
      // The full file, its thumbnail and its phone copy all keep their URLs for the same 60 days.
      const gone = [
        e.file,
        isObj(e.thumb) ? e.thumb.file : null,
        isObj(e.phone) ? e.phone.file : null,
      ]
        .filter(Boolean)
        .map((f) => `/images/${f}`)
        .filter(
          (src) => !fs.existsSync(under(PUBLIC, src)) || !fs.existsSync(under(OUT, src)),
        );
      if (days < RETIRED_KEEP_DAYS)
        for (const src of gone)
          fileProblems.push(
            `${e.id}: retired ${days} day(s) ago but ${src} is gone — the file stays ≥ ${RETIRED_KEEP_DAYS} days`,
          );
      if (days >= RETIRED_KEEP_DAYS && !gone.length)
        notes.push(
          `${e.id}: retired ${days} days ago — its files, thumbnail and phone copy included, may now be removed in one commit`,
        );
      break;
    }
    default:
      break;
  }
}
check(
  "every manifest file is where its status says, with the manifest's dimensions, bytes and sha256",
  fileProblems,
  "approved → public/images/<file> (legacySrc for the supplied originals); candidate → _candidates/ in draft mode only; rejected → nowhere; retired → kept 60 days",
);
check(
  "a revoked entry has no file left: full file, thumbnail and phone copy",
  revokedProblems,
  "the person was promised removal within 14 days; every copy carries the same face",
);

// ── 4. nothing under out/images/ that the manifest does not vouch for ───────────────────────
const allowed = new Set();
for (const e of images) {
  const files = [
    e.file,
    isObj(e.thumb) ? e.thumb.file : null,
    isObj(e.phone) ? e.phone.file : null,
  ].filter(Boolean);
  if (e.status === "approved" && !e.legacySrc)
    for (const f of files) allowed.add(`/images/${f}`);
  if (e.status === "retired" && !e.revoked)
    for (const f of files) allowed.add(`/images/${f}`);
  if (DRAFT && e.status === "candidate")
    for (const f of files) allowed.add(`/images/_candidates/${f}`);
}
const imagesDir = path.join(OUT, "images");
const shipped = fs.existsSync(imagesDir)
  ? walk(imagesDir).map((f) => "/" + path.relative(OUT, f).split(path.sep).join("/"))
  : [];
check(
  "every file under out/images/ is an approved (or ≤60-day retired) manifest entry",
  shipped.filter((s) => !allowed.has(s)),
  "a file nothing references is a leak — add it to the manifest through the toolkit, or delete it",
);
const totalBytes = shipped.reduce((n, s) => n + fs.statSync(under(OUT, s)).size, 0);
check(
  `out/images/ totals ≤ ${(gates.maxTotalBytes / 1048576).toFixed(0)} MB`,
  totalBytes <= gates.maxTotalBytes ? [] : [`${(totalBytes / 1048576).toFixed(1)} MB`],
  "retire and remove old files, or re-encode — the export is uploaded whole on every deploy",
);

// ── 5. every page ───────────────────────────────────────────────────────────────────────────
const srcToEntry = new Map();
for (const e of visible) {
  srcToEntry.set(srcOf(e), { entry: e, thumb: false });
  const t = thumbSrcOf(e);
  if (t) srcToEntry.set(t, { entry: e, thumb: true });
}
/** A thumbnail on /blog/ is derived from the guide's own `lead`, so it is placed by that lead. */
const placedOn = ({ entry, thumb }, route) =>
  entry.placements.some((pl) => pl.route === route) ||
  (thumb && route === "/blog/" && entry.placements.some((pl) => pl.slot === "lead"));
const stripSlot = (slot) => /^(strip|pair)-\d$/.test(slot);

const phoneToEntry = new Map(
  visible.filter((e) => isObj(e.phone)).map((e) => [phoneSrcOf(e), e]),
);
const IMG_RE = /<img\b[^>]*>/gi;
const SOURCE_RE = /<source\b[^>]*>/gi;
const attrsOf = (tag) => {
  const o = {};
  for (const m of tag.matchAll(/\s([a-zA-Z][\w-]*)(?:="([^"]*)")?/g))
    o[m[1].toLowerCase()] = m[2] ?? "";
  return o;
};

const problems = {
  attrs: [],
  candidate: [],
  unknown: [],
  excluded: [],
  min: [],
  pageBytes: [],
  priority: [],
  text: [],
  figure: [],
  placement: [],
  schema: [],
  notice: [],
  phone: [],
};
const cityShare = new Map();
const coverage = [];
const aboutTeamShown = visible.some((e) =>
  e.placements.some((pl) => pl.route === "/about/" && pl.slot === "team"),
);

for (const p of all) {
  const imgs = [...p.html.matchAll(IMG_RE)].map((m) => ({
    at: m.index,
    a: attrsOf(m[0]),
  }));
  for (const i of imgs) {
    const hidden = "aria-hidden" in i.a && i.a["aria-hidden"] !== "false";
    if (!/^\d+$/.test(i.a.width ?? "") || !/^\d+$/.test(i.a.height ?? ""))
      problems.attrs.push(
        `${p.route}: <img src="${i.a.src}"> without numeric width/height`,
      );
    if (!hidden && !decode(i.a.alt ?? "").trim())
      problems.attrs.push(`${p.route}: <img src="${i.a.src}"> without alt`);
    if (/^\/images\//.test(i.a.src ?? "") && !srcToEntry.has(i.a.src))
      problems.unknown.push(`${p.route}: ${i.a.src}`);
  }
  if (!DRAFT && p.html.includes("/images/_candidates/")) problems.candidate.push(p.route);

  for (const m of p.html.matchAll(SOURCE_RE)) {
    const a = attrsOf(m[0]);
    if (!/^\/images\//.test(a.srcset ?? "")) continue;
    if (!phoneToEntry.has(a.srcset))
      problems.phone.push(
        `${p.route}: <source> names ${a.srcset}, not a visible phone copy`,
      );
    if (a.media !== PHONE_MEDIA)
      problems.phone.push(
        `${p.route}: ${a.srcset} has media="${a.media}", not ${PHONE_MEDIA}`,
      );
  }

  for (const m of p.html.matchAll(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  ))
    if (m[1].includes("/images/"))
      problems.schema.push(`${p.route}: JSON-LD names an /images/ path`);
  for (const m of p.html.matchAll(/<meta\b[^>]*property="og:image[^"]*"[^>]*>/gi))
    if (m[0].includes("/images/"))
      problems.schema.push(`${p.route}: og:image names an /images/ path`);

  const footerNotes = count(p.html, 'data-images-notice="footer"');
  if (hasRenderings ? footerNotes !== 1 : footerNotes !== 0)
    problems.notice.push(
      `${p.route}: ${footerNotes} footer notice(s), expected ${hasRenderings ? 1 : 0} (${hasRenderings ? "a rendering is approved" : "no rendering is approved"})`,
    );
  for (const [key, want] of [
    ["gallery", p.route === "/gallery/" ? 1 : 0],
    ["about", p.route === "/about/" && aboutTeamShown ? 1 : 0],
  ]) {
    const re = new RegExp(
      `<p\\b[^>]*data-images-notice="${key}"[^>]*>([\\s\\S]*?)</p>`,
      "g",
    );
    const hits = [...p.html.matchAll(re)];
    if (hits.length !== want)
      problems.notice.push(
        `${p.route}: ${hits.length} ${key} notice(s), expected ${want}`,
      );
    for (const h of hits)
      if (textOf(h[1]) !== NOTICE[key])
        problems.notice.push(
          `${p.route}: the ${key} notice is not the contract §7 text verbatim`,
        );
  }
  if (footerNotes === 1) {
    const m = /<p\b[^>]*data-images-notice="footer"[^>]*>([\s\S]*?)<\/p>/.exec(p.html);
    if (m && textOf(m[1]) !== NOTICE.footer)
      problems.notice.push(
        `${p.route}: the footer notice is not the contract §7 text verbatim`,
      );
    if (m && !/<a\b[^>]*href="\/gallery\/"/.test(m[1]))
      problems.notice.push(
        `${p.route}: the footer notice does not link to /gallery/ (plain href)`,
      );
  }

  const contentImgs = imgs.filter((i) => srcToEntry.has(i.a.src));
  const isContent = !NOT_CONTENT.has(p.route);
  if (!isContent) {
    if (contentImgs.length)
      problems.excluded.push(
        `${p.route}: carries ${contentImgs.length} content image(s)`,
      );
    continue;
  }

  const n = contentImgs.length;
  if (n < gates.minPerContentPage)
    problems.min.push(
      `${p.route}: ${n} content image(s), minimum ${gates.minPerContentPage}`,
    );
  // The four owner-supplied originals sit outside the page sum, as they always have; their
  // watermarked copies (2026-11-01) are 590 KB against the 1.2 MB of the JPEGs they replaced.
  const bytes = contentImgs.reduce((s, i) => {
    const { entry, thumb } = srcToEntry.get(i.a.src);
    if (entry.legacySrc || entry.provenance?.kind === "owner-supplied") return s;
    return s + (thumb ? (entry.thumb.bytes ?? 0) : entry.bytes);
  }, 0);
  if (bytes > gates.maxPageImageBytes)
    problems.pageBytes.push(
      `${p.route}: ${(bytes / 1024).toFixed(0)} KB of images, budget ${(gates.maxPageImageBytes / 1024).toFixed(0)} KB`,
    );

  const high = imgs.filter((i) => (i.a.fetchpriority ?? "").toLowerCase() === "high");
  let priorityOk = true;
  if (n === 0) {
    if (high.length) {
      priorityOk = false;
      problems.priority.push(
        `${p.route}: fetchpriority="high" on a page with no content image`,
      );
    }
  } else if (high.length !== 1) {
    priorityOk = false;
    problems.priority.push(
      `${p.route}: ${high.length} × fetchpriority="high" (exactly one, on the first content image)`,
    );
  } else {
    const first = contentImgs[0];
    if (high[0].at !== first.at) {
      priorityOk = false;
      problems.priority.push(
        `${p.route}: the priority image is not the first content image in DOM order (${first.a.src})`,
      );
    }
    if (high[0].a.loading === "lazy") {
      priorityOk = false;
      problems.priority.push(`${p.route}: the priority image is loading="lazy"`);
    }
    for (const i of contentImgs)
      if (i !== high[0] && i.a.loading !== "lazy") {
        priorityOk = false;
        problems.priority.push(`${p.route}: ${i.a.src} is not loading="lazy"`);
      }
  }

  for (const i of contentImgs)
    for (const m of textProblems(decode(i.a.alt), "alt", ctx))
      problems.text.push(`${p.route}: ${i.a.src}: ${m}`);

  for (const f of p.html.matchAll(
    /<figure\b[^>]*\sdata-image-id="([^"]*)"[^>]*>([\s\S]*?)<\/figure>/g,
  )) {
    const id = f[1];
    const entry = byId.get(id);
    if (!entry) {
      problems.figure.push(`${p.route}: figure for unknown image ${id}`);
      continue;
    }
    if (!isVisible(entry, DRAFT))
      problems.figure.push(`${p.route}: figure ${id} is ${entry.status}`);
    if (!placedOn({ entry, thumb: false }, p.route))
      problems.figure.push(`${p.route}: figure ${id} has no placement on this route`);
    const offered = [...f[2].matchAll(SOURCE_RE)].map((m) => attrsOf(m[0]).srcset);
    if (isObj(entry.phone) && !offered.includes(phoneSrcOf(entry)))
      problems.phone.push(`${p.route}: figure ${id} does not offer its phone copy`);
    const cap = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/.exec(f[2]);
    if (cap) {
      // The gallery's figcaption also carries a link to the service page; judge the caption alone.
      const text = textOf(cap[1].replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, "")).replace(
        /\s*·\s*$/,
        "",
      );
      for (const m of textProblems(text, "caption", ctx, {
        firstNamesAllowed: p.route === "/about/",
      }))
        problems.text.push(`${p.route}: figcaption of ${id}: ${m}`);
    }
  }

  const rendered = new Set(contentImgs.map((i) => i.a.src));
  const stripCount = visible.filter((e) =>
    e.placements.some((pl) => pl.route === p.route && stripSlot(pl.slot)),
  ).length;
  for (const e of visible)
    for (const pl of e.placements) {
      // The blog index shows each guide's lead as its 480-px thumbnail: that IS the placement rendering.
      if (
        pl.route !== p.route ||
        rendered.has(srcOf(e)) ||
        (e.thumb && rendered.has(thumbSrcOf(e)))
      )
        continue;
      // Draft mode previews a candidate in place of the approved image it would replace (lib/images.ts).
      if (
        DRAFT &&
        e.status === "approved" &&
        visible.some(
          (c) =>
            c.status === "candidate" &&
            c.placements.some(
              (cp) =>
                cp.route === pl.route && cp.slot === pl.slot && cp.order === pl.order,
            ),
        )
      )
        continue;
      if (stripSlot(pl.slot) && stripCount < 2) {
        notes.push(
          `${p.route}: ${e.id} at ${pl.slot} is hidden — a strip renders only with ≥ 2 images`,
        );
        continue;
      }
      problems.placement.push(
        `${p.route}: ${e.id} is placed at ${pl.slot} but does not render`,
      );
    }
  for (const i of contentImgs) {
    const hit = srcToEntry.get(i.a.src);
    if (!placedOn(hit, p.route))
      problems.placement.push(
        `${p.route}: ${i.a.src} (${hit.entry.id}) renders here without a placement on this route`,
      );
  }

  if (/^\/areas\/[^/]+\/$/.test(p.route))
    for (const i of contentImgs) {
      const set = cityShare.get(i.a.src) ?? new Set();
      set.add(p.route);
      cityShare.set(i.a.src, set);
    }

  coverage.push({ route: p.route, n, bytes, priorityOk });
}

check(
  "every <img> has numeric width/height and a non-empty alt (unless aria-hidden)",
  problems.attrs,
  "the kit's SiteImage emits all three; a hand-written <img> must too — CLS and a11y",
);
check(
  "no reference to /images/_candidates/ in a production export",
  problems.candidate,
  "a page was rendered with IMAGES_DRAFT=1 — rebuild without it; candidates never ship",
);
check(
  "every /images/ reference resolves to a visible manifest entry",
  problems.unknown,
  "approved only (candidate too under IMAGES_DRAFT=1) — the file may exist, the manifest decides",
);
check(
  "excluded routes carry no content image",
  problems.excluded,
  `${EXCLUDED_ROUTES.join(" ")} — contract §0 decision 4`,
);
check(
  `every content page carries ≥ ${gates.minPerContentPage} content image(s)`,
  problems.min,
  "flip gates.minPerContentPage to 2 only once every route is covered",
);
check(
  `image bytes per page ≤ ${(gates.maxPageImageBytes / 1024).toFixed(0)} KB`,
  problems.pageBytes,
  "too many or too heavy — re-encode, or move a slot off the page",
);
check(
  "exactly one priority image per image-bearing page — the first content image, eager; all others lazy",
  problems.priority,
  "Figure priority goes to the first rendered figure; FieldStrip tile 1; never two",
);
check(
  "every rendered alt and figcaption passes the text rules",
  problems.text,
  "Hebrew, 20–200 chars, no claim stems, no city, no ASCII quote touching Hebrew, first names on /about/ only",
);
check(
  "every <figure data-image-id> names a visible entry placed on its route",
  problems.figure,
  "",
);
check(
  "every visible placement renders on its route, and every rendered image is placed there",
  problems.placement,
  "the built page must carry exactly what the manifest says — like the live-kit's out gate",
);
check(
  "every figure offers its phone copy, and every <source> is a visible phone copy",
  problems.phone,
  "Figure writes the <picture>; a missing copy means phone-copies.mjs did not run after install",
);
check(
  "no file is shared between two /areas/* pages",
  [...cityShare]
    .filter(([, r]) => r.size > 1)
    .map(([src, r]) => `${src} on ${[...r].join(", ")}`),
  "a city page carries its own roof-stock scene; 23 copies of one file would be a doorway signal",
);
check(
  "no /images/ path inside any application/ld+json or og:image",
  problems.schema,
  "renderings are illustrations, never evidence — the brand share card stays the og:image",
);
check(
  "the disclosure markers render where the manifest state says, with the contract §7 text",
  problems.notice,
  'data-images-notice="gallery" on /gallery/; "footer" on every page once a rendering is approved; "about" under the team figure',
);

// ── 6. draft marks ──────────────────────────────────────────────────────────────────────────
if (DRAFT) {
  const line =
    "This out/ was built with IMAGES_DRAFT=1 and renders candidate images from /images/_candidates/. Never deploy it.\n";
  fs.writeFileSync(path.join(OUT, ".images-draft"), line);
  // check-live-out.mjs owns .live-draft and may have written its own reason first; add ours.
  fs.appendFileSync(path.join(OUT, ".live-draft"), line);
  notes.push(
    `wrote ${OUT}/.images-draft and ${OUT}/.live-draft — ops/deploy-site.ps1 refuses this export`,
  );
}

// ── 7. coverage table ───────────────────────────────────────────────────────────────────────
console.log("\n  route                                  images     KB  priority");
for (const c of coverage.sort((a, b) => a.route.localeCompare(b.route)))
  console.log(
    `  ${c.route.padEnd(38)} ${String(c.n).padStart(6)} ${String(Math.round(c.bytes / 1024)).padStart(6)}  ${c.n === 0 ? "—" : c.priorityOk ? "ok" : "FAIL"}`,
  );
const withImages = coverage.filter((c) => c.n > 0).length;
console.log(
  `\n  ${coverage.length} content routes · ${withImages} with images · ${images.length} manifest entries ` +
    `(${images.filter((e) => e.status === "approved").length} approved, ${images.filter((e) => e.status === "candidate").length} candidate) · ` +
    `out/images ${(totalBytes / 1024).toFixed(0)} KB`,
);
for (const n of notes) console.log(`  note  ${n}`);

if (failures.length) {
  console.error(`\ncheck-images-out: ${failures.length} check(s) FAILED\n`);
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
console.log("\ncheck-images-out: all checks passed.");
