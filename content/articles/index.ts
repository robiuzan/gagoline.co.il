/**
 * The article registry.
 *
 * Adding an article means importing it here — `generateStaticParams`, the `/blog/` index and
 * `app/sitemap.ts` all read from this one array, so a new piece cannot ship half-wired. That is a
 * deliberate response to the sitemap being hand-maintained (backlog §1.3): articles at least are
 * registered once.
 *
 * Ordered newest-first for display. `getArticle` returns `undefined` for an unknown slug, which the
 * route turns into a 404 — with `noUncheckedIndexedAccess` on, that is enforced by the compiler.
 */
import type { Article } from "./types";
import { article as findRoofLeakSource } from "./find-roof-leak-source";
import { article as whyRoofSealingFailed } from "./why-roof-sealing-failed";
import { article as tarringVsBituminousSheets } from "./tarring-vs-bituminous-sheets";
import { article as howLongRoofSealingLasts } from "./how-long-roof-sealing-lasts";
import { article as sealTiledRoofWithoutLifting } from "./seal-tiled-roof-without-lifting";
import { article as roofSealingBeforeWinter } from "./roof-sealing-before-winter";
import { article as dampWallOrRoof } from "./damp-wall-or-roof";

export const articles: readonly Article[] = [
  findRoofLeakSource,
  whyRoofSealingFailed,
  roofSealingBeforeWinter,
  tarringVsBituminousSheets,
  howLongRoofSealingLasts,
  sealTiledRoofWithoutLifting,
  dampWallOrRoof,
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/**
 * Reverse indexes — the edge that keeps a new article from shipping as a near-orphan.
 *
 * The first attempt at this wave linked articles ONLY from the /blog/ index, which put all seven at
 * inbound degree 1 and failed `npm run links:check` (docs/link-graph.md §3 floor of 4). That is the
 * check doing its job: an article nothing links to contextually is a page the site does not vouch
 * for. `relatedServices` / `relatedCities` are declared on each article, so the links can be
 * generated in both directions from one source instead of being hand-maintained on 31 pages.
 */
export function articlesForService(slug: string): readonly Article[] {
  return articles.filter((a) => (a.relatedServices as readonly string[]).includes(slug));
}

export function articlesForCity(slug: string): readonly Article[] {
  return articles.filter((a) => (a.relatedCities ?? []).some((c) => c === slug));
}

export type { Article, Block } from "./types";
