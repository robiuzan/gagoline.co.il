import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  title: "בלוג",
  description: "טיפים ומדריכים על איטום גגות, מניעת נזילות והכנת הגג לחורף.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        title="בלוג"
        subtitle="טיפים ומדריכים על איטום, נזילות והכנת הגג לחורף."
        crumbs={[{ label: "בית", href: "/" }, { label: "בלוג" }]}
      />
      <Section tone="white">
        <p className="mx-auto max-w-2xl text-center text-gray-500">
          תכני הבלוג בדרך 🔶 — בקרוב נעלה כאן מאמרים ומדריכים. בינתיים, יש לכם שאלה? אנחנו
          זמינים בטלפון ובוואטסאפ.
        </p>
      </Section>
      <FinalCta />
    </>
  );
}
