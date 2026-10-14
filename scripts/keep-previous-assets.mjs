/**
 * keep-previous-assets.mjs — every export also carries the /_next/static files of the earlier
 * builds that may still be live, or still be rendered by Google. Runs in postbuild, after
 * `next build`.
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
 * .static-archive/ (gitignored) holds a copy of every recorded build's /_next/static files, and
 * .static-archive/.ledger.json says which build owns which file. Each run records this build's own
 * files, and those of out.prev/: ops/deploy-site.ps1 rotates out/ into out.prev/ just before it
 * builds, so out.prev/ is the export that existed when the deploy started. Then it copies into
 * out/ every archived file of every build that is still protected. Hashed names never collide, so
 * old and new sit side by side, and Pages dedupes the upload.
 *
 * A build is protected until KEEP_DAYS after a later deploy replaced it, not after it was built:
 * Google can still be rendering HTML that a site served yesterday, however old its build. The
 * script cannot see a deploy, but it can see the rotation that precedes one: when out.prev/ is the
 * export this script last saw in out/, the deploy script moved it there, so this build is about to
 * be deployed, and every earlier build is replaced as of now. A plain `npm run build` replaces
 * nothing, because `-DeployOnly` can still ship it. 60 days matches the window Vercel keeps for
 * Googlebot and Bingbot. The one gap: a deploy run that builds and then fails to upload still
 * starts the earlier builds' 60 days.
 *
 * The ledger, not file dates, is the record, so the result is the same on Windows and Linux, and
 * running the script twice changes nothing. An archive without a ledger (made by the first version
 * of this script) is adopted as replaced on the day the ledger is created.
 *
 * Must run after font-preload.mjs, which reads every stylesheet in out/_next/static/css and would
 * preload the fonts of old builds. A LIVE_DRAFT export (.live-draft, written by check-live-out.mjs)
 * is never recorded, since drafts carry unapproved wording and are never deployed.
 *
 * Usage:
 *   node scripts/keep-previous-assets.mjs                 record, prune, carry into out/
 *   node scripts/keep-previous-assets.mjs --into out.prev carry only, before a rollback upload
 *
 * Never delete .static-archive/: a fresh clone starts it empty, so a first deploy from another
 * machine cannot carry what that machine never built.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Paths are relative to the repo root wherever this is run from.
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

const OUT = "out";
const PREV = "out.prev";
const ARCHIVE = ".static-archive";
const LEDGER = path.join(ARCHIVE, ".ledger.json");
const STATIC = path.join("_next", "static");
const DRAFT_MARKER = ".live-draft";
const KEEP_DAYS = 60;
const DAY_MS = 864e5;

// KEEP_ASSETS_NOW (an ISO date) exists only so a simulation can move the clock.
const now = process.env.KEEP_ASSETS_NOW
  ? new Date(process.env.KEEP_ASSETS_NOW)
  : new Date();
if (Number.isNaN(now.getTime()))
  fail(`KEEP_ASSETS_NOW is not a date: ${process.env.KEEP_ASSETS_NOW}`);
const nowIso = now.toISOString();

function fail(message) {
  console.error(`keep-previous-assets: ${message}`);
  process.exit(1);
}

/** Every file under `dir`, as "/"-separated paths relative to it; dot-files are skipped. */
function files(dir, rel = "", acc = []) {
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) files(dir, r, acc);
    else acc.push(r);
  }
  return acc;
}

const onDisk = (root, rel) => path.join(root, ...rel.split("/"));

/** Copies `from` to `to` through a temp file and a rename, so a copy is never left half-written. */
function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const tmp = path.join(path.dirname(to), `.tmp-${process.pid}-${path.basename(to)}`);
  fs.copyFileSync(from, tmp);
  fs.renameSync(tmp, to);
}

/** True when `to` is missing or differs in size from `from`, e.g. after an interrupted copy. */
function stale(from, to) {
  return !fs.existsSync(to) || fs.statSync(to).size !== fs.statSync(from).size;
}

/** Identifies an export: Next writes a fresh build id into every page, so no two builds match. */
function exportKey(root) {
  const index = path.join(root, "index.html");
  if (!fs.existsSync(index)) return null;
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(index))
    .digest("hex")
    .slice(0, 16);
}

const isDraft = (root) => fs.existsSync(path.join(root, DRAFT_MARKER));
const isProtected = (b) =>
  !b.replacedAt || now - new Date(b.replacedAt) < KEEP_DAYS * DAY_MS;

/** @returns {{ builds: Array<{key: string, builtAt: string, replacedAt: string | null, files: string[]}>, last?: {out: string | null, prev: string | null} }} */
function readLedger() {
  if (!fs.existsSync(LEDGER)) {
    // A ledger-less archive comes from the first version of this script. Its files belonged to
    // builds that were live until now at the latest, so their 60 days start now.
    const legacy = fs.existsSync(ARCHIVE) ? files(ARCHIVE) : [];
    return {
      builds: legacy.length
        ? [{ key: "legacy", builtAt: nowIso, replacedAt: nowIso, files: legacy }]
        : [],
    };
  }
  try {
    const ledger = JSON.parse(fs.readFileSync(LEDGER, "utf8"));
    if (!Array.isArray(ledger.builds)) throw new Error("no builds array");
    return ledger;
  } catch (e) {
    // Fail safe: keep every archived file as if replaced today, rather than prune blind.
    console.warn(
      `keep-previous-assets: ${LEDGER} is unreadable (${e.message}); starting a new one`,
    );
    return {
      builds: [
        { key: "legacy", builtAt: nowIso, replacedAt: nowIso, files: files(ARCHIVE) },
      ],
    };
  }
}

function writeLedger(ledger) {
  fs.mkdirSync(ARCHIVE, { recursive: true });
  const tmp = `${LEDGER}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(ledger, null, 1)}\n`);
  fs.renameSync(tmp, LEDGER);
}

/** Copies every protected archived file `root` lacks into it; never touches the build's own. */
function carry(ledger, root, own = new Set()) {
  let carried = 0;
  for (const rel of new Set(ledger.builds.filter(isProtected).flatMap((b) => b.files))) {
    if (own.has(rel)) continue;
    const from = onDisk(ARCHIVE, rel);
    const to = onDisk(path.join(root, STATIC), rel);
    if (fs.existsSync(from) && stale(from, to)) {
      copy(from, to);
      carried++;
    }
  }
  return carried;
}

// --into <dir>: carry only. Before `wrangler pages deploy .\out.prev`, so a rollback ships the
// chunks of the build being rolled back from, which Google may already have crawled.
const intoAt = process.argv.indexOf("--into");
if (intoAt !== -1) {
  const into = process.argv[intoAt + 1];
  if (!into || !fs.existsSync(path.join(into, "index.html")))
    fail(`--into needs an export folder`);
  if (!fs.existsSync(LEDGER)) fail(`no ${LEDGER} yet; nothing to carry`);
  const carried = carry(readLedger(), into);
  console.log(`keep-previous-assets: ${carried} archived file(s) carried into ${into}/`);
  process.exit(0);
}

if (!fs.existsSync(path.join(OUT, STATIC))) {
  fail(`'${path.join(OUT, STATIC)}' does not exist — run \`npm run build\` first.`);
}
const outKey = exportKey(OUT);
if (!outKey) fail(`'${OUT}/index.html' does not exist — the export is incomplete.`);

const ledger = readLedger();
const byKey = new Map(ledger.builds.map((b) => [b.key, b]));
let archived = 0;

/** Copies a build's files into the archive, repairing any damaged copy. */
function archive(root, rels) {
  for (const rel of rels) {
    const from = onDisk(path.join(root, STATIC), rel);
    const to = onDisk(ARCHIVE, rel);
    if (fs.existsSync(from) && stale(from, to)) {
      copy(from, to);
      archived++;
    }
  }
}

// 1. The export the deploy started from. Unrecorded (built before the ledger, or on another
//    machine): it was live until now at the latest, so it is replaced now. Its listing may
//    include files it carried itself, which is right: they shipped with it.
const prevKey =
  fs.existsSync(path.join(PREV, STATIC)) && !isDraft(PREV) ? exportKey(PREV) : null;
if (prevKey && prevKey !== outKey) {
  // Unless it was seen there last run too: then it is missing because its window ended.
  if (!byKey.has(prevKey) && ledger.last?.prev !== prevKey) {
    const b = {
      key: prevKey,
      builtAt: nowIso,
      replacedAt: nowIso,
      files: files(path.join(PREV, STATIC)),
    };
    ledger.builds.push(b);
    byKey.set(prevKey, b);
  }
  const prev = byKey.get(prevKey);
  if (prev) archive(PREV, prev.files);
}

// 2. Was out/ rotated into out.prev/ since the last run? Then this is a deploy build, and every
//    earlier build is replaced as of now.
const deploying = Boolean(
  prevKey &&
  prevKey !== outKey &&
  ledger.last?.out === prevKey &&
  ledger.last.prev !== prevKey,
);

// 3. This build. On a second run over the same out/, its own files are the recorded ones, not the
//    listing, which by then includes what the first run carried in.
const draft = isDraft(OUT);
const own = new Set(byKey.get(outKey)?.files ?? files(path.join(OUT, STATIC)));
if (!draft) {
  const current = byKey.get(outKey);
  if (current) current.replacedAt = null;
  else
    ledger.builds.push({
      key: outKey,
      builtAt: nowIso,
      replacedAt: null,
      files: [...own],
    });
  archive(OUT, own);
}
if (deploying) {
  for (const b of ledger.builds)
    if (b.key !== outKey && !b.replacedAt) b.replacedAt = nowIso;
}

// 4. Forget builds past their window, then delete archived files no remaining build owns.
const dropped = ledger.builds.length;
ledger.builds = ledger.builds.filter(isProtected);
const keep = new Set(ledger.builds.flatMap((b) => b.files));
let pruned = 0;
for (const rel of fs.existsSync(ARCHIVE) ? files(ARCHIVE) : []) {
  if (!keep.has(rel)) {
    fs.rmSync(onDisk(ARCHIVE, rel));
    pruned++;
  }
}
// Also clears temp files an interrupted copy left behind.
(function tidy(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const sub = path.join(dir, e.name);
    if (e.isDirectory()) {
      tidy(sub);
      if (fs.readdirSync(sub).length === 0) fs.rmdirSync(sub);
    } else if (e.name.startsWith(".tmp-")) fs.rmSync(sub);
  }
})(ARCHIVE);

// 5. Carry, and remember what this run saw, so the next run can tell a deploy from a rebuild.
const carried = carry(ledger, OUT, own);
ledger.last = { out: outKey, prev: prevKey };
writeLedger(ledger);

console.log(
  `keep-previous-assets: ${carried} file(s) from ${ledger.builds.length - (draft ? 0 : 1)} ` +
    `earlier build(s) carried into ${OUT}/ (${deploying ? "deploy build: earlier builds replaced now" : "no deploy detected"}; ` +
    `${archived} newly archived, ${dropped - ledger.builds.length} build(s) and ${pruned} file(s) ` +
    `past ${KEEP_DAYS} days pruned${draft ? "; LIVE_DRAFT, not recorded" : ""})`,
);
