import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  title: "גלריה — לפני ואחרי",
  description:
    "תיעוד עבודות איטום גגות של גגוליין — תמונות לפני ואחרי מהשטח בתל אביב והמרכז.",
};

// 🔶 Placeholder grid — replace with real before/after project photos before launch.
const placeholders = Array.from({ length: 6 });

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="גלריה — לפני ואחרי"
        subtitle="תיעוד עבודות מהשטח. 🔶 התמונות כאן זמניות ויוחלפו בתמונות אמיתיות מהפרויקטים."
        crumbs={[{ label: "בית", href: "/" }, { label: "גלריה" }]}
      />
      <Section tone="white">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((_, i) => (
            <div
              key={i}
              className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm font-medium text-gray-400"
            >
              לפני / אחרי 🔶
            </div>
          ))}
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
