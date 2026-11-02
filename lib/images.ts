/**
 * images.ts — the site's accessors for content/images/manifest.json.
 *
 * The manifest is WRITTEN by the fleet toolkit (Media Studio/page-images `stage` / `install`) and
 * only READ here. It is validated at module init against the rules in
 * scripts/images/lib/manifest-rules.mjs — the same module `scripts/images/check-images-out.mjs`
 * runs on the export — so a manifest that breaks a rule cannot render a page, let alone ship.
 *
 * WHAT A PAGE MAY SHOW. `approved` entries always. `candidate` entries only when the build or dev
 * server runs with `IMAGES_DRAFT=1` (they are served from /images/_candidates/, which the gate
 * prunes from a non-draft export). `rejected` and `retired` entries never render. Nothing in this
 * file decides WHICH image goes where — that is the manifest's `placements`, authored upstream from
 * content/images/plan.json — it only answers "what renders at (route, slot) right now".
 *
 * Renderings are illustrations, never evidence (contract §0): nothing exported here feeds JSON-LD
 * or og:image, and `check-images-out.mjs` fails the build if an /images/ path ever appears in one.
 */
import { cities, services, type CitySlug, type ServiceSlug } from "@/lib/site-config";
import { articles } from "@/content/articles";
import manifestJson from "@/content/images/manifest.json";
import {
  EXCLUDED_ROUTES,
  PHONE_MEDIA,
  isVisible,
  manifestProblems,
  phoneSrcOf,
  srcOf as srcOfEntry,
  thumbSrcOf,
} from "@/scripts/images/lib/manifest-rules.mjs";

export { PHONE_MEDIA };

export type ImageStatus = "candidate" | "approved" | "rejected" | "retired";
export type SlotId =
  | "main"
  | "detail"
  | "work"
  | "strip-1"
  | "strip-2"
  | "strip-3"
  | "pair-1"
  | "pair-2"
  | "team"
  | "story"
  | "survey"
  | "layers"
  | "lead"
  | "mid"
  | "end"
  | "supplied"
  | "generated";
export type SizeClass = "large" | "half" | "tile" | "thumb";
export type Phase = "done" | "in-progress" | "diagnosis" | "materials";
export type PersonId = "nissim" | "shimi";

export interface Placement {
  route: string;
  slot: SlotId;
  order: number;
}

export type Provenance =
  | {
      kind: "ai-generated";
      tool: string;
      model: string;
      created: string;
      prompt: string;
      promptSha: string;
      masterSha?: string | null;
      refs: readonly string[];
    }
  | {
      kind: "owner-supplied";
      received: string;
      /** Always false: the four supplied originals were AI-made per the owner (contract §0). */
      originAsserted: false;
      note?: string | null;
    };

export interface Watermark {
  logo: "white" | "navy";
  corner: "bottom-right";
  widthPct: number;
}

export interface AutomatedReview {
  verdict: "pass" | "pass-with-note" | "regenerate" | "reject";
  codes: readonly unknown[];
  judges?: Record<string, string>;
  checkedAt: string;
}

export interface OwnerReview {
  decision: "approved" | "rejected" | "regenerate";
  by: string;
  at: string;
  note?: string | null;
}

export interface ImageThumb {
  file: string;
  width: number;
  height: number;
  bytes?: number;
  sha256?: string;
}

/** The smaller copy phones load; written after install by the toolkit's phone-copies.mjs. */
export interface ImagePhone {
  file: string;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
}

export interface ImageEntry {
  id: string;
  file: string;
  legacySrc: string | null;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  sizeClass: SizeClass;
  alt: string;
  caption: string | null;
  altEn: string | null;
  thumb: ImageThumb | null;
  placements: readonly Placement[];
  status: ImageStatus;
  people: readonly PersonId[];
  phase: Phase | null;
  service: ServiceSlug | null;
  city: CitySlug | null;
  provenance: Provenance;
  watermark: Watermark | null;
  review: { automated: AutomatedReview | null; owner: OwnerReview | null };
  approved: string | null;
  retired: string | null;
  /** Consent withdrawn: the day the written notice arrived. Every file of this entry is gone. */
  revoked?: string | null;
  phone?: ImagePhone | null;
}

export interface ImageGates {
  minPerContentPage: number;
  maxImageBytes: number;
  maxPageImageBytes: number;
  maxTotalBytes: number;
}

export interface ImageManifest {
  version: 1;
  site: string;
  gates: ImageGates;
  images: readonly ImageEntry[];
}

/** What a component receives: resolved src, the text, and enough to decide the markup. */
export interface PlacedImage {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  status: ImageStatus;
  service: ServiceSlug | null;
  people: readonly PersonId[];
  /** The derived 480-px thumbnail (blog index cards), when the toolkit produced one. */
  thumb?: { src: string; width: number; height: number };
  /** The smaller copy for phones. Absent on a candidate: it is made after install. */
  phone?: { src: string; width: number; height: number };
}

/** `IMAGES_DRAFT=1` — read at build/dev time in RSC, like the live-kit's LIVE_DRAFT. */
export const imagesDraftMode = process.env.IMAGES_DRAFT === "1";

/**
 * Every route that may carry a content image: the 47 of contract §2, derived from the same arrays
 * the routes are generated from, minus the six excluded routes. A placement naming anything else
 * fails validation below.
 */
export function contentRoutes(): readonly string[] {
  const all = [
    "/",
    "/services/",
    ...services.map((s) => `/services/${s.slug}/`),
    "/areas/",
    ...cities.map((c) => `/areas/${c.slug}/`),
    "/about/",
    "/contact/",
    "/pricing/",
    "/faq/",
    "/gallery/",
    "/blog/",
    ...articles.map((a) => `/blog/${a.slug}/`),
  ];
  return all.filter((r) => !EXCLUDED_ROUTES.includes(r));
}

/**
 * Runtime validation of the imported JSON. The assertion signature is what narrows `unknown` to
 * `ImageManifest` — a cast backed by every rule in manifest-rules.mjs, not a bare `as`.
 */
function assertManifest(raw: unknown): asserts raw is ImageManifest {
  const problems = manifestProblems(raw, {
    contentRoutes: contentRoutes(),
    cityNames: cities.map((c) => c.name),
    citySlugs: cities.map((c) => c.slug),
    serviceSlugs: services.map((s) => s.slug),
  });
  if (problems.length > 0) {
    throw new Error(
      `images manifest: ${problems.length} problem(s) in content/images/manifest.json\n  - ${problems.join("\n  - ")}`,
    );
  }
}

const raw: unknown = manifestJson;
assertManifest(raw);

/** The validated manifest. Read-only; the toolkit owns the file. */
export const imageManifest: ImageManifest = raw;
export const imageGates: ImageGates = imageManifest.gates;

/** Public path for an entry: legacySrc wins; approved → /images/<file>; candidate → /images/_candidates/<file>. */
export function srcOf(entry: ImageEntry): string {
  return srcOfEntry(entry);
}

const visible: readonly ImageEntry[] = imageManifest.images.filter((e) =>
  isVisible(e, imagesDraftMode),
);

function place(entry: ImageEntry): PlacedImage {
  const thumbSrc = thumbSrcOf(entry);
  const placed: PlacedImage = {
    id: entry.id,
    src: srcOf(entry),
    width: entry.width,
    height: entry.height,
    alt: entry.alt,
    caption: entry.caption,
    status: entry.status,
    service: entry.service,
    people: entry.people,
  };
  if (entry.thumb && thumbSrc) {
    placed.thumb = {
      src: thumbSrc,
      width: entry.thumb.width,
      height: entry.thumb.height,
    };
  }
  const phoneSrc = phoneSrcOf(entry);
  if (entry.phone && phoneSrc) {
    placed.phone = {
      src: phoneSrc,
      width: entry.phone.width,
      height: entry.phone.height,
    };
  }
  return placed;
}

/** Every visible image placed at (route, slot), in placement order. Empty when none. */
export function imagesFor(route: string, slot: SlotId): PlacedImage[] {
  const placed = visible
    .flatMap((e) =>
      e.placements
        .filter((p) => p.route === route && p.slot === slot)
        .map((p) => ({ order: p.order, image: place(e) })),
    )
    .sort((a, b) => a.order - b.order);
  // Draft mode previews a candidate IN PLACE of the approved image it would replace (the three
  // service pages still carry a legacy main until install swaps it); production never sees a
  // candidate, so this branch is dead there.
  if (imagesDraftMode && placed.some((x) => x.image.status === "candidate")) {
    const taken = new Set<number>();
    const out: PlacedImage[] = [];
    for (const x of placed.filter((x) => x.image.status === "candidate")) {
      taken.add(x.order);
      out.push(x.image);
    }
    for (const x of placed)
      if (x.image.status !== "candidate" && !taken.has(x.order)) out.push(x.image);
    return out;
  }
  return placed.map((x) => x.image);
}

/** The first visible image at (route, slot), or undefined — the common single-figure case. */
export function imageFor(route: string, slot: SlotId): PlacedImage | undefined {
  return imagesFor(route, slot)[0];
}

/** The tiles of a page's strip or pair, in slot order (strip-1..3, then pair-1..2). */
export function stripFor(route: string): PlacedImage[] {
  const slots: SlotId[] = ["strip-1", "strip-2", "strip-3", "pair-1", "pair-2"];
  return slots.flatMap((slot) => imagesFor(route, slot));
}

/**
 * Hebrew names of the services that have an APPROVED rendering in the gallery's generated group,
 * in `services` order. Drives the derived gallery paragraph on service pages (contract §7).
 * Empty until the first batch is installed.
 */
export function galleryServiceNames(): readonly string[] {
  const slugs = new Set<ServiceSlug>();
  for (const e of imageManifest.images) {
    if (e.status !== "approved" || !e.service) continue;
    if (e.placements.some((p) => p.route === "/gallery/" && p.slot === "generated"))
      slugs.add(e.service);
  }
  return services.filter((s) => slugs.has(s.slug)).map((s) => s.name);
}

/**
 * Whether any approved entry is a rendering. The footer line and the llms.txt note hang on this,
 * so the live site reads exactly as before until the first batch ships.
 */
export function hasApprovedRenderings(): boolean {
  return imageManifest.images.some(
    (e) => e.status === "approved" && e.provenance.kind === "ai-generated",
  );
}
