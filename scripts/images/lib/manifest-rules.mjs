/**
 * manifest-rules.mjs — the rules of content/images/manifest.json, in ONE place.
 *
 * Imported by BOTH `lib/images.ts` (which throws at module init, so a bad manifest cannot build a
 * page) and `scripts/images/check-images-out.mjs` (which proves the export). Two copies of these
 * rules would drift the way the hand-written SEO greps drifted before `seo-assert.mjs` existed, so
 * there is one. Pure: no fs, no network — the gate supplies the file-system facts, this module
 * supplies the judgement. JSDoc types are what `tsc` reads at the import boundary (allowJs).
 *
 * The contract: Media Studio/page-images/docs/contract.md §2 (slots) and §4 (manifest + rules).
 */

/**
 * Every slot id a placement may name (contract §2), plus `end` — the second position an article's
 * `figure` block may declare (content/articles/types.ts), unused by the plan today.
 */
export const SLOT_IDS = Object.freeze([
  "main",
  "detail",
  "work",
  "strip-1",
  "strip-2",
  "strip-3",
  "pair-1",
  "pair-2",
  "team",
  "story",
  "survey",
  "layers",
  "lead",
  "mid",
  "end",
  "supplied",
  "generated",
]);

export const STATUSES = Object.freeze(["candidate", "approved", "rejected", "retired"]);
export const PHASES = Object.freeze(["done", "in-progress", "diagnosis", "materials"]);
export const FILE_GROUPS = Object.freeze([
  "home",
  "services",
  "areas",
  "cities",
  "about",
  "contact",
  "pricing",
  "gallery",
  "blog",
]);

/**
 * Size classes (contract §2): the long edge the finish step resizes to, and the byte budget.
 * `gates.maxImageBytes` caps every class from above as well.
 */
export const SIZE_CLASSES = Object.freeze({
  // 256 KB for every content class: phone-grain macros (a seam, a drain) do not compress below
  // ~240 KB even at WebP q50, and the per-page sum (900 KB) is the budget that matters.
  large: { longEdge: 1600, maxBytes: 262144 },
  half: { longEdge: 1200, maxBytes: 262144 },
  tile: { longEdge: 1200, maxBytes: 262144 },
  thumb: { longEdge: 480, maxBytes: 46080 },
});

/** The routes that never carry a content image (contract §0 decision 4). */
export const EXCLUDED_ROUTES = Object.freeze([
  "/privacy/",
  "/terms/",
  "/accessibility/",
  "/404/",
  "/thank-you/",
  "/reviews/",
]);

/**
 * The consented technicians (contract §0 decision 2): manifest `people` ids, and the Hebrew first
 * names that may appear ONLY in a caption whose every placement is /about/ — never in alt, never in
 * a filename. Source of truth: Media Studio/sites/gagoline/site.json `people.*.firstNameHe`.
 */
export const PEOPLE_IDS = Object.freeze(["nissim", "shimi"]);
export const FIRST_NAMES_HE = Object.freeze(["ניסים", "שימי"]);

/** A `retired` entry keeps its file at least this long (contract §4). */
export const RETIRED_KEEP_DAYS = 60;

export const GATE_KEYS = Object.freeze([
  "minPerContentPage",
  "maxImageBytes",
  "maxPageImageBytes",
  "maxTotalBytes",
]);

/**
 * @typedef {object} RulesContext
 * @property {readonly string[]} contentRoutes  every route a placement may name
 * @property {readonly string[]} cityNames      the 23 Hebrew city names (lib/site-config.ts)
 * @property {readonly string[]} citySlugs      their slugs — never inside a file name
 * @property {readonly string[]} serviceSlugs   the 8 service slugs
 */

const HEBREW = /[א-ת]/;
const isObj = (x) => typeof x === "object" && x !== null && !Array.isArray(x);
const isPosInt = (x) => Number.isInteger(x) && x > 0;
const isNonNegInt = (x) => Number.isInteger(x) && x >= 0;
const DATE_STAMP = /^\d{4}-\d{2}-\d{2}\s*[—–-]\s*\S/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** @param {string} s */
export function hasHebrew(s) {
  return HEBREW.test(String(s));
}

/** Hebrew word edges — \b is ASCII-only. Up to two prefix letters (ב, ל, מ, ו, ה, ש, כ). */
const hebrewWord = (name) =>
  new RegExp(
    `(?<![\\u05d0-\\u05ea])[ובלמהשכ]{0,2}${escapeRe(name)}(?![\\u05d0-\\u05ea])`,
  );
/**
 * City names that are also ordinary Hebrew nouns — "אזור" (area) is in half the captions a roofer
 * would write ("באזור המעקה"). Those are flagged only when they stand alone at the end of a clause,
 * where a place name would sit ("גג בטון באזור."), never mid-sentence before a noun.
 */
const AMBIGUOUS_CITY_NAMES = new Set(["אזור"]);
const ambiguousWord = (name) =>
  new RegExp(
    `(?<![\\u05d0-\\u05ea])[ובלמ]?${escapeRe(name)}(?![\\u05d0-\\u05ea])(?=\\s*(?:[.,;:!?—–-]|$))`,
  );
function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The claim stems an alt or caption may never carry (contract §4). Disclosure is site-wide, so
 * the words that would label one image ("הדמיה", "AI") are banned too: a label on some images
 * implies the others are photographs.
 */
const BANNED = [
  {
    re: /תמונה של/,
    why: "״תמונה של״ — describe what is in frame, not that it is a picture",
  },
  { re: /לפני ואחרי/, why: "״לפני ואחרי״ — no pair exists, so it is a claim" },
  {
    re: /כוכב|דירוג|★|מומלצ/,
    why: "a rating/recommendation stem (כוכב / דירוג / ★ / מומלץ)",
  },
  {
    re: /הדמי|(?<![A-Za-z])AI(?![A-Za-z])|(?<![א-ת])בינה(?![א-ת])/,
    why: "a per-image AI label (הדמיה / AI / בינה) — disclosure is the site-wide note",
  },
  { re: /(?<!\d)\d{4}(?!\d)/, why: "a 4-digit number reads as a year" },
  {
    re: /\d\s*מ[״"׳']?[רמ](?![א-ת])/,
    why: "digits before מ״ר / מ״מ — an area or thickness is a job fact",
  },
  {
    re: /[א-ת]["']|["'][א-ת]/,
    why: "an ASCII quote touching a Hebrew letter — use גרש ׳ and גרשיים ״",
  },
];

/**
 * Problems with one alt or caption text. Empty array = clean.
 * @param {unknown} text
 * @param {"alt"|"caption"} kind
 * @param {RulesContext} ctx
 * @param {{ firstNamesAllowed?: boolean }} [opts]  captions on /about/ only
 * @returns {string[]}
 */
export function textProblems(text, kind, ctx, opts = {}) {
  const out = [];
  if (typeof text !== "string" || !text.trim()) return [`${kind} is empty`];
  const t = text.trim();
  if (!hasHebrew(t)) out.push(`${kind} has no Hebrew letters`);
  if (t.length < 20 || t.length > 200)
    out.push(`${kind} is ${t.length} chars (20–200 allowed)`);
  for (const b of BANNED) if (b.re.test(t)) out.push(`${kind} carries ${b.why}`);
  for (const name of ctx.cityNames) {
    const re = AMBIGUOUS_CITY_NAMES.has(name) ? ambiguousWord(name) : hebrewWord(name);
    if (re.test(t))
      out.push(`${kind} names a city (${name}) — the page's own H2s supply it`);
  }
  if (!opts.firstNamesAllowed)
    for (const name of FIRST_NAMES_HE)
      if (hebrewWord(name).test(t))
        out.push(
          `${kind} names ${name} — first names only in a caption whose every placement is /about/`,
        );
  return out;
}

/**
 * The public path an entry renders from. `legacySrc` (the four supplied originals) wins; an
 * approved file lives under /images/, a candidate under /images/_candidates/.
 * @param {{ file: string, legacySrc?: string | null, status: string }} entry
 * @returns {string}
 */
export function srcOf(entry) {
  if (entry.legacySrc) return entry.legacySrc;
  return entry.status === "candidate"
    ? `/images/_candidates/${entry.file}`
    : `/images/${entry.file}`;
}

/**
 * The public path of an entry's derived thumbnail, or null.
 * @param {{ status: string, thumb?: { file: string } | null }} entry
 * @returns {string | null}
 */
export function thumbSrcOf(entry) {
  if (!entry.thumb) return null;
  return entry.status === "candidate"
    ? `/images/_candidates/${entry.thumb.file}`
    : `/images/${entry.thumb.file}`;
}

/**
 * Whether an entry renders: approved always; a candidate only in draft mode (IMAGES_DRAFT=1).
 * @param {{ status: string }} entry
 * @param {boolean} draft
 */
export function isVisible(entry, draft) {
  return entry.status === "approved" || (draft && entry.status === "candidate");
}

/**
 * Whether a file slug carries a city slug as a dash-separated token ("tel-aviv-roof-01").
 * @param {string} fileSlug
 * @param {readonly string[]} citySlugs
 * @returns {string | null} the offending city slug
 */
export function citySlugInFile(fileSlug, citySlugs) {
  const tokens = fileSlug.split("-");
  for (const slug of citySlugs) {
    const parts = slug.split("-");
    for (let i = 0; i + parts.length <= tokens.length; i++) {
      if (parts.every((p, j) => tokens[i + j] === p)) return slug;
    }
  }
  return null;
}

/** @param {unknown} v */
const provenanceProblems = (v) => {
  if (!isObj(v)) return ["provenance must be an object"];
  const out = [];
  if (v.kind === "ai-generated") {
    for (const k of ["tool", "model", "created", "prompt", "promptSha"])
      if (typeof v[k] !== "string" || !v[k]) out.push(`provenance.${k} is required`);
    if (!Array.isArray(v.refs)) out.push("provenance.refs must be an array");
  } else if (v.kind === "owner-supplied") {
    if (typeof v.received !== "string" || !ISO_DATE.test(v.received))
      out.push("provenance.received must be an ISO date");
    if (v.originAsserted !== false)
      out.push("provenance.originAsserted must be false — never ״verified real״");
  } else out.push(`provenance.kind must be ai-generated | owner-supplied`);
  return out;
};

/**
 * Problems with one entry (shape + text rules + status consistency). Prefixed by the caller.
 * @param {unknown} e
 * @param {RulesContext} ctx
 * @param {{ maxImageBytes: number }} gates
 * @returns {string[]}
 */
export function entryProblems(e, ctx, gates) {
  if (!isObj(e)) return ["entry is not an object"];
  const out = [];
  const p = (m) => out.push(m);

  if (typeof e.id !== "string" || !/^[a-z0-9-]+$/.test(e.id))
    p("id must match [a-z0-9-]+");
  const fileRe = new RegExp(
    `^(${FILE_GROUPS.join("|")})/([a-z0-9-]+)\\.(webp|jpg|jpeg|png)$`,
  );
  const fm = typeof e.file === "string" ? fileRe.exec(e.file) : null;
  if (!fm)
    p(`file must be <group>/<slug>.webp|jpg|png with group in ${FILE_GROUPS.join("|")}`);
  else {
    const city = citySlugInFile(fm[2], ctx.citySlugs);
    if (city)
      p(`file names a city (${city}) — file names are subject-based, never a city`);
    for (const n of PEOPLE_IDS)
      if (fm[2].split("-").includes(n)) p(`file names a person (${n})`);
  }
  if (e.legacySrc !== null && e.legacySrc !== undefined) {
    if (typeof e.legacySrc !== "string" || !/^\/[^/]/.test(e.legacySrc))
      p("legacySrc must be an absolute /path or null");
    else if (e.legacySrc.startsWith("/images/"))
      p("legacySrc must point at the original location, not /images/");
  }
  const legacy = Boolean(e.legacySrc);

  if (!isPosInt(e.width) || !isPosInt(e.height))
    p("width/height must be positive integers");
  if (!isPosInt(e.bytes)) p("bytes must be a positive integer");
  if (typeof e.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(e.sha256))
    p("sha256 must be 64 lowercase hex chars");
  const cls = typeof e.sizeClass === "string" ? SIZE_CLASSES[e.sizeClass] : undefined;
  if (!cls) p(`sizeClass must be one of ${Object.keys(SIZE_CLASSES).join("|")}`);
  else if (!legacy) {
    // The legacy originals pre-date the budgets and are replaced by watermarked copies at new
    // slugs (contract §2); until then they are exempt. Everything the toolkit finishes is not.
    const cap = Math.min(gates.maxImageBytes, cls.maxBytes);
    if (isPosInt(e.bytes) && e.bytes > cap)
      p(`bytes ${e.bytes} exceed the ${e.sizeClass} budget of ${cap}`);
    if (
      isPosInt(e.width) &&
      isPosInt(e.height) &&
      Math.max(e.width, e.height) !== cls.longEdge
    )
      p(`long edge must be ${cls.longEdge} for sizeClass ${e.sizeClass}`);
  }

  if (!Array.isArray(e.placements) || e.placements.length === 0)
    p("placements must be a non-empty array");
  const placements = Array.isArray(e.placements) ? e.placements : [];
  for (const pl of placements) {
    if (!isObj(pl)) {
      p("placement is not an object");
      continue;
    }
    if (typeof pl.route !== "string" || !ctx.contentRoutes.includes(pl.route))
      p(`placement route ${JSON.stringify(pl.route)} is not a content route`);
    if (!SLOT_IDS.includes(pl.slot))
      p(`placement slot ${JSON.stringify(pl.slot)} is not a SlotId`);
    if (!isPosInt(pl.order)) p("placement order must be a positive integer");
  }
  const cityRoutes = new Set(
    placements
      .map((pl) => (isObj(pl) && typeof pl.route === "string" ? pl.route : ""))
      .filter((r) => /^\/areas\/[^/]+\/$/.test(r)),
  );
  if (cityRoutes.size > 1)
    p(
      `placed on ${cityRoutes.size} city pages — no file is shared between two /areas/* pages`,
    );

  const everyAbout =
    placements.length > 0 &&
    placements.every((pl) => isObj(pl) && pl.route === "/about/");
  for (const m of textProblems(e.alt, "alt", ctx)) p(m);
  if (e.caption !== null && e.caption !== undefined)
    for (const m of textProblems(e.caption, "caption", ctx, {
      firstNamesAllowed: everyAbout,
    }))
      p(m);
  if (e.altEn !== null && e.altEn !== undefined && typeof e.altEn !== "string")
    p("altEn must be a string or null");

  if (e.thumb !== null && e.thumb !== undefined) {
    if (!isObj(e.thumb) || typeof e.thumb.file !== "string" || !fileRe.test(e.thumb.file))
      p("thumb.file must be <group>/<slug>.<ext>");
    else if (!isPosInt(e.thumb.width) || !isPosInt(e.thumb.height))
      p("thumb.width/height must be positive integers");
    else if (Math.max(e.thumb.width, e.thumb.height) !== SIZE_CLASSES.thumb.longEdge)
      p(`thumb long edge must be ${SIZE_CLASSES.thumb.longEdge}`);
    if (
      isObj(e.thumb) &&
      isPosInt(e.thumb.bytes) &&
      e.thumb.bytes > SIZE_CLASSES.thumb.maxBytes
    )
      p(`thumb bytes exceed ${SIZE_CLASSES.thumb.maxBytes}`);
  }

  if (!STATUSES.includes(e.status)) p(`status must be ${STATUSES.join("|")}`);
  if (!Array.isArray(e.people) || e.people.some((x) => !PEOPLE_IDS.includes(x)))
    p(`people must list only ${PEOPLE_IDS.join("|")}`);
  if (e.phase !== null && !PHASES.includes(e.phase))
    p(`phase must be null or ${PHASES.join("|")}`);
  if (e.service !== null && !ctx.serviceSlugs.includes(e.service))
    p(`service ${JSON.stringify(e.service)} is not a service slug`);
  if (e.city !== null && !ctx.citySlugs.includes(e.city))
    p(`city ${JSON.stringify(e.city)} is not a city slug`);

  for (const m of provenanceProblems(e.provenance)) p(m);
  const kind = isObj(e.provenance) ? e.provenance.kind : undefined;

  if (e.watermark === null || e.watermark === undefined) {
    if (!legacy)
      p("watermark is required on every entry except the untouched legacy originals");
  } else if (
    !isObj(e.watermark) ||
    e.watermark.corner !== "bottom-right" ||
    !["white", "navy"].includes(e.watermark.logo) ||
    !(typeof e.watermark.widthPct === "number" && e.watermark.widthPct > 0)
  )
    p("watermark must be { logo: white|navy, corner: bottom-right, widthPct > 0 }");

  if (!isObj(e.review)) p("review must be an object with automated and owner");
  const automated = isObj(e.review) ? e.review.automated : undefined;
  const owner = isObj(e.review) ? e.review.owner : undefined;
  if (automated !== null && automated !== undefined) {
    if (
      !isObj(automated) ||
      !["pass", "pass-with-note", "regenerate", "reject"].includes(automated.verdict)
    )
      p("review.automated.verdict must be pass | pass-with-note | regenerate | reject");
  }
  if (owner !== null && owner !== undefined) {
    if (!isObj(owner) || !["approved", "rejected", "regenerate"].includes(owner.decision))
      p("review.owner.decision must be approved | rejected | regenerate");
  }

  if (e.status === "approved") {
    if (typeof e.approved !== "string" || !DATE_STAMP.test(e.approved))
      p('approved must read "YYYY-MM-DD — who" on an approved entry');
    if (!isObj(owner) || owner.decision !== "approved")
      p("an approved entry needs review.owner.decision === approved");
    if (
      kind === "ai-generated" &&
      !(isObj(automated) && ["pass", "pass-with-note"].includes(automated.verdict))
    )
      p("an approved rendering needs review.automated.verdict pass | pass-with-note");
  } else if (e.approved !== null && e.approved !== undefined)
    p("approved must be null unless status is approved");
  if (e.status === "retired") {
    if (typeof e.retired !== "string" || !ISO_DATE.test(e.retired))
      p("retired must be an ISO date on a retired entry");
  } else if (e.retired !== null && e.retired !== undefined)
    p("retired must be null unless status is retired");

  return out;
}

/**
 * Every problem in a manifest object, each prefixed `images[i] (<id>): `. Empty array = valid.
 * @param {unknown} raw
 * @param {RulesContext} ctx
 * @returns {string[]}
 */
export function manifestProblems(raw, ctx) {
  const out = [];
  const p = (m) => out.push(m);
  if (!isObj(raw)) return ["manifest is not an object"];
  if (raw.version !== 1) p(`version must be 1 (got ${JSON.stringify(raw.version)})`);
  if (typeof raw.site !== "string" || !raw.site) p("site must be a non-empty string");
  const gates = isObj(raw.gates) ? raw.gates : null;
  if (!gates) p("gates must be an object");
  else
    for (const k of GATE_KEYS)
      if (!isNonNegInt(gates[k])) p(`gates.${k} must be a non-negative integer`);
  if (!Array.isArray(raw.images)) {
    p("images must be an array");
    return out;
  }
  const maxImageBytes =
    gates && isPosInt(gates.maxImageBytes) ? gates.maxImageBytes : Infinity;
  const ids = new Map();
  const files = new Map();
  const slots = new Map();
  raw.images.forEach((e, i) => {
    const label = `images[${i}]${isObj(e) && typeof e.id === "string" ? ` (${e.id})` : ""}`;
    for (const m of entryProblems(e, ctx, { maxImageBytes })) p(`${label}: ${m}`);
    if (!isObj(e)) return;
    if (typeof e.id === "string") {
      if (ids.has(e.id)) p(`${label}: duplicate id (also images[${ids.get(e.id)}])`);
      ids.set(e.id, i);
    }
    for (const f of [e.file, isObj(e.thumb) ? e.thumb.file : null]) {
      if (typeof f !== "string") continue;
      if (files.has(f)) p(`${label}: duplicate file ${f} (also images[${files.get(f)}])`);
      files.set(f, i);
    }
    if (e.status === "approved" && Array.isArray(e.placements))
      for (const pl of e.placements) {
        if (!isObj(pl)) continue;
        const key = `${pl.route} ${pl.slot} ${pl.order}`;
        if (slots.has(key))
          p(
            `${label}: two approved entries occupy ${key} (also images[${slots.get(key)}])`,
          );
        slots.set(key, i);
      }
  });
  return out;
}
