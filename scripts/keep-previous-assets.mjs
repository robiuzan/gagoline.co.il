/**
 * keep-previous-assets.mjs — every export also carries the /_next/static files of recent earlier
 * builds. Runs in postbuild, after `next build`.
 *
 * WHY THIS EXISTS
 *
 * Google fetches a page's HTML first and renders it later, from a queue, with whatever JS and CSS
 * that HTML names. A Pages deploy is a full replacement, so a deploy in between deletes hashed
 * chunks the HTML still points to. Measured live on 2026-10-14: the webpack runtime, app/layout,
 * app/not-found and the CSS that the 2026-09-17 homepage references all answered 404 after the
 * 2026-10-12 deploy. With the old runtime still cached and the layout chunk gone, rendering that HTML
 * gave Next's default "Application error" page (no title, meta or canonical) 6 of 6 times locally.
 * That page is the leading, unproven explanation for Google selecting https://www.747live.bet/ as
 * the homepage's canonical (docs/optimization-backlog.md §1.1).
 *
 * HOW
 *
 * .static-archive/ (gitignored) holds every /_next/static file of recent builds. .builds.json there
 * records each build's OWN files, keyed by a hash of its index.html. An archived file's mtime is the
 * last moment a build owning it was the newest export — not when it was built — so a build that
 * stayed live for months is protected for KEEP_DAYS after it was replaced:
 *   - this build's own files            → now (it is the newest export)
 *   - out.prev/'s own files             → now (ops/deploy-site.ps1 rotates the live export there
 *                                          before building, so it was live until this moment; an
 *                                          out.prev with no record is treated as all-own)
 *   - anything older than KEEP_DAYS     → pruned
 * then every remaining archived file this export lacks is copied in. Hashed names never collide, so
 * old and new sit side by side and Pages dedupes the upload. 60 days matches Vercel's skew window
 * for Googlebot and Bingbot. Re-running on the same export changes nothing.
 *
 * Must run after font-preload.mjs, which reads every stylesheet in out/_next/static/css. A
 * LIVE_DRAFT export (.live-draft, written by check-live-out.mjs) is never archived. Rollback via
 * `wrangler pages deploy .\out.prev` does NOT carry the newest build's chunks — see CLAUDE.md §10.
 *
 * Usage: node scripts/keep-previous-assets.mjs   (always works on the repo root)
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

const OUT = "out";
const PREV = "out.prev";
const ARCHIVE = ".static-archive";
const RECORD = path.join(ARCHIVE, ".builds.json");
const STATIC = path.join("_next", "static");
const KEEP_DAYS = 60;

if (!fs.existsSync(path.join(OUT, STATIC))) {
  console.error(
    `keep-previous-assets: '${path.join(OUT, STATIC)}' does not exist — run \`npm run build\` first.`,
  );
  process.exit(1);
}

/** Every file under `dir`, as /-separated paths relative to it. */
function files(dir, rel = "", acc = []) {
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name);
    if (e.isDirectory()) files(dir, r, acc);
    else acc.push(r);
  }
  return acc;
}

/** Copy via a temp name and rename, so an interrupted run never leaves a truncated file behind. */
function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const tmp = path.join(path.dirname(to), `.tmp-${path.basename(to)}`);
  fs.copyFileSync(from, tmp);
  fs.renameSync(tmp, to);
}

const keyOf = (root) =>
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, "index.html")))
    .digest("hex");

const now = new Date();
const builds = fs.existsSync(RECORD) ? JSON.parse(fs.readFileSync(RECORD, "utf8")) : {};
let archived = 0;

for (const root of [PREV, OUT]) {
  const src = path.join(root, STATIC);
  if (!fs.existsSync(src) || !fs.existsSync(path.join(root, "index.html"))) continue;
  if (fs.existsSync(path.join(root, ".live-draft"))) continue;
  const key = keyOf(root);
  // First sight of this export: everything in it is its own (carried files only appear after this
  // script has run on it, and by then it has a record).
  const own = builds[key]?.files ?? files(src);
  builds[key] ??= { recorded: now.toISOString(), files: own };
  builds[key].newestUntil = now.toISOString();
  for (const rel of own) {
    const from = path.join(src, rel);
    const dest = path.join(ARCHIVE, rel);
    if (!fs.existsSync(from)) continue;
    if (!fs.existsSync(dest) || fs.statSync(dest).size !== fs.statSync(from).size) {
      copy(from, dest);
      archived++;
    }
    fs.utimesSync(dest, now, now);
  }
}

// Prune what no live-or-newest export has owned for KEEP_DAYS, and the records that went with it.
const cutoff = now.getTime() - KEEP_DAYS * 864e5;
let pruned = 0;
for (const rel of fs.existsSync(ARCHIVE) ? files(ARCHIVE) : []) {
  if (rel === ".builds.json") continue;
  const file = path.join(ARCHIVE, rel);
  if (fs.statSync(file).mtimeMs < cutoff) {
    fs.rmSync(file);
    pruned++;
  }
}
for (const [key, b] of Object.entries(builds)) {
  if (Date.parse(b.newestUntil) < cutoff) delete builds[key];
}
function dropEmptyDirs(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) dropEmptyDirs(path.join(dir, e.name));
  }
  if (dir !== ARCHIVE && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}
if (fs.existsSync(ARCHIVE)) dropEmptyDirs(ARCHIVE);

// Carry every remaining archived file this export lacks.
let carried = 0;
for (const rel of fs.existsSync(ARCHIVE) ? files(ARCHIVE) : []) {
  if (rel === ".builds.json") continue;
  const dest = path.join(OUT, STATIC, rel);
  if (!fs.existsSync(dest)) {
    copy(path.join(ARCHIVE, rel), dest);
    carried++;
  }
}

fs.mkdirSync(ARCHIVE, { recursive: true });
fs.writeFileSync(RECORD, JSON.stringify(builds, null, 2) + "\n");
console.log(
  `keep-previous-assets: ${carried} file(s) from earlier builds carried into ${OUT}/ ` +
    `(${archived} newly archived, ${pruned} older than ${KEEP_DAYS} days pruned)`,
);
