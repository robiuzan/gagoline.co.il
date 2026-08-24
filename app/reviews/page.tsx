import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * `noindex` until real reviews exist.
 *
 * This route previously rendered three invented five-star testimonials authored
 * "לקוח/ה — להחלפה 🔶" (backlog §7.1). They were deleted 2026-08-17. The route is kept — rather
 * than 404'd — because it is already indexed, but it is removed from the sitemap and from all
 * sitewide navigation so nothing points at an empty page.
 *
 * To restore: add the `reviews` array to lib/content.ts (every entry needs a resolvable public
 * `sourceUrl`), render it here, re-add the nav/footer entries and the sitemap path, drop the
 * `robots` block below, and only then consider Review/AggregateRating JSON-LD
 * (docs/schema-graph.md §4.1). Blocked on docs/business-facts.md §A.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/reviews/" },
  robots: { index: false, follow: true },
  title: "המלצות",
  description:
    "המלצות לקוחות על גגוליין — איטום גגות בתל אביב והמרכז. הדף בהכנה ויתעדכן בביקורות אמיתיות.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="לקוחות ממליצים"
        crumbs={[{ label: "בית", href: "/" }, { label: "המלצות" }]}
      />
      <Section tone="white">
        <p className="mx-auto max-w-2xl text-center text-gray-600">
          אנחנו אוספים ביקורות מלקוחות שביצענו אצלם עבודה, והן יעלו לכאן. בינתיים — לכל
          שאלה על הגג שלכם אנחנו זמינים בטלפון ובוואטסאפ.
        </p>
      </Section>
      <FinalCta />
    </>
  );
}
