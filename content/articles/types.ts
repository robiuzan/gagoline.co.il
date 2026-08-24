/**
 * The article block model — per the `new-article` skill.
 *
 * WHY TYPED BLOCKS RATHER THAN MDX: no new dependency and no second build step in a repo whose
 * build is already the release gate; strict TS and `noUncheckedIndexedAccess` stay meaningful; and
 * — the real reason — `FAQPage` and the answer block are DERIVED from the `faq` and `answer` blocks,
 * so the schema cannot drift from the copy as it is edited. That is the same property that makes
 * PageHeader's BreadcrumbList trustworthy: one source, rendered and marked up from the same array.
 */
import type { ServiceSlug, CitySlug } from "@/lib/site-config";
import type { RichText } from "@/lib/service-depth";

export type Block =
  | { kind: "paragraph"; text: string }
  /** A paragraph that can carry in-copy links. Rendered by components/ui/Prose.tsx. */
  | { kind: "rich"; parts: RichText }
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; ordered?: boolean; items: readonly string[] }
  | { kind: "table"; head: readonly string[]; rows: readonly (readonly string[])[] }
  /** The AEO block — question + a self-contained answer. Drives the opening and is citable. */
  | { kind: "answer"; q: string; a: string }
  /** Derives FAQPage. Every question here renders visibly, so the markup matches the page. */
  | { kind: "faq"; items: readonly { q: string; a: string }[] }
  | { kind: "callout"; tone: "note" | "warn"; text: string }
  | { kind: "cta"; text: string };

export interface Article {
  slug: string;
  /** The question, verbatim. Becomes the <h1>. */
  title: string;
  description: string;
  /** ISO date. Real, never back-dated to fake a publishing history. */
  datePublished: string;
  dateModified: string;
  blocks: readonly Block[];
  relatedServices: readonly ServiceSlug[];
  relatedCities?: readonly CitySlug[];
}
