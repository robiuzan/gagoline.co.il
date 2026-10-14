/**
 * keep-previous-assets.mjs — every export also carries the /_next/static files of recent earlier
 * builds. Runs in postbuild, after `next build`.
 *
 * WHY THIS EXISTS
 *
 * Google fetches a page's HTML first and renders it later, from a queue, with whatever JS and CSS
 * that HTML names. A Pages deploy is a full replacement, so a deploy in between deletes hashed
 * chunks the HTML still points to. Measured live on 2026-10-14: 4 of the 13 files the 2026-09-17
 * homepage loads (the webpack runtime, app/layout, app/not-found and the CSS) answered 404 after the
 * 2026-10-12 deploy. Rendering that HTML against those 404s was reproduced locally. Sometimes it
 * works; sometimes it comes out as Next's default "Application error" page, whose <head> is empty
 * (no title, no canonical) and whose one line is identical on every Next.js site. Google clusters
 * identical pages across sites. That is the leading explanation for Google selecting
 * https://www.747live.bet/ as the homepage's canonical (docs/optimization-backlog.md §1.1).
 *
 * HOW
 *
 * Every build adds its own /_next/static files to .static-archive/, together with those of out.prev/.
 * That is the last deployed export, because ops/deploy-site.ps1 rotates out/ into it before
 * building. The build then copies in every archived file younger than KEEP_DAYS that it does not
 * already have. Hashed names never collide, so old and new sit side by side and Pages dedupes the
 * upload. 60 days matches the window Vercel keeps for Googlebot and Bingbot.
 *
 * Must run after font-preload.mjs, which reads every stylesheet in out/_next/static/css and would
 * preload the fonts of old builds. A LIVE_DRAFT export (out/.live-draft, written by
 * check-live-out.mjs) is never archived, since drafts carry unapproved wording.
 *
 * Usage: node scripts/keep-previous-assets.mjs
 */

import fs from "node:fs";
import path from "node:path";

const OUT = "out";
const PREV = "out.prev";
const ARCHIVE = ".static-archive";
const STATIC = path.join("_next", "static");
const KEEP_DAYS = 60;

if (!fs.existsSync(path.join(OUT, STATIC))) {
  console.error(
    `keep-previous-assets: '${path.join(OUT, STATIC)}' does not exist — run \`npm run build\` first.`,
  );
  process.exit(1);
}

/** Every file under `dir`, as paths relative to it. */
function files(dir, rel = "", acc = []) {
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = path.join(rel, e.name);
    if (e.isDirectory()) files(dir, r, acc);
    else acc.push(r);
  }
  return acc;
}

const now = new Date();
let archived = 0;

// Archive: the last deployed export, then this build. An archived file's mtime is the last time a
// build produced it, so a file this build still uses is refreshed rather than aged out.
for (const root of [PREV, OUT]) {
  const src = path.join(root, STATIC);
  if (!fs.existsSync(src) || fs.existsSync(path.join(root, ".live-draft"))) continue;
  for (const rel of files(src)) {
    const dest = path.join(ARCHIVE, rel);
    const from = path.join(src, rel);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(from, dest);
      archived++;
    }
    const { mtime } = fs.statSync(root === OUT ? dest : from);
    fs.utimesSync(dest, now, root === OUT ? now : mtime);
  }
}

// Prune what no build has produced for KEEP_DAYS, then carry the rest into this export.
const cutoff = now.getTime() - KEEP_DAYS * 864e5;
let pruned = 0;
let carried = 0;
for (const rel of fs.existsSync(ARCHIVE) ? files(ARCHIVE) : []) {
  const file = path.join(ARCHIVE, rel);
  if (fs.statSync(file).mtimeMs < cutoff) {
    fs.rmSync(file);
    pruned++;
    continue;
  }
  const dest = path.join(OUT, STATIC, rel);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
    carried++;
  }
}

console.log(
  `keep-previous-assets: ${carried} file(s) from earlier builds carried into ${OUT}/ ` +
    `(${archived} newly archived, ${pruned} older than ${KEEP_DAYS} days pruned)`,
);
