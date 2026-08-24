import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import { regions, citiesInRegion } from "@/lib/site-config";
import { areasContent, serviceCards } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * The service-area hub.
 *
 * This route did not exist until 2026-08-24, and its absence caused four separate defects at once
 * (backlog §5.5, §3.6, §9.6): the 23-page city silo had no root, `navItems` spent the sitewide
 * "אזורי שירות" anchor on a single city, every city page's middle breadcrumb pointed at **itself**,
 * and there was nowhere to carry the coverage prose. One page closes all four.
 *
 * Title is the bare subject — the root template in app/layout.tsx appends the brand.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/areas/" },
  title: "אזורי שירות",
  description:
    "איטום גגות בתל אביב והמרכז — גוש דן, השרון ודרום המרכז, ברדיוס של עד כ-50 ק״מ. רשימת אזורי השירות המלאה ומה מאפיין את הגגות בכל אזור.",
};

export default function AreasPage() {
  return (
    <>
      <PageHeader
        title="אזורי שירות — איטום גגות בתל אביב והמרכז"
        crumbs={[{ label: "בית", href: "/" }, { label: "אזורי שירות" }]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          {/* Answer block: question-form H2 + a self-contained 40–60 word answer
              (docs/content-standards.md §5). This is the span a featured snippet lifts. */}
          <h2 className="font-heading text-xl font-bold text-primary">
            {areasContent.answerQ}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-700">
            {areasContent.answerA}
          </p>

          {areasContent.intro.map((p) => (
            <p key={p} className="mt-4 text-gray-700">
              {p}
            </p>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-primary">
            הערים שאנחנו עובדים בהן
          </h2>

          {regions.map((region) => (
            <div key={region.id} className="mt-8 first:mt-6">
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
                <MapPin className="h-4 w-4 text-accent-700" aria-hidden />
                {region.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {areasContent.regionNotes[region.id]}
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {citiesInRegion(region.id).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/areas/${c.slug}/`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary-600"
                    >
                      איטום גגות ב{c.name}
                      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="mt-10 text-gray-700">{areasContent.outro}</p>
        </div>
      </Section>

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-primary">
            מה אנחנו עושים בכל האזורים האלה
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {serviceCards.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}/`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary-600"
                >
                  {s.name}
                  <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
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
