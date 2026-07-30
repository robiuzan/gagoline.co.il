import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cities, type CitySlug } from "@/lib/site-config";
import { serviceCards } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

export function generateStaticParams(): { city: CitySlug }[] {
  return cities.map((c) => ({ city: c.slug }));
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = cities.find((c) => c.slug === params.city);
  if (!city) return {};
  return {
    alternates: { canonical: `/areas/${city.slug}/` },
    title: `איטום גגות ב${city.name} | אחריות בכתב + מחיר שקוף`,
    description: `קבלן איטום גגות ב${city.name} — איתור נזילות, זיפות ויריעות ביטומניות, אחריות בכתב ומחיר שקוף. שירות מקצועי מ-2014.`,
  };
}

export default function AreaPage({ params }: { params: { city: string } }) {
  const city = cities.find((c) => c.slug === params.city);
  if (!city) notFound();

  return (
    <>
      <PageHeader
        title={`איטום גגות ב${city.name}`}
        subtitle={`אחריות בכתב, מחיר שקוף ואבחון מדויק של מקור הנזילה — שירות איטום מקצועי ב${city.name} והסביבה.`}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "אזורי שירות", href: `/areas/${city.slug}` },
          { label: city.name },
        ]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-700">
            מחפשים קבלן איטום גגות אמין ב{city.name}? בגגוליין אנחנו מאתרים את מקור הנזילה
            האמיתי, אוטמים בחומרים מתקדמים ומשאירים אתכם עם גג יבש ואחריות בכתב — בלי
            הפתעות במחיר ובלי טלאים שמחזיקים עד הגשם הבא.
          </p>
          <p className="mt-4 text-gray-700">
            אנחנו נותנים שירות לבעלי בתים, ועדי בתים ועסקים ב{city.name} ובכל אזור המרכז,
            כולל מענה מהיר לנזילות חורף.
          </p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            השירותים שלנו ב{city.name}
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {serviceCards.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary"
                >
                  {s.name}
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
