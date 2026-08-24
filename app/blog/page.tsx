import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * `noindex` until the first article ships.
 *
 * This route previously rendered "תכני הבלוג בדרך 🔶 — בקרוב נעלה כאן מאמרים" and sat in the
 * sitemap with zero inbound internal links, i.e. an indexed empty page (backlog §7.4, §3.9).
 * Cleaned 2026-08-17 and removed from the sitemap.
 *
 * To restore: build /blog/[slug]/ per the `new-article` skill (typed blocks in content/articles/,
 * Article + BreadcrumbList + FAQPage schema), list the articles here, re-add the sitemap path and
 * drop the `robots` block. Author attribution ships as the Organization until a real person is
 * named — never invent a byline (docs/business-facts.md §B).
 */
export const metadata: Metadata = {
  alternates: { canonical: "/blog/" },
  robots: { index: false, follow: true },
  title: "בלוג",
  description:
    "מדריכים על איטום גגות, איתור נזילות והכנת הגג לחורף. המדריכים הראשונים בהכנה.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        title="בלוג"
        crumbs={[{ label: "בית", href: "/" }, { label: "בלוג" }]}
      />
      <Section tone="white">
        <p className="mx-auto max-w-2xl text-center text-gray-600">
          אנחנו מכינים מדריכים על איטום, איתור נזילות והכנת הגג לחורף. עד שהם יעלו — יש
          לכם שאלה על הגג שלכם? אנחנו זמינים בטלפון ובוואטסאפ.
        </p>
      </Section>
      <FinalCta />
    </>
  );
}
